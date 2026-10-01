# Inhalte aus content/: Loader und erwartetes Format

`content/` gehört der Begleitinstanz (docs/ZUSAMMENARBEIT.md). Die App liest die Dateien im Build-Schritt `npm run build:content` nach `src/content/generated/content.json`. Fehlt etwas, zeigt die App Platzhalter aus `src/content/placeholder/`. Verbindlich für das Format ist `content/README.md` der Begleitinstanz; dieses Dokument beschreibt, was der Loader derzeit versteht. Abweichungen werden im Loader nachgezogen, nicht in `content/`.

## Programme: `content/programme/<id>/`

- `programm.md` (optional): Frontmatter `titel` (Pflicht), `kurz`, `wochen` (Standard 12), `standard` (true für genau ein Programm), `verfuegbar` (false = „in Vorbereitung“, nicht wählbar), `einstellungen` (Liste programmspezifischer Felder mit `key`, `typ` date/text/number, `label`, `hilfe`, `pflicht`). Englische Fassungen optional als `titel_en`, `kurz_en`, `label_en`, `hilfe_en`.
- Wochen: `<locale>/woche-NN.md` oder `woche-NN.<locale>.md`. Frontmatter `woche` (Pflicht), `titel` (Pflicht), `kurz`, `status` (entwurf oder freigegeben), `aufgaben` (Liste mit `id`, `art` messen/protein/kraft/alltag, `text`). Body: Absätze als Erklärung.
- Programm-IDs, die der Code kennt: `grundprogramm` (Standard), `nach-dem-absetzen-abnehmspritze`, `kraftprogramm-ab-50`. Andere IDs werden aufgenommen, wenn eine `programm.md` sie beschreibt.
- Programmspezifische Felder landen in `program_settings` (lokal und in Supabase als jsonb), nie im Kern-Datenmodell.

## Einwilligung: `content/rechtliches/einwilligung/<locale>.md`

Frontmatter `status` (entwurf oder freigegeben), `version`, `titel`, `checkbox`, `alter_checkbox`, `hinweis`. Body: erster Absatz = Einleitung, Aufzählung = Punkte. Solange `status: entwurf`, zeigt die App „Entwurf“.

## Onboarding: `content/onboarding/fuer-wen-nicht/<locale>.md`

Frontmatter `titel`. Body: Aufzählung = Punkte. Erscheint im ersten Onboarding-Schritt.

## Prüfungen

`build:content` bricht ab bei: fehlendem `titel` oder `woche`, unbekannter `art`, doppelten Aufgaben-IDs, mehr als einem Standardprogramm, Einwilligung ohne Punkte. Danach läuft die Claims-Prüfung über alle `content/**/*.md`. CI prüft, dass `content.json` committet und aktuell ist.
