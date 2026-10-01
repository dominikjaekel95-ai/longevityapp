#!/usr/bin/env node
/**
 * Claims-Prüfung: durchsucht alle nutzerseitigen Textquellen der App auf verbotene Formulierungen
 * (scripts/forbidden-terms.json) und prüft die Struktur von src/content/claims.ts.
 *
 * Aufruf: npm run check:claims   (Teil von npm run check:all; ein Treffer = Exit 1 = Build bricht ab)
 *
 * Geprüft wird der Quelltext ohne Kommentare, damit Kommentare die Regeln benennen dürfen, ohne selbst Treffer zu
 * sein. Nutzertexte stehen ausschließlich in Stringliteralen, deshalb reicht die Prüfung des kommentarfreien Codes.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(root, 'scripts/forbidden-terms.json'), 'utf8'));

const forbidden = config.verboten.map((e) => ({ ...e, rx: new RegExp(e.muster, 'iu') }));
const review = config.pruefen.map((e) => ({ ...e, rx: new RegExp(e.muster, 'iu') }));
const exceptions = new Set(config.ausnahmen ?? []);

let problems = 0;
let warnings = 0;

function listFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else out.push(full);
  }
  return out;
}

function matchesGlob(rel, glob) {
  // Unterstützt nur die hier benutzten Formen: "dir/**/*.ext" und einzelne Dateien.
  const m = glob.match(/^(.*?)\/\*\*\/\*\.(\w+)$/);
  if (m) return rel.startsWith(m[1] + '/') && rel.endsWith('.' + m[2]);
  return rel === glob;
}

function stripComments(src, ext) {
  if (ext === '.md' || ext === '.json') return src;
  // Blockkommentare und Zeilenkommentare entfernen; Zeilenumbrüche bleiben erhalten, damit Zeilennummern stimmen.
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (s) => s.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, (s, pre) => pre + ' '.repeat(s.length - pre.length));
}

const files = listFiles(root)
  .map((f) => path.relative(root, f))
  .filter((rel) => config.dateien.some((g) => matchesGlob(rel, g)))
  .filter((rel) => !exceptions.has(rel));

/**
 * Felder, die per ausnahme_claims als Ausschlussliste gekennzeichnet sind (content/README.md, Regel 3):
 * Zeilen innerhalb der Listen vorab_klaeren und punkte werden für Krankheitsbegriffe nicht geprüft.
 */
function exemptLines(text) {
  const exempt = new Set();
  if (!/^ausnahme_claims:/m.test(text)) return exempt;
  const lines = text.split('\n');
  let inList = false;
  lines.forEach((line, i) => {
    if (/^(vorab_klaeren|punkte):/.test(line)) {
      inList = true;
      return;
    }
    if (inList && /^\s+-\s/.test(line)) exempt.add(i);
    else if (inList && !/^\s/.test(line)) inList = false;
  });
  return exempt;
}

for (const rel of files) {
  const ext = path.extname(rel);
  const text = stripComments(fs.readFileSync(path.join(root, rel), 'utf8'), ext);
  const exempt = ext === '.md' ? exemptLines(text) : new Set();
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const e of forbidden) {
      if (e.krankheitsbezug && exempt.has(i)) continue;
      const m = line.match(e.rx);
      if (m) {
        problems++;
        console.log(`FEHLER  ${rel}:${i + 1} | ${e.label} | …${context(line, m.index)}…`);
      }
    }
    for (const e of review) {
      if (exempt.has(i)) continue;
      const m = line.match(e.rx);
      if (m) {
        warnings++;
        console.log(`PRÜFEN  ${rel}:${i + 1} | ${e.label} | …${context(line, m.index)}…`);
      }
    }
  });
}

function context(line, idx) {
  const start = Math.max(0, idx - 30);
  return line.slice(start, idx + 40).trim();
}

// Struktur von claims.ts: jeder Eintrag braucht de und en, kein leerer Text.
const claimsPath = path.join(root, 'src/content/claims.ts');
if (!fs.existsSync(claimsPath)) {
  problems++;
  console.log('FEHLER  src/content/claims.ts fehlt');
} else {
  const src = fs.readFileSync(claimsPath, 'utf8');
  const entries = [...src.matchAll(/^\s{2}([a-zA-Z0-9_]+):\s*\{/gm)].map((m) => m[1]);
  for (const key of entries) {
    const block = src.slice(src.indexOf(`  ${key}: {`));
    const end = block.indexOf('\n  }');
    const body = block.slice(0, end);
    if (!/\bde:\s*['"`]/.test(body) || !/\ben:\s*['"`]/.test(body)) {
      problems++;
      console.log(`FEHLER  src/content/claims.ts | Eintrag „${key}“ braucht de und en`);
    }
  }
  if (entries.length === 0) {
    problems++;
    console.log('FEHLER  src/content/claims.ts | keine Einträge gefunden');
  }
}

console.log(
  `Claims-Prüfung: ${files.length} Dateien, ${problems} Fehler, ${warnings} Hinweise` +
    (problems === 0 ? ' (keine Treffer)' : ''),
);
process.exit(problems > 0 ? 1 : 0);
