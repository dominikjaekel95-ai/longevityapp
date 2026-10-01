# Longvy App (Arbeitstitel): Anleitung für die Coding-Instanz

Stand 01.10.2026. Diese Datei ist die Vorgabe für Claude Code (oder einen anderen Coding-Agenten) zum Bau der ersten App-Version. Sie gehört als `CLAUDE.md` in ein neues Repository (Vorschlag: `longvy-app`), nicht ins Website-Repo `jojo-effekt`. Lies sie vollständig, bevor du Code schreibst. Bei Widersprüchen gilt Abschnitt 2 (Zweckbestimmung) vor allem anderen.

## 1. Was die App ist

Eine Begleit-App für die zwölf Wochen nach dem Absetzen einer Abnehmspritze, später für Kraft und Gewichthalten ab 50. Sie macht Verlauf sichtbar und führt durch ein Programm. Sie diagnostiziert nichts, behandelt nichts, verhindert nichts.

Kernschleife (jede Woche, unter zwei Minuten):
1. Foto in gleicher Pose und gleichem Licht (Anleitung mit Silhouetten-Overlay).
2. Gewicht eintragen (manuell; Waagen-Import später).
3. Griffkraft eintragen (Handdynamometer, manuell).
4. Optional: Taillenumfang.
5. Die App zeigt den Verlauf als Kurven und gibt die Programm-Aufgaben der Woche aus (Protein, Kraft, Checkliste).

Geld verdient die App nicht selbst. Sie ist der Kanal für Absetz-Check (Bluttest-Kit, Woche 0 und Woche 12), Set (Nachbestellung Woche 4) und später ärztliches Coaching. Alle Käufe laufen über die Website (physische Güter und Dienstleistungen, keine In-App-Käufe, keine Store-Gebühren). Die App verlinkt nur.

Zielplattform: Android zuerst, iOS aus demselben Code später. Sprache: Deutsch, Englisch vorbereitet (i18n von Anfang an).

## 2. Zweckbestimmung: Lifestyle, kein Medizinprodukt

Die App ist eine Fitness- und Wohlbefinden-App im Sinne von MDCG 2019-11 und fällt nicht unter die MDR. Das gilt nur, solange Code, Texte, Store-Eintrag und Marketing dieselbe Zweckbestimmung tragen. Deshalb verbindlich:

Erlaubt:
- Verlauf von Fotos, Gewicht, Griffkraft, Umfang anzeigen; Trends berechnen.
- Körperzusammensetzung als „Schätzung“ mit sichtbarer Spanne anzeigen, immer mit dem Hinweis, dass nur der Verlauf aussagekräftig ist.
- Allgemeine Trainings- und Ernährungsempfehlungen für gesunde Erwachsene (Programm), die für alle Nutzer gleich aufgebaut sind und sich nach Fitnessstufe anpassen, nicht nach Gesundheitszustand.
- Erinnerungen, Checklisten, Lernartikel (aus dem Wissensbereich der Website).

Verboten (jede dieser Formulierungen macht die App zum Medizinprodukt oder verstößt gegen HWG):
- „erkennt“, „diagnostiziert“, „misst medizinisch“, „Muskelabbau festgestellt“, „Sarkopenie“, „Adipositas“, „Risiko für …“.
- „verhindert Jojo-Effekt“, „verhindert Gewichtszunahme“, „Rückfall“, „Therapie“, „Behandlung“, „Patient“, „nach Ihrer Medikation“.
- Empfehlungen, die sich an Diagnosen, Medikamente oder Laborwerte anpassen. Laborwerte aus dem Absetz-Check werden in der App nicht angezeigt und nicht importiert (bleiben beim Testpartner).
- Glukose-Daten (CGM) in Version 1 nicht. Falls später: nur Anzeige importierter Werte ohne Bewertung, eigene Freigabe durch Dominik und Michael.
- Alarme, Warnungen, Schwellenwerte mit Gesundheitsbezug. Einzige Ausnahme: ein neutraler Hinweis „Bei Beschwerden sprich mit deiner Ärztin oder deinem Arzt“ in den Einstellungen und im Onboarding.

Ein Modul `src/content/claims.ts` enthält alle nutzerseitigen Texte zu Körperdaten und Programm. Ein Test `npm run check:claims` prüft diese Texte und den Store-Text auf die verbotenen Wörter (Liste in `scripts/forbidden-terms.json`, Startbestand aus `CLAIMS.md` des Website-Repos übernehmen). Der Build bricht bei Treffern ab.

Medikamentennamen (Wegovy, Ozempic, Mounjaro, Saxenda) kommen in der App nirgends vor; „Abnehmspritze“ ist erlaubt.

## 3. Technik

- **App:** Expo (React Native, TypeScript), Expo Router, EAS Build. Android zuerst (`eas build --platform android`), iOS-Konfiguration anlegen, aber nicht bauen.
- **Backend:** Supabase, Projekt in der Region EU (Frankfurt). Auth per E-Mail-Magic-Link (kein Passwort), Postgres mit Row Level Security (jeder Nutzer sieht nur eigene Zeilen), Storage mit privatem Bucket `checkins` und signierten URLs (Gültigkeit 10 Minuten).
- **KI-Aufrufe nur serverseitig** über Supabase Edge Functions. Niemals API-Schlüssel in der App. Provider hinter einer Schnittstelle `estimateBody(photo, meta) -> { bodyFatPct, range, confidence, notes }`, austauschbar. Start: Gemini Flash über Vertex AI in `europe-west3`. Claude (über AWS Bedrock Frankfurt oder Vertex) als zweiter Provider vorbereitet, nicht angebunden.
- **Schätz-Prompt:** Das Modell liefert ausschließlich strukturiertes JSON nach festem Schema (Spanne statt Punktwert, Konsistenz-Score zum Vorfoto, Hinweise zu Pose und Licht). Kein Freitext an den Nutzer aus dem Modell. Bei Konsistenz-Score unter Schwelle: Foto wird nicht gewertet, Nutzer bekommt die Pose-Anleitung erneut.
- **Lokal zuerst:** Gewicht, Griffkraft, Umfang und Programmfortschritt werden lokal gespeichert (SQLite via expo-sqlite) und mit Supabase synchronisiert. Die App funktioniert offline, außer für die Foto-Schätzung.
- **Push:** Expo Notifications, eine Erinnerung pro Woche, vom Nutzer wählbarer Wochentag, standardmäßig aus bis zur Zustimmung.
- **Health Connect (Android):** erst Phase 3; dann nur Schritte und Schlafdauer lesen, nichts schreiben.
- **Analytics:** Plausible (bereits auf der Website im Einsatz) oder PostHog EU, ohne Cookies, ohne Werbe-SDKs. Keine Facebook-, Google-Ads- oder TikTok-SDKs in der App.
- **Keine Secrets im Repo.** `.env.example` dokumentiert alle Variablen; echte Werte liegen nur in EAS Secrets und Supabase.

## 4. Datenschutz

- Körperfotos mit Gesundheitsbezug sind Daten nach Art. 9 DSGVO. Verarbeitung nur mit ausdrücklicher, protokollierter Einwilligung im Onboarding (eigener Schritt, eigene Checkbox, Text in `src/content/consent.ts`).
- Gesicht ist nicht nötig: Die Pose-Anleitung schneidet oberhalb der Schultern ab; die App bietet an, den Kopf vor dem Upload automatisch zu maskieren (Standard: an).
- Fotos verlassen die EU nicht (Supabase Frankfurt, Vertex `europe-west3`). Beim KI-Aufruf wird das Foto übertragen und nicht beim Anbieter gespeichert (Vertex-Einstellung „no data retention“ dokumentieren).
- Export (ZIP mit Fotos und CSV) und Konto löschen (alles, sofort, inklusive Storage) sind ab Version 1 in den Einstellungen.
- Datenschutzerklärung und Impressum als Webseiten auf nachderspritze.de bzw. später der Longvy-Domain, in der App verlinkt; Texte erstellt Dominik, nicht die Coding-Instanz.
- Mindestalter 18, Abfrage im Onboarding.

## 5. Phasen

**Phase 1 (Version 0.1, Ziel: vier Wochen Bauzeit nebenher):** Onboarding mit Einwilligung, wöchentlicher Check-in (Foto, Gewicht, Griffkraft, Umfang), Verlaufskurven, 12-Wochen-Programm als Wochenkarten mit Checkliste (Inhalte aus `src/content/wissen` der Website übernehmen, Texte liefert Dominik), Erinnerung, Export, Löschen. Foto-Schätzung bereits angebunden, aber als „Beta-Schätzung“ ausklappbar; der Verlauf funktioniert auch ohne sie.

**Phase 2:** Essensfoto mit Kalorien- und Protein-Schätzung (gleiche Provider-Schnittstelle, gleiche Spannen-Logik), Protein-Tagesziel aus Körpergewicht (allgemeine Formel, keine Individualisierung nach Gesundheit).

**Phase 3:** Health Connect lesen (Schritte, Schlafdauer), Waagen-Import, iOS-Build.

**Phase 4:** Verknüpfung mit Absetz-Check (Bestell-Link Woche 0 und 12, Status „Kit bestellt“ manuell), Set-Nachbestellung Woche 4 als Link, Newsletter-Anmeldung über die bestehende Tally/MailerLite-Strecke.

Nichts aus Phase 2 bis 4 in Phase 1 anfangen.

## 6. Was Erfolg heißt

Die eine Zahl: Anteil der Nutzer, die in zwölf Wochen mindestens acht Check-ins machen. Unter 20 Prozent nach den ersten 200 Nutzern: App einstellen oder umbauen, nicht erweitern. Nebenzahlen: Zeit pro Check-in (Ziel unter zwei Minuten), Anteil verworfener Fotos (Ziel unter 15 Prozent), Klicks auf Absetz-Check und Set.

## 7. Arbeitsweise

- Branch pro Thema, Pull Request, `npm run check:all` (Typen, Lint, Claims-Prüfung, Tests) muss grün sein. Kein Push auf `main` ohne PR.
- Jede neue nutzerseitige Formulierung mit Körper- oder Gesundheitsbezug kommt in `claims.ts`, nirgendwo sonst.
- Alles, was Store-Eintrag, Einwilligungstexte, Datenschutz, Preise oder Verlinkung zu Käufen betrifft, als PR mit Frage an Dominik, nicht eigenmächtig mergen.
- Kontoerstellung bei Google Play (Entwicklerkonto, 25 $ einmalig), Supabase, Google Cloud und EAS übernimmt Dominik; die Coding-Instanz fordert die nötigen Variablen an und dokumentiert sie in `docs/SETUP.md`.
- Ton in der App wie auf der Website: nüchtern, „du“, keine Superlative, keine Emojis.

## 8. Offene Entscheidungen (Dominik und Michael)

1. Name der App im Store (Arbeitstitel Longvy; sonst „Nach der Spritze“).
2. Griffkraft-Dynamometer: welches Gerät empfohlen wird (Affiliate-Link auf der Website, nicht in der App).
3. Ob die Foto-Schätzung in 0.1 sichtbar ist oder nur im Hintergrund protokolliert wird, um sie gegen eine Bioimpedanzwaage zu prüfen, bevor Nutzer sie sehen.
4. Programminhalte der zwölf Wochen: Michael prüft, Dominik schreibt.

## 9. Ergänzungen aus der Umsetzung (seit 01.10.2026)

Dieser Abschnitt wurde von der Coding-Instanz angehängt; Abschnitt 1 bis 8 sind unverändert der Brief vom 01.10.2026.

- **Korrektur von Dominik, gilt vor allem anderen:** Longvy ist eine allgemeine Longevity-App (Körperzusammensetzung aus Fotos, Kraft, Ernährung, Verlauf). Die Abnehmspritze ist nur eine Anwendung. Der Kern (Name, Onboarding, Startbildschirm, Texte im Code) hat keinen Spritzenbezug. Programme sind Module in `content/programme/<id>/`, Standard ist das Grundprogramm. Wo Abschnitt 1 und 5 Phase 1 als GLP-1-App beschreiben, gilt das so nicht mehr; Funktionen und Zweckbestimmung (Abschnitt 2) bleiben.
- Zwei Claude-Instanzen arbeiten im Repo: Rollen und Kanäle in `docs/ZUSAMMENARBEIT.md`. Programmtexte und Rechtstext-Entwürfe schreibt die Begleitinstanz in `content/`; die App liest sie im Build-Schritt (`docs/CONTENT-LOADER.md`). Vor jedem PR `docs/REVIEW.md` lesen.
- Entscheidungen mit Begründung: `docs/DECISIONS.md`. Dominik entscheidet; die Begleitinstanz schlägt vor; die Coding-Instanz prüft Vorschläge und legt Strittiges Dominik vor.
- Gestaltung: `docs/DESIGN.md` ist verbindlich. Keine Verläufe, keine Icon-Kreise, keine Emojis, keine Motivationsfloskeln, Listen statt Karten, eine Schrift, Palette der Website.
- Einrichtung und Variablen: `docs/SETUP.md`. Testen auf Android: `docs/TESTEN.md`. KI-Provider: `docs/KI.md`. Struktur und Befehle: `README.md`.
- Branch-Regel: `main` ist der Standard-Branch. Jede Änderung als Pull Request gegen `main`, `npm run check:all` muss grün sein. Store-Eintrag, Einwilligungstexte, Datenschutz, Preise, Kauf-Links mergt nur Dominik.
