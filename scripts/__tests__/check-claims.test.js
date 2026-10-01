const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');

function runIn(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'claims-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.copyFileSync(path.join(root, 'scripts/forbidden-terms.json'), path.join(dir, 'scripts/forbidden-terms.json'));
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  }
  const res = spawnSync('node', [path.join(root, 'scripts/check-claims.mjs')], { cwd: dir, encoding: 'utf8' });
  return { code: res.status, out: res.stdout + res.stderr };
}

const okClaims = "export const claims = {\n  a: {\n    de: 'Verlauf über Wochen.',\n    en: 'Progress over weeks.',\n  },\n};\n";

describe('check-claims', () => {
  it('ist grün bei sauberen Texten', () => {
    const r = runIn({ 'src/content/claims.ts': okClaims });
    expect(r.code).toBe(0);
    expect(r.out).toContain('0 Fehler');
  });
  it('bricht bei verbotenen Wörtern ab, auch in Kommentaren nicht', () => {
    const bad = okClaims.replace('Verlauf über Wochen.', 'Die App erkennt Muskelabbau.');
    const r = runIn({ 'src/content/claims.ts': bad });
    expect(r.code).toBe(1);
    expect(r.out).toContain('„erkennt“');
    const comment = okClaims + '// Hinweis: „diagnostiziert“ ist verboten\n';
    expect(runIn({ 'src/content/claims.ts': comment }).code).toBe(0);
  });
  it('findet Medikamentennamen in jeder Quelldatei und englische Entsprechungen', () => {
    const r = runIn({ 'src/content/claims.ts': okClaims, 'src/app/x.tsx': "const a = 'Ozempic';" });
    expect(r.code).toBe(1);
    const r2 = runIn({ 'src/content/claims.ts': okClaims.replace('Progress over weeks.', 'The app detects muscle loss.') });
    expect(r2.code).toBe(1);
  });
  it('nimmt Ausschlusslisten mit ausnahme_claims für Krankheitsbegriffe aus, nicht aber Medikamentennamen', () => {
    const md = "---\ntitel: \"Bevor du startest\"\nausnahme_claims: \"Krankheitsbezüge als Ausschluss\"\npunkte:\n  - \"Bist du in Therapie: sprich vorher mit deiner Ärztin.\"\n---\n";
    expect(runIn({ 'src/content/claims.ts': okClaims, 'content/onboarding/de/x.md': md }).code).toBe(0);
    const bad = md.replace("in Therapie", "unter Ozempic");
    expect(runIn({ 'src/content/claims.ts': okClaims, 'content/onboarding/de/x.md': bad }).code).toBe(1);
    const noFlag = md.replace("ausnahme_claims: \"Krankheitsbezüge als Ausschluss\"\n", "");
    expect(runIn({ 'src/content/claims.ts': okClaims, 'content/onboarding/de/x.md': noFlag }).code).toBe(1);
  });
  it('erlaubt „in ärztlicher Behandlung“, verbietet Behandlung als Angebot', () => {
    expect(runIn({ 'src/content/claims.ts': okClaims.replace("Verlauf über Wochen.", "Wenn du in ärztlicher Behandlung bist, frag vorher.") }).code).toBe(0);
    expect(runIn({ 'src/content/claims.ts': okClaims.replace("Verlauf über Wochen.", "Die App unterstützt deine Behandlung.") }).code).toBe(1);
  });
  it('verlangt de und en in claims.ts', () => {
    const r = runIn({ 'src/content/claims.ts': "export const claims = {\n  a: {\n    de: 'Nur deutsch.',\n  },\n};\n" });
    expect(r.code).toBe(1);
  });
});
