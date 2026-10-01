# content/

Alle Texte, die die App anzeigt und die nicht Oberfläche sind: Programme, Übungen, Hinweise, Rechtstexte. Gepflegt von der Begleitinstanz (siehe `docs/ZUSAMMENARBEIT.md`), fachlich gegengelesen von Michael, freigegeben von Dominik. Alles hier ist `status: entwurf`, bis Dominik freigibt.

## Was die App ist

Eine allgemeine Longevity-App: Körperzusammensetzung, Kraft, Ernährung, Verlauf. Der Kern (Onboarding, Check-in, Verlauf, Übungen, Hinweise, Einwilligung) hat keinen Bezug zu einer bestimmten Lebenslage oder einem Medikament.

**Programme sind Anwendungen.** Jedes Programm ist ein Modul unter `programme/<id>/` mit eigenen Wochenkarten. Das Grundprogramm ist Standard. Weitere Programme wählt man im Onboarding oder später, zum Beispiel „Nach dem Absetzen der Abnehmspritze“. Neue Programme (etwa „Kreatin und Krafttraining ab 50“) kommen als neuer Ordner dazu, ohne Änderung am Kern.

## Dateien

| Datei | Inhalt | Wo in der App |
|---|---|---|
| `programme/<id>/programm.md` | Titel, Kurzbeschreibung, Standard ja/nein, Angaben, die das Programm abfragt, Punkte zum Vorab-Klären, programmspezifische Hinweise | Programmauswahl, Programmstart |
| `programme/<id>/de/woche-00.md` … `woche-12.md` | Wochenkarten: Titel, Einleitung, Training, Checkliste, optionaler Hinweis | Wochenkarte der jeweiligen Woche |
| `uebungen/de/uebungen.md` | Sechs Übungen mit Zuhause- und Studio-Variante, Ablauf einer Einheit, Sicherheitshinweise; gilt für alle Programme | Trainingsansicht |
| `quellen.json` | Quellen zu allen IDs in `quellen` (übernommen aus `src/data/sources.ts` der Website) | „Quelle“-Link an Checklistenpunkten |
| `hinweise/de/aerztlicher-rat.md` | Wann ärztlicher Rat nötig ist, Notfall | Einstellungen/Info |
| `onboarding/de/bevor-du-startest.md` | Allgemeine Ausschlüsse und Hinweise vor dem Start | Onboarding, vor der Einwilligung |
| `rechtliches/de/einwilligung-art9.md` | Einwilligungen (Frontmatter) und Bildschirm-/Detailtext (Body) | Onboarding-Schritt Einwilligung, Einstellungen „Datenschutz“ |

Englisch kommt später als `en/` neben `de/`.

## Format

Markdown mit YAML-Frontmatter, der Body ist bei Programmen und Wochenkarten leer.

`programm.md`:

```yaml
id: nach-dem-absetzen-abnehmspritze   # = Ordnername, stabil
titel: "…"
kurz: "…"
standard: false               # genau ein Programm hat true
wochen: 12
status: entwurf
programm_angaben:             # programmspezifische Felder, gespeichert pro Nutzer und Programm
  - id: letzte_dosis
    typ: datum
    frage: "…"
vorab_klaeren: ["…"]          # beim Programmstart zeigen; hier sind Krankheitsbezüge als Ausschluss erlaubt
hinweise: ["…"]               # optional, auf jeder Wochenkarte des Programms erreichbar
```

Wochenkarte:

```yaml
woche: 4                      # 0 bis 12
titel: "…"
status: entwurf               # entwurf | geprueft (Michael) | freigegeben (Dominik)
stand: 2026-10-01
einleitung: "…"
einleitung_quellen: [wu2025]  # optional
training:                     # null in Woche 0
  saetze: 2
  wiederholungen: 10
  hinweis: "…"
  quellen: [acsm2009]         # optional
checkliste:
  - id: w04-kreatin           # stabil, nie umbenennen: Abhak-Status hängt daran (pro Programm eindeutig)
    text: "…"
    quellen: [euClaims]       # IDs aus quellen.json, darf leer sein
hinweis: "…"                  # optional
```

## Regeln für Texte in der App

Strenger als auf der Website, weil die App Messwerte erfasst und sonst schnell wie ein Medizinprodukt wirkt.

1. Die Wochenkarten sind für alle im Programm gleich. Die App leitet aus Messwerten keine gesundheitlichen Empfehlungen ab.
2. Keine Schwellenwerte, die aus einem Messwert eine Handlung machen („mehr als x kg, dann …“).
3. Keine Krankheitsbezüge in Wochenkarten, Übungen und Hinweisen. Erkrankungen stehen nur als Ausschluss in `onboarding/de/bevor-du-startest.md` und in `vorab_klaeren` der Programme (Feld `ausnahme_claims`; die Claims-Prüfung nimmt diese Stellen für Krankheitsbegriffe aus).
4. Keine Medikamentennamen, keine Halbwertszeiten, keine Dosierungs-, Absetz- oder Wiedereinstiegshinweise. Medikamentenbezug gibt es nur in Programmen, die ihn brauchen, dann immer mit dem Satz, dass Absetzen Sache der Ärztin oder des Arztes ist.
5. Der Kern bleibt ohne Programmbezug. Was nur für ein Programm gilt, steht im Programmordner.
6. Gesundheitsbezogene Angaben zu Protein und Kreatin nur im zugelassenen Wortlaut (CLAIMS.md der Website, A1 und A2).
7. Jede Zahl mit Quelle aus `quellen.json`.
8. Ton: nüchtern, „du“, keine Superlative, keine Emojis.
9. Die Claims-Prüfung der App gilt auch hier (`npm run check:claims`, Wortliste `scripts/forbidden-terms.json`). Deshalb heißt es zum Beispiel „ärztlich betreut“.

## Grundprogramm

Gleicher Trainingsplan wie „Nach dem Absetzen der Abnehmspritze“ (12 Wochen, sechs Übungen, Steigerung nach dem Positionspapier des ACSM), aber ohne Bezug zum Absetzen:
- Protein nach DGE (0,8 g/kg, ab 65 Jahren 1,0 g/kg) statt der Spanne für Gewichtsabnahme und -erhalt.
- Woche 0 mit persönlichem Ziel statt Dosis-Datum und Kontrolltermin; Woche 8 und 12 greifen das Ziel auf.
- Woche 3 und 7 ohne Appetit- und Absetzkurven-Bezug, Woche 8 ohne S-LiTE.

## „Nach dem Absetzen der Abnehmspritze“: Abweichungen von der Website

Grundlage sind die Checkliste `/checkliste/` (Woche 0 bis 8) und der 12-Wochen-Plan im Artikel `/wissen/krafttraining-nach-abnehmspritze/`. Die Zweiwochen-Blöcke der Checkliste sind auf einzelne Wochen verteilt, Woche 9 bis 12 sind neu.

Drei Stellen verstoßen gegen die Regeln oben. Eingesetzt ist jeweils Variante A; B und C stehen zur Wahl.

**1. Kontrolltermin (Woche 0, `w00-termin`)**
Website: „Kontrolltermin in acht bis zwölf Wochen bei der Ärztin oder dem Arzt vereinbaren, bei Typ-2-Diabetes früher und mit Blutzuckerkontrolle.“
- A: „Kontrolltermin bei deiner Ärztin oder deinem Arzt vereinbaren. Wann er sinnvoll ist, legt die Praxis fest.“
- B: „Frag in der Praxis, wann ein Kontrolltermin sinnvoll ist, und trag ihn dir ein.“
- C: „Kontrolltermin vereinbaren. Den Zeitpunkt bestimmt deine Ärztin oder dein Arzt, nicht die App.“

**2. Kreatin (Woche 4, `w04-kreatin-rat`, gilt auch im Grundprogramm)**
Website: „Bei Nierenerkrankungen vorher fragen.“ Die Nierenerkrankung steht jetzt in `vorab_klaeren` beider Programme.
- A: „Wenn du regelmäßig Medikamente nimmst oder ärztlich betreut wirst: Kreatin vorher mit deiner Ärztin oder deinem Arzt besprechen. Kreatin kann den Laborwert Kreatinin erhöhen; sag es bei einer Blutabnahme dazu.“
- B: „Nimmst du regelmäßig Medikamente oder wirst ärztlich betreut, sprich Kreatin vorher in der Praxis an.“
- C: „Kreatin ist bei gesunden Erwachsenen in üblichen Mengen gut untersucht. Wirst du ärztlich betreut, frag vorher nach.“

**3. Anstiegsregel (Woche 7, `w07-anstieg`)**
Website: „Regel für den Anstieg: Steigt das Gewicht über zwei Wochen um mehr als 1,5 kg, zuerst Protein und Bewegung prüfen, nicht hungern. Hungern kostet Muskeln.“
- A: „Zeigt der Trend nach oben: zuerst Protein und Training prüfen, nicht hungern. Hungern kostet Muskeln.“
- B: „Egal, was die Waage diese Woche zeigt: Protein und Training sind der Hebel, Hungern ist keiner. Es kostet Muskeln.“ (ganz ohne Bedingung, regulatorisch am sichersten)
- C: „Steigt die Kurve, bleibt die Reihenfolge gleich: Protein, Training, Schlaf. Nicht hungern, das kostet Muskeln.“

Weitere Anpassungen nach denselben Regeln:
- Woche 0: Halbwertszeiten und Wirkstoffnamen gestrichen.
- Woche 7: „Ein bis zwei Kilo Schwankung“ ohne Zahl formuliert.
- Typ-2-Diabetes in „Wann du zur Ärztin gehst“ durch „wenn du ärztlich betreut wirst“ ersetzt (jetzt in `hinweise` des Programms).
- `uebungen.md`: Die Liste „Herz-Kreislauf-Erkrankungen, Bluthochdruck, Diabetes mit Insulin“ aus dem Artikel durch „ärztlich betreut“ ersetzt.
- Dritter Satz ab Woche 5 wie im 12-Wochen-Plan. Die Website-Checkliste nennt ihn schon in Woche 3 bis 4; dort sollte die Website angeglichen werden.

## Offen für Michael

- [ ] Grundprogramm: Passt der Rahmen (Kraft, Protein, Messen) als Kern, oder soll er breiter werden (Schlaf, Ausdauer, Biomarker)?
- [ ] Grundprogramm: Protein nach DGE als Basis, oder höher für Menschen mit Krafttraining?
- [ ] „Nach dem Absetzen der Abnehmspritze“: alle Karten fachlich prüfen, besonders Woche 9 bis 12 (neu) und die drei Umformulierungen. Protein: 25 bis 30 g pro Mahlzeit und 1,2 bis 1,6 g/kg (Website-CLAIMS C8: Zielwert 1,2 g/kg).
- [ ] Kreatin-Hinweis `w04-kreatin-rat`: reicht „Medikamente oder ärztlich betreut“?
- [ ] `vorab_klaeren` beider Programme und `onboarding/de/bevor-du-startest.md`.
- [ ] `hinweise/de/aerztlicher-rat.md`: Notfallsatz und Formulierungen.
