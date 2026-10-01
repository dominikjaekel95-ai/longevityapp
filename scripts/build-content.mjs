#!/usr/bin/env node
/**
 * Liest die Inhalte der Begleitinstanz aus content/ (Markdown mit YAML-Frontmatter) und schreibt
 * src/content/generated/content.json. Fehlt ein Teil, bleibt der Eintrag leer und die App zeigt Platzhalter.
 *
 * Aufruf: npm run build:content   (Teil von check:all; CI prüft, dass die erzeugte Datei committet ist)
 *
 * Erwartete Struktur (Vorschlag der Coding-Instanz; verbindlich wird content/README.md der Begleitinstanz,
 * Abweichungen werden hier nachgezogen):
 *
 *   content/programme/<id>/programm.md            Metadaten des Programms (optional)
 *     ---
 *     titel: "Grundprogramm"        # Pflicht
 *     kurz: "..."                   # ein Satz
 *     wochen: 12
 *     standard: true                # genau ein Programm ist Standard
 *     verfuegbar: true
 *     einstellungen:                # programmspezifische Felder, landen in program_settings (nie im Kern)
 *       - key: letzte_dosis
 *         typ: date                 # date | text | number
 *         label: "..."
 *         hilfe: "..."
 *         pflicht: false
 *     ---
 *
 *   content/programme/<id>/<locale>/woche-NN.md   oder   content/programme/<id>/woche-NN.<locale>.md
 *     ---
 *     woche: 3                      # Pflicht
 *     status: entwurf | freigegeben # optional, Standard entwurf
 *     titel: "..."                  # Pflicht
 *     kurz: "..."                   # optional, ein Satz
 *     aufgaben:                     # optional
 *       - id: w3-protein            # eindeutig im Programm
 *         art: protein              # messen | protein | kraft | alltag
 *         text: "..."
 *     ---
 *     Absätze als Fließtext (werden als Erklärung unter der Checkliste gezeigt).
 *
 *   content/rechtliches/einwilligung/<locale>.md   oder   content/rechtliches/einwilligung.<locale>.md
 *     Frontmatter: status, version, titel, checkbox, alter_checkbox, hinweis
 *     Body: erster Absatz = Einleitung, Aufzählung (- …) = Punkte
 *
 *   content/onboarding/fuer-wen-nicht/<locale>.md  oder   content/onboarding/fuer-wen-nicht.<locale>.md
 *     Frontmatter: titel; Body: Aufzählung = Punkte
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const root = process.cwd();
const contentDir = path.join(root, 'content');
const outFile = path.join(root, 'src/content/generated/content.json');
const LOCALES = ['de', 'en'];
const KINDS = new Set(['messen', 'protein', 'kraft', 'alltag']);
const FIELD_TYPES = new Set(['date', 'text', 'number']);

let problems = 0;
const fail = (msg) => {
  problems++;
  console.error(`FEHLER  ${msg}`);
};

function readMd(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!m) return { meta: {}, body: raw.trim() };
  let meta = {};
  try {
    meta = YAML.parse(m[1]) ?? {};
  } catch (e) {
    fail(`${path.relative(root, file)}: Frontmatter ungültig (${e.message})`);
  }
  return { meta, body: m[2].trim() };
}

const paragraphs = (body) =>
  body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter((p) => p && !p.startsWith('- '));

const bullets = (body) =>
  body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2).trim());

function findLocaleFile(base, locale) {
  const a = path.join(contentDir, base, `${locale}.md`);
  const b = path.join(contentDir, `${base}.${locale}.md`);
  if (fs.existsSync(a)) return a;
  if (fs.existsSync(b)) return b;
  return null;
}

const str = (v, fallback = '') => (v === undefined || v === null ? fallback : String(v));

// --- Programme ---
const programme = {};
const programDir = path.join(contentDir, 'programme');
if (fs.existsSync(programDir)) {
  const ids = fs
    .readdirSync(programDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  for (const id of ids) {
    const dir = path.join(programDir, id);
    const prog = { status: 'freigegeben', byWeek: new Map(), meta: null };
    programme[id] = prog;

    const metaFile = ['programm.md', 'meta.md', 'index.md'].map((n) => path.join(dir, n)).find((f) => fs.existsSync(f));
    if (metaFile) {
      const { meta } = readMd(metaFile);
      const rel = path.relative(root, metaFile);
      if (!meta.titel) fail(`${rel}: 'titel' fehlt`);
      const fields = Array.isArray(meta.einstellungen) ? meta.einstellungen : [];
      prog.meta = {
        title: { de: str(meta.titel, id), en: str(meta.titel_en, str(meta.titel, id)) },
        summary: { de: str(meta.kurz), en: str(meta.kurz_en, str(meta.kurz)) },
        weeks: Number(meta.wochen ?? 12),
        available: meta.verfuegbar !== false,
        default: meta.standard === true,
        settings: fields.map((f, i) => {
          const typ = str(f?.typ, 'text');
          if (!FIELD_TYPES.has(typ)) fail(`${rel}: Einstellung ${i + 1}: 'typ' muss date, text oder number sein`);
          if (!f?.key || !f?.label) fail(`${rel}: Einstellung ${i + 1}: 'key' und 'label' sind Pflicht`);
          const field = {
            key: str(f?.key, `feld${i + 1}`),
            type: typ,
            label: { de: str(f?.label), en: str(f?.label_en, str(f?.label)) },
            required: f?.pflicht === true,
          };
          if (f?.hilfe) field.help = { de: str(f.hilfe), en: str(f.hilfe_en, str(f.hilfe)) };
          return field;
        }),
      };
    }

    const weekFiles = [];
    for (const locale of LOCALES) {
      const sub = path.join(dir, locale);
      if (fs.existsSync(sub)) {
        for (const f of fs.readdirSync(sub).filter((n) => /^woche-\d+\.md$/.test(n))) {
          weekFiles.push({ locale, file: path.join(sub, f) });
        }
      }
      const flat = new RegExp(`^woche-\\d+\\.${locale}\\.md$`);
      for (const f of fs.readdirSync(dir).filter((n) => flat.test(n))) {
        weekFiles.push({ locale, file: path.join(dir, f) });
      }
    }
    weekFiles.sort((a, b) => a.file.localeCompare(b.file));
    for (const { locale, file } of weekFiles) {
      const { meta, body } = readMd(file);
      const rel = path.relative(root, file);
      const week = Number(meta.woche ?? path.basename(file).match(/\d+/)?.[0]);
      if (!Number.isInteger(week) || week < 0) fail(`${rel}: 'woche' fehlt oder ungültig`);
      if (!meta.titel) fail(`${rel}: 'titel' fehlt`);
      if (str(meta.status, 'entwurf') !== 'freigegeben') prog.status = 'entwurf';
      const entry = prog.byWeek.get(week) ?? {
        week,
        title: { de: '', en: '' },
        summary: { de: '', en: '' },
        body: { de: [], en: [] },
        tasks: [],
      };
      entry.title[locale] = str(meta.titel);
      entry.summary[locale] = str(meta.kurz);
      entry.body[locale] = paragraphs(body);
      const tasks = Array.isArray(meta.aufgaben) ? meta.aufgaben : [];
      tasks.forEach((t, i) => {
        if (!t || typeof t !== 'object') {
          fail(`${rel}: Aufgabe ${i + 1} ist kein Objekt`);
          return;
        }
        const tid = str(t.id, `w${week}-${i + 1}`);
        const kind = str(t.art, 'alltag');
        if (!KINDS.has(kind)) fail(`${rel}: Aufgabe ${tid}: 'art' muss messen, protein, kraft oder alltag sein`);
        let task = entry.tasks.find((x) => x.id === tid);
        if (!task) {
          task = { id: tid, kind, text: { de: '', en: '' } };
          entry.tasks.push(task);
        }
        task.text[locale] = str(t.text);
      });
      prog.byWeek.set(week, entry);
    }
  }
}

const programmeOut = {};
for (const [id, p] of Object.entries(programme)) {
  const weeks = [...p.byWeek.values()].sort((a, b) => a.week - b.week);
  const seen = new Set();
  for (const w of weeks) {
    for (const t of w.tasks) {
      if (seen.has(t.id)) fail(`Programm ${id}: Aufgaben-ID ${t.id} doppelt`);
      seen.add(t.id);
      if (!t.text.de) fail(`Programm ${id}, Woche ${w.week}: Aufgabe ${t.id} ohne deutschen Text`);
    }
    if (!w.title.de) fail(`Programm ${id}, Woche ${w.week}: kein deutscher Titel`);
  }
  programmeOut[id] = { status: p.status, meta: p.meta, weeks };
}
const defaults = Object.values(programmeOut).filter((p) => p.meta?.default).length;
if (defaults > 1) fail('Mehr als ein Programm ist als Standard markiert');

// --- Einwilligung ---
let einwilligung = null;
{
  const perLocale = {};
  for (const locale of LOCALES) {
    const file = findLocaleFile('rechtliches/einwilligung', locale);
    if (file) perLocale[locale] = readMd(file);
  }
  if (perLocale.de) {
    const get = (loc, key, fallback = '') => str(perLocale[loc]?.meta?.[key], fallback);
    const de = perLocale.de;
    const en = perLocale.en ?? de;
    const introOf = (b) => paragraphs(b)[0] ?? '';
    einwilligung = {
      status: get('de', 'status', 'entwurf') === 'freigegeben' ? 'freigegeben' : 'entwurf',
      version: get('de', 'version', 'ohne-version'),
      title: { de: get('de', 'titel'), en: get('en', 'titel', get('de', 'titel')) },
      intro: { de: introOf(de.body), en: introOf(en.body) },
      points: { de: bullets(de.body), en: bullets(en.body) },
      checkbox: { de: get('de', 'checkbox'), en: get('en', 'checkbox', get('de', 'checkbox')) },
      ageCheckbox: { de: get('de', 'alter_checkbox'), en: get('en', 'alter_checkbox', get('de', 'alter_checkbox')) },
      draftNotice: { de: get('de', 'hinweis'), en: get('en', 'hinweis', get('de', 'hinweis')) },
    };
    if (!einwilligung.title.de || !einwilligung.checkbox.de) fail('Einwilligung: titel und checkbox sind Pflicht');
    if (einwilligung.points.de.length === 0) fail('Einwilligung: keine Aufzählungspunkte im Text');
  }
}

// --- Onboarding: Für wen nicht ---
let fuerWenNicht = null;
{
  const perLocale = {};
  for (const locale of LOCALES) {
    const file = findLocaleFile('onboarding/fuer-wen-nicht', locale);
    if (file) perLocale[locale] = readMd(file);
  }
  if (perLocale.de) {
    const de = perLocale.de;
    const en = perLocale.en ?? de;
    fuerWenNicht = {
      title: { de: str(de.meta.titel), en: str(en.meta.titel, str(de.meta.titel)) },
      items: { de: bullets(de.body), en: bullets(en.body) },
    };
    if (fuerWenNicht.items.de.length === 0) fail('Für wen nicht: keine Aufzählungspunkte');
  }
}

const out = {
  _hinweis: 'Erzeugt von scripts/build-content.mjs aus content/. Nicht von Hand ändern.',
  source: fs.existsSync(contentDir) ? 'content' : 'platzhalter',
  programme: programmeOut,
  einwilligung,
  onboarding: { fuerWenNicht },
};
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
console.log(
  `Inhalte: ${Object.keys(programmeOut).length} Programm(e), Einwilligung ${einwilligung ? 'aus content/' : 'Platzhalter'}, ` +
    `Für-wen-nicht ${fuerWenNicht ? 'aus content/' : 'fehlt'}, ${problems} Fehler`,
);
process.exit(problems > 0 ? 1 : 0);
