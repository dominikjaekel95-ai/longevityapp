#!/usr/bin/env node
/**
 * Liest die Inhalte der Begleitinstanz aus content/ (Format: content/README.md) und schreibt
 * src/content/generated/content.json. Fehlt ein Teil, bleibt der Eintrag leer und die App zeigt Platzhalter.
 *
 * Aufruf: npm run build:content   (Teil von check:all; CI prüft, dass die erzeugte Datei committet ist)
 *
 * Gelesen werden:
 *   content/programme/<id>/programm.md            id, titel, kurz, standard, wochen, status, programm_angaben, vorab_klaeren, hinweise
 *   content/programme/<id>/<locale>/woche-NN.md   woche, titel, status, einleitung, einleitung_quellen, training, checkliste, hinweis
 *   content/uebungen/<locale>/uebungen.md         ablauf, ablauf_quellen, uebungen, sicherheit
 *   content/hinweise/<locale>/aerztlicher-rat.md  titel, punkte, abschluss
 *   content/onboarding/<locale>/bevor-du-startest.md  titel, punkte, abschluss
 *   content/rechtliches/<locale>/einwilligung-art9.md status, version, einwilligungen; Body: ## Bildschirmtext, ## Details
 *   content/quellen.json                          Quellen zu den IDs in quellen-Feldern
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const root = process.cwd();
const contentDir = path.join(root, 'content');
const outFile = path.join(root, 'src/content/generated/content.json');
const LOCALES = ['de', 'en'];
const STATUS = new Set(['entwurf', 'geprueft', 'freigegeben']);

let problems = 0;
const fail = (msg) => {
  problems++;
  console.error(`FEHLER  ${msg}`);
};
const rel = (f) => path.relative(root, f);
const str = (v, fallback = '') => (v === undefined || v === null ? fallback : String(v));
const list = (v) => (Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : []);
const statusOf = (v) => (STATUS.has(str(v)) ? str(v) : 'entwurf');

function readMd(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!m) return { meta: {}, body: raw.trim() };
  let meta = {};
  try {
    meta = YAML.parse(m[1]) ?? {};
  } catch (e) {
    fail(`${rel(file)}: Frontmatter ungültig (${e.message})`);
  }
  return { meta, body: m[2].trim() };
}

/** Absätze eines Markdown-Abschnitts ohne Platzhalterzeilen in eckigen Klammern; Fettung wird entfernt. */
const paragraphs = (text) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').replace(/\*\*/g, '').trim())
    .filter((p) => p && !p.startsWith('[') && !p.startsWith('#'));

/** Zerlegt den Body in Abschnitte nach "## Überschrift". */
function sections(body) {
  const out = {};
  let current = '_';
  for (const line of body.split('\n')) {
    const h = /^##\s+(.+)$/.exec(line.trim());
    if (h) {
      current = h[1].trim().toLowerCase();
      out[current] = out[current] ?? '';
      continue;
    }
    out[current] = (out[current] ?? '') + line + '\n';
  }
  return out;
}

function perLocale(subdir, filename) {
  const found = {};
  for (const locale of LOCALES) {
    const f = path.join(contentDir, subdir, locale, filename);
    if (fs.existsSync(f)) found[locale] = readMd(f);
  }
  return found;
}

const exists = (p) => fs.existsSync(path.join(contentDir, p));

// --- Quellen ---
let quellen = {};
if (exists('quellen.json')) {
  try {
    quellen = JSON.parse(fs.readFileSync(path.join(contentDir, 'quellen.json'), 'utf8'));
  } catch (e) {
    fail(`content/quellen.json ungültig (${e.message})`);
  }
}
const checkQuellen = (ids, where) => {
  for (const id of ids) if (!quellen[id]) fail(`${where}: Quelle „${id}“ fehlt in content/quellen.json`);
  return ids;
};

// --- Programme ---
const programme = {};
if (exists('programme')) {
  const dir = path.join(contentDir, 'programme');
  const ids = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const id of ids) {
    const pdir = path.join(dir, id);
    const prog = { status: 'freigegeben', meta: null, weeks: {} };
    programme[id] = prog;

    const metaFile = path.join(pdir, 'programm.md');
    if (fs.existsSync(metaFile)) {
      const { meta } = readMd(metaFile);
      if (!meta.titel) fail(`${rel(metaFile)}: 'titel' fehlt`);
      if (meta.id && String(meta.id) !== id) fail(`${rel(metaFile)}: 'id' (${meta.id}) weicht vom Ordnernamen ab`);
      const angaben = Array.isArray(meta.programm_angaben) ? meta.programm_angaben : [];
      prog.meta = {
        title: { de: str(meta.titel, id), en: str(meta.titel_en, str(meta.titel, id)) },
        summary: { de: str(meta.kurz), en: str(meta.kurz_en, str(meta.kurz)) },
        weeks: Number(meta.wochen ?? 12),
        available: meta.verfuegbar !== false,
        default: meta.standard === true,
        status: statusOf(meta.status),
        settings: angaben.map((a, i) => {
          const typ = str(a?.typ, 'text');
          const type = typ === 'datum' ? 'date' : typ === 'zahl' ? 'number' : 'text';
          if (!a?.id || !a?.frage) fail(`${rel(metaFile)}: programm_angaben ${i + 1}: 'id' und 'frage' sind Pflicht`);
          return {
            key: str(a?.id, `angabe${i + 1}`),
            type,
            label: { de: str(a?.frage), en: str(a?.frage_en, str(a?.frage)) },
            required: a?.pflicht === true,
          };
        }),
        vorabKlaeren: list(meta.vorab_klaeren),
        hinweise: list(meta.hinweise),
      };
      if (prog.meta.status !== 'freigegeben') prog.status = prog.meta.status;
    }

    for (const locale of LOCALES) {
      const ldir = path.join(pdir, locale);
      if (!fs.existsSync(ldir)) continue;
      const weeks = [];
      for (const f of fs.readdirSync(ldir).filter((n) => /^woche-\d+\.md$/.test(n)).sort()) {
        const file = path.join(ldir, f);
        const { meta } = readMd(file);
        const week = Number(meta.woche ?? f.match(/\d+/)?.[0]);
        if (!Number.isInteger(week) || week < 0) fail(`${rel(file)}: 'woche' fehlt oder ungültig`);
        if (!meta.titel) fail(`${rel(file)}: 'titel' fehlt`);
        const wstatus = statusOf(meta.status);
        if (wstatus !== 'freigegeben' && locale === 'de') prog.status = prog.status === 'entwurf' ? 'entwurf' : wstatus;
        const tr = meta.training && typeof meta.training === 'object' ? meta.training : null;
        const tasks = Array.isArray(meta.checkliste) ? meta.checkliste : [];
        weeks.push({
          week,
          title: str(meta.titel),
          status: wstatus,
          intro: str(meta.einleitung),
          introQuellen: checkQuellen(list(meta.einleitung_quellen), rel(file)),
          training: tr
            ? {
                saetze: Number(tr.saetze ?? 0),
                wiederholungen: Number(tr.wiederholungen ?? 0),
                hinweis: str(tr.hinweis),
                quellen: checkQuellen(list(tr.quellen), rel(file)),
              }
            : null,
          tasks: tasks.map((t, i) => {
            if (!t || typeof t !== 'object' || !t.id || !t.text) fail(`${rel(file)}: checkliste ${i + 1}: 'id' und 'text' sind Pflicht`);
            return { id: str(t?.id, `w${week}-${i + 1}`), text: str(t?.text), quellen: checkQuellen(list(t?.quellen), rel(file)) };
          }),
          hinweis: meta.hinweis ? str(meta.hinweis) : null,
        });
      }
      weeks.sort((a, b) => a.week - b.week);
      const seen = new Set();
      for (const w of weeks) {
        for (const t of w.tasks) {
          if (seen.has(t.id)) fail(`Programm ${id} (${locale}): Checklisten-ID ${t.id} doppelt`);
          seen.add(t.id);
        }
      }
      prog.weeks[locale] = weeks;
    }
    if (!prog.weeks.de) fail(`Programm ${id}: keine deutschen Wochenkarten`);
  }
  if (Object.values(programme).filter((p) => p.meta?.default).length > 1) fail('Mehr als ein Programm ist als Standard markiert');
}

// --- Übungen ---
const uebungen = {};
{
  const found = perLocale('uebungen', 'uebungen.md');
  for (const [locale, { meta }] of Object.entries(found)) {
    const items = Array.isArray(meta.uebungen) ? meta.uebungen : [];
    uebungen[locale] = {
      status: statusOf(meta.status),
      ablauf: str(meta.ablauf),
      ablaufQuellen: checkQuellen(list(meta.ablauf_quellen), 'uebungen.md'),
      uebungen: items.map((u, i) => ({
        id: str(u?.id, `uebung${i + 1}`),
        nr: Number(u?.nr ?? i + 1),
        name: str(u?.name),
        zuhause: str(u?.zuhause),
        studio: str(u?.studio),
        trainiert: str(u?.trainiert),
      })),
      sicherheit: list(meta.sicherheit),
    };
    if (items.length === 0) fail(`uebungen (${locale}): keine Übungen`);
  }
}

// --- Hinweise und Onboarding ---
const noteOf = (found) => {
  const out = {};
  for (const [locale, { meta }] of Object.entries(found)) {
    out[locale] = { title: str(meta.titel), items: list(meta.punkte), closing: meta.abschluss ? str(meta.abschluss) : null, status: statusOf(meta.status) };
    if (out[locale].items.length === 0) fail(`${str(meta.titel)} (${locale}): keine Punkte`);
  }
  return out;
};
const aerztlicherRat = noteOf(perLocale('hinweise', 'aerztlicher-rat.md'));
const bevorDuStartest = noteOf(perLocale('onboarding', 'bevor-du-startest.md'));

// --- Einwilligung ---
const einwilligung = {};
{
  const found = perLocale('rechtliches', 'einwilligung-art9.md');
  for (const [locale, { meta, body }] of Object.entries(found)) {
    const secs = sections(body);
    const titleLine = /^#\s+(.+)$/m.exec(body);
    const items = Array.isArray(meta.einwilligungen) ? meta.einwilligungen : [];
    einwilligung[locale] = {
      status: statusOf(meta.status),
      version: str(meta.version, 'ohne-version'),
      scope: str(meta.geltung),
      title: titleLine ? titleLine[1].trim() : 'Einwilligung',
      screen: paragraphs(secs.bildschirmtext ?? secs._ ?? ''),
      details: paragraphs(secs.details ?? ''),
      items: items.map((e, i) => {
        if (!e?.id || !e?.text) fail(`einwilligung (${locale}): Eintrag ${i + 1} braucht 'id' und 'text'`);
        return {
          id: str(e?.id),
          required: e?.pflicht === true,
          active: e?.aktiv !== false,
          text: str(e?.text),
          textVisible: e?.text_sichtbar ? str(e.text_sichtbar) : null,
        };
      }),
    };
    if (!einwilligung[locale].items.some((e) => e.required)) fail(`einwilligung (${locale}): keine Pflicht-Einwilligung`);
    if (einwilligung[locale].screen.length === 0) fail(`einwilligung (${locale}): Bildschirmtext fehlt`);
  }
}

const out = {
  _hinweis: 'Erzeugt von scripts/build-content.mjs aus content/. Nicht von Hand ändern.',
  source: fs.existsSync(contentDir) ? 'content' : 'platzhalter',
  programme,
  uebungen: Object.keys(uebungen).length ? uebungen : null,
  hinweise: { aerztlicherRat: Object.keys(aerztlicherRat).length ? aerztlicherRat : null },
  onboarding: { bevorDuStartest: Object.keys(bevorDuStartest).length ? bevorDuStartest : null },
  einwilligung: Object.keys(einwilligung).length ? einwilligung : null,
  // Nur Kurztitel und URL gelangen in die App; Volltitel und Notizen bleiben in content/quellen.json.
  quellen: Object.fromEntries(Object.entries(quellen).map(([id, q]) => [id, { kurz: str(q?.kurz), url: str(q?.url) }])),
};
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
console.log(
  `Inhalte: ${Object.keys(programme).length} Programm(e), Übungen ${out.uebungen ? 'ja' : 'nein'}, ` +
    `Einwilligung ${out.einwilligung ? 'aus content/' : 'Platzhalter'}, Hinweise ${out.hinweise.aerztlicherRat ? 'ja' : 'nein'}, ` +
    `Onboarding ${out.onboarding.bevorDuStartest ? 'ja' : 'nein'}, ${Object.keys(quellen).length} Quellen, ${problems} Fehler`,
);
process.exit(problems > 0 ? 1 : 0);
