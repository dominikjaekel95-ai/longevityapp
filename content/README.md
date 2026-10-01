# content/

Alle Texte, die die App anzeigt und die nicht Oberfläche sind: Programm, Hinweise, Rechtstexte. Gepflegt von der Begleitinstanz (siehe `docs/ZUSAMMENARBEIT.md`), fachlich geprüft von Michael, freigegeben von Dominik. Alles hier ist `status: entwurf`, bis Dominik freigibt.

## Dateien

| Datei | Inhalt | Wo in der App |
|---|---|---|
| `programm/de/woche-00.md` … `woche-12.md` | Wochenkarten: Titel, Einleitung, Training, Checkliste, optionaler Hinweis | Wochenkarte der jeweiligen Woche |
| `programm/de/uebungen.md` | Sechs Übungen mit Zuhause- und Studio-Variante, Ablauf einer Einheit, Sicherheitshinweise | Trainingsansicht, von jeder Wochenkarte erreichbar |
| `programm/quellen.json` | Quellen zu allen IDs in `quellen` (aus `src/data/sources.ts` der Website) | „Quelle“-Link an Checklistenpunkten |
| `hinweise/aerztlicher-rat.md` | Wann ärztlicher Rat nötig ist, Notfall | Einstellungen/Info, verlinkt von Woche 0 |
| `onboarding/fuer-wen-nicht.md` | Ausschlüsse vor dem Start | Onboarding, vor der Einwilligung |
| `rechtliches/einwilligung-art9.md` | Einwilligungen (Frontmatter) und Bildschirm-/Detailtext (Body) | Onboarding-Schritt Einwilligung, Einstellungen „Datenschutz“ |

## Format

Markdown mit YAML-Frontmatter. Bei Wochenkarten steht alles im Frontmatter, der Body ist leer.

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
  - id: w04-kreatin           # stabil, nie umbenennen: Abhak-Status hängt daran
    text: "…"
    quellen: [euClaims]       # IDs aus programm/quellen.json, darf leer sein
hinweis: "…"                  # optional, wird abgesetzt unter der Checkliste gezeigt
```

Checklisten-IDs sind stabil. Wird ein Punkt gestrichen, verschwindet seine ID; eine neue Formulierung desselben Punkts behält die ID.

## Regeln für Texte in der App

Strenger als auf der Website, weil die App Messwerte erfasst und sonst schnell wie ein Medizinprodukt wirkt.

1. Die Wochenkarten sind für alle gleich. Die App leitet aus Messwerten keine gesundheitlichen Empfehlungen ab.
2. Keine Schwellenwerte, die aus einem Messwert eine Handlung machen („mehr als x kg, dann …“).
3. Keine Krankheitsbezüge in Wochenkarten, Übungen und Hinweisen. Erkrankungen stehen nur als Ausschluss in `onboarding/fuer-wen-nicht.md` (Feld `ausnahme_claims`; die Claims-Prüfung nimmt diese Datei für Krankheitsbegriffe aus).
4. Keine Medikamentennamen, keine Halbwertszeiten, keine Dosierungs-, Absetz- oder Wiedereinstiegshinweise. Der Pflichtsatz „Ob und wie du dein Medikament absetzt, besprichst du mit deiner Ärztin oder deinem Arzt.“ bleibt.
5. Gesundheitsbezogene Angaben zu Protein und Kreatin nur im zugelassenen Wortlaut (CLAIMS.md der Website, A1 und A2).
6. Jede Zahl mit Quelle aus `programm/quellen.json`.
7. Ton wie auf der Website: nüchtern, „du“, keine Superlative, keine Emojis.

## Abweichungen von der Website

Grundlage sind die Checkliste `/checkliste/` (Woche 0 bis 8) und der 12-Wochen-Plan im Artikel `/wissen/krafttraining-nach-abnehmspritze/`. Die Zweiwochen-Blöcke der Checkliste sind auf einzelne Wochen verteilt, Woche 9 bis 12 sind neu.

Drei Stellen verstoßen gegen die Regeln oben. Eingesetzt ist jeweils Variante A; B und C stehen zur Wahl.

**1. Kontrolltermin (Woche 0, `w00-termin`)**
Website: „Kontrolltermin in acht bis zwölf Wochen bei der Ärztin oder dem Arzt vereinbaren, bei Typ-2-Diabetes früher und mit Blutzuckerkontrolle.“
- A: „Kontrolltermin bei deiner Ärztin oder deinem Arzt vereinbaren. Wann er sinnvoll ist, legt die Praxis fest.“
- B: „Frag in der Praxis, wann ein Kontrolltermin sinnvoll ist, und trag ihn dir ein.“
- C: „Kontrolltermin vereinbaren. Den Zeitpunkt bestimmt deine Ärztin oder dein Arzt, nicht die App.“

**2. Kreatin (Woche 4, `w04-kreatin-rat`)**
Website: „Bei Nierenerkrankungen vorher fragen.“ Die Nierenerkrankung steht weiter im Onboarding-Ausschluss.
- A: „Wenn du in ärztlicher Behandlung bist oder regelmäßig Medikamente nimmst: Kreatin vorher mit deiner Ärztin oder deinem Arzt besprechen. Kreatin kann den Laborwert Kreatinin erhöhen; sag es bei einer Blutabnahme dazu.“
- B: „Nimmst du regelmäßig Medikamente oder bist in Behandlung, sprich Kreatin vorher in der Praxis an.“
- C: „Kreatin ist bei gesunden Erwachsenen in üblichen Mengen gut untersucht. Bist du in ärztlicher Behandlung, frag vorher nach.“

**3. Anstiegsregel (Woche 7, `w07-anstieg`)**
Website: „Regel für den Anstieg: Steigt das Gewicht über zwei Wochen um mehr als 1,5 kg, zuerst Protein und Bewegung prüfen, nicht hungern. Hungern kostet Muskeln.“
- A: „Zeigt der Trend nach oben: zuerst Protein und Training prüfen, nicht hungern. Hungern kostet Muskeln.“
- B: „Egal, was die Waage diese Woche zeigt: Protein und Training sind der Hebel, Hungern ist keiner. Es kostet Muskeln.“ (ganz ohne Bedingung, regulatorisch am sichersten)
- C: „Steigt die Kurve, bleibt die Reihenfolge gleich: Protein, Training, Schlaf. Nicht hungern, das kostet Muskeln.“

Weitere Anpassungen nach denselben Regeln:
- Woche 0: Halbwertszeiten und Wirkstoffnamen gestrichen.
- Woche 7: „Ein bis zwei Kilo Schwankung“ ohne Zahl formuliert.
- `hinweise/aerztlicher-rat.md`: Typ-2-Diabetes durch „wenn du wegen einer Erkrankung in Behandlung bist“ ersetzt. Akute Beschwerden (Brustschmerz, Atemnot, starker Schwindel) stehen getrennt mit „sofort“ und 112.
- `uebungen.md`: Die Liste „Herz-Kreislauf-Erkrankungen, Bluthochdruck, Diabetes mit Insulin“ aus dem Artikel durch „in ärztlicher Behandlung“ ersetzt.
- Dritter Satz ab Woche 5 wie im 12-Wochen-Plan. Die Website-Checkliste nennt ihn schon in Woche 3 bis 4; dort sollte die Website angeglichen werden.

## Offen für Michael

- [ ] Alle Karten fachlich prüfen, besonders Woche 9 bis 12 (neu) und die drei Umformulierungen.
- [ ] Protein: Die Karten nennen 25 bis 30 g pro Mahlzeit und die Spanne 1,2 bis 1,6 g/kg (Website-CLAIMS C8: Zielwert 1,2 g/kg). Bleibt das so?
- [ ] Kreatin-Hinweis `w04-kreatin-rat`: reicht „in ärztlicher Behandlung oder Medikamente“?
- [ ] Ausschlussliste `fuer-wen-nicht.md` (Website-CLAIMS D10).
- [ ] `aerztlicher-rat.md`: Notfallsatz und Formulierungen.
