# Inhalte aus content/: Loader

`content/` gehört der Begleitinstanz; das Format steht in `content/README.md`. Die App liest die Dateien im Build-Schritt `npm run build:content` nach `src/content/generated/content.json` (committet, CI prüft Aktualität). Fehlt etwas, zeigt die App Platzhalter aus `src/content/placeholder/`. Weicht `content/README.md` vom Loader ab, wird der Loader nachgezogen, nie `content/`.

| Quelle | Loader | Wo in der App |
|---|---|---|
| `programme/<id>/programm.md` (id, titel, kurz, standard, wochen, status, programm_angaben, vorab_klaeren, hinweise) | `src/content/programs.ts` | Programmauswahl (Onboarding, Einstellungen): „Vorab klären“, Angaben als Felder; `hinweise` unter jeder Wochenkarte |
| `programme/<id>/de/woche-NN.md` (woche, titel, status, einleitung, einleitung_quellen, training, checkliste, hinweis) | `src/content/program.ts` | Programm-Tab und Wochenkarte: Einleitung, Training, Checkliste mit „Quelle“, Hinweis |
| `uebungen/de/uebungen.md` | `src/content/uebungen.ts` | `/programm/uebungen`, verlinkt aus jeder Wochenkarte |
| `hinweise/de/aerztlicher-rat.md` | `src/content/onboarding.ts` (`getMedicalAdvice`) | Einstellungen, „Wann du ärztlichen Rat holst“ |
| `onboarding/de/bevor-du-startest.md` | `src/content/onboarding.ts` (`getOnboardingNote`) | Onboarding, Schritt 1 |
| `rechtliches/de/einwilligung-art9.md` (status, version, geltung, einwilligungen; Body `## Bildschirmtext`, `## Details`) | `src/content/consent.ts` | Onboarding, Schritt 2; Einstellungen, „Datenschutz und Einwilligungen“ |
| `quellen.json` | `src/content/quellen.ts` | „Quelle“-Links öffnen die URL im Browser |

## Abbildung

- `programm_angaben[].typ`: `datum` wird zu einem Datumsfeld, `zahl` zu einer Zahl, alles andere Text. `frage` ist das Label. Werte landen in `program_settings` (lokal und Supabase, jsonb), nie im Kern. Ein Datumsfeld definiert Woche 0 des Programms (docs/DECISIONS.md D16); dann gibt es kein eigenes Startdatum.
- `status` je Datei: `entwurf`, `geprueft`, `freigegeben`. Alles außer `freigegeben` zeigt die App als Stand an („Stand der Texte: Entwurf“); die Einwilligung trägt zusätzlich die Kennzeichnung „Entwurf“.
- Einwilligungen: eine Zeile pro ID in `consents` mit Fassung (`version`), Erteilung und Widerruf. `pflicht: true` muss im Onboarding angehakt werden. `aktiv: false` (Nutzungsstatistik) erscheint im Onboarding nicht, in den Einstellungen nur, wenn ein PostHog-Key gesetzt ist. Platzhalterzeilen in eckigen Klammern im Body werden nicht angezeigt.
- Englisch: `en/` neben `de/` wird gelesen, sobald vorhanden; sonst fällt die App auf Deutsch zurück.

## Prüfungen

`build:content` bricht ab bei: fehlendem `titel` oder `woche`, `id` ungleich Ordnername, doppelten Checklisten-IDs je Programm, Quellen-IDs ohne Eintrag in `quellen.json`, mehr als einem Standardprogramm, Einwilligung ohne Pflicht-Eintrag oder Bildschirmtext. Danach läuft `check:claims` über alle `content/**/*.md` (außer `content/README.md`); Zeilen in `vorab_klaeren` und `punkte` von Dateien mit `ausnahme_claims` sind für Krankheitsbegriffe ausgenommen, Medikamentennamen bleiben überall verboten.
