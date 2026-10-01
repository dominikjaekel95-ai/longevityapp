# Ideensammlung

Unsortierte Ideen von Dominik, Michael und den beiden Instanzen. Nichts hier ist beschlossen; Beschlüsse stehen in `docs/DECISIONS.md`. Jede Idee hat Quelle, Datum und Stand. Bei Ideen mit Körper- oder Gesundheitsbezug steht dabei, was die Zweckbestimmung (CLAUDE.md Abschnitt 2) daraus macht.

Stände: *Idee* (nur notiert), *prüfen* (Technik oder Recht offen), *entschieden* (siehe D-Nummer), *verworfen* (mit Grund).

## Foto und Körper

- **Gesicht verpixeln statt Kopf abschneiden.** Dominik, 01.10.2026. Nutzer fotografieren sich normal; die App findet das Gesicht lokal mit ML Kit, verpixelt es grob (wenige Blöcke, kein Weichzeichner) und lädt erst dann hoch. Live-Hinweis im Sucher, Rückfall auf den Schnitt an der Schulterlinie, wenn kein Gesicht gefunden wird. Läuft nur in der APK, nicht in Expo Go. Stand: *prüfen*, als D23 vorgeschlagen. Offen: Soll das Original mit Gesicht lokal auf dem Gerät bleiben? Das widerspricht REVIEW R3 und dem Einwilligungstext („ohne Kopf“); Dominik und Begleitinstanz klären.
- **Seitenfoto zusätzlich zum Frontfoto.** Dominik, 01.10.2026. Ermöglicht Taillen-Schätzung, Haltung und Fettverteilung; Spren und Bodygram arbeiten mit Front und Seite. Verdoppelt den Fotoaufwand pro Check-in. Stand: *Idee*. Vorschlag: freiwillig, erst nach dem Onboarding.
- **Kennzahlen über das Foto legen.** Dominik, 01.10.2026 („coole biometrische Daten über den Körper legen, Körpertyp“). Denkbar als Overlay: Schulter-zu-Hüfte, Taille-zu-Größe, Umriss von Woche 0 über das aktuelle Foto gelegt. Hinweis: Körpertyp-Einteilungen wie Ektomorph oder Endomorph sind wissenschaftlich schwach; messbare Verhältnisse mit Verlauf sind belastbarer und bleiben Anzeige ohne Bewertung. Stand: *Idee*.
- **Fettverteilung, viszerales Fett.** Dominik, 01.10.2026. Wunsch: Nutzer mit eher bauchbetontem Fett sollen das sehen. Zweckbestimmung: „viszerales Fett erkannt“ ist eine gesundheitsbezogene Einstufung und aus einem Foto nicht messbar; „erkennt“ ist verboten. Machbar ohne Medizinprodukt: Taille-zu-Größe und Bauch-zu-Hüfte als Zahlen mit eigenem Verlauf, dazu allgemeine Information ohne Einordnung des Nutzers. Wortwahl mit Michael klären. Stand: *prüfen*.
- **Taille aus dem Foto schätzen.** Coding-Instanz, 01.10.2026. Nur als Spanne, nur nach Seitenfoto und Körpergröße; Maßband bleibt genauer. Erst angehen, wenn die Körperfett-Schätzung gegen eine Waage geprüft ist. Stand: *Idee*.

## Werte ohne Gerät

- **Einbeinstand (zehn Sekunden) und Aufstehtest (dreißig Sekunden).** Coding-Instanz aus `docs/ONBOARDING-RECHERCHE.md`, 01.10.2026. Handy an die Brust bzw. in die Hosentasche, Beschleunigungssensor zählt oder stoppt. Gute Studienlage, kein Gerät, je unter einer Minute. Nur Zählung und Verlauf anzeigen, keine Normtabellen. Stand: *Idee*, Vorschlag für das Cockpit nach dem Onboarding.
- **Gehgeschwindigkeit per GPS.** Sechs Minuten gehen. Aufwendig für den Nutzer. Stand: *Idee*, eher Phase 3.
- **Ruhepuls per Kamera.** Finger auf Kamera mit Blitz. Technisch machbar, rückt näher ans Medizinprodukt. Mit Michael klären, vorerst nicht. Stand: *prüfen*.
- **Check-in-Minimum: Foto und Gewicht.** Coding-Instanz, 01.10.2026. Alles andere freiwillig, auch Griffkraft und Taille. Begründung: Erfolgszahl acht Check-ins in zwölf Wochen; jedes Pflichtfeld kostet. Stand: *Idee*, wartet auf Dominiks Onboarding-Entscheidung.
- **Weitere Werte.** Dominik spricht mit Michael, welche Werte erfasst werden sollen. Stand: *offen*, Ergebnis kommt hierher.

## KI-Assistent

- **Chat-Assistent in der App.** Dominik, 01.10.2026. Beantwortet Fragen zu Gesundheit und Gewohnheiten im Ton der Marke, kennt Verlauf und Programm des Nutzers, gibt kleine Anpassungen („Mikrooptimierungen“) und lenkt zurück zum Wesentlichen, wenn das Gespräch abschweift. Vorbilder: Whoop Coach, Oura Advisor, Fitbit-Coach mit Gemini (April 2026), Noom; Gegenbeispiel Ada (Symptomprüfung, Medizinprodukt Klasse IIa). Stand: *prüfen*, deutlich nach Onboarding und Cockpit.
  - **Zweckbestimmung:** Erlaubt sind allgemeine Information zu Bewegung, Ernährung, Schlaf, Erklärung der eigenen Werte und des Programms. Verboten: Symptome einordnen, Medikamente oder Diagnosen berücksichtigen, individuelle Empfehlungen aus Gesundheitszustand ableiten. Sobald der Assistent Antworten an Krankheiten oder Medikamente anpasst, ist er Software mit medizinischem Zweck (MDCG 2019-11). Deshalb bekommt er Gesundheitszustand und Medikamente gar nicht erst als Eingabe; Fragen dazu beantwortet er mit Verweis auf Ärztin oder Arzt.
  - **Daten:** Chatinhalte mit Körperbezug sind Art.-9-Daten. Aufruf nur serverseitig (Edge Function), Modell in der EU mit Zero Data Retention: Gemini über das EU-Endpunktprojekt wie bei der Schätzung, oder Claude über Google Cloud EU bzw. Claude API mit `inference_geo: eu`; Claude Fable ist ohne Sonderfreigabe nicht mit ZDR verfügbar, Opus schon. Pseudonymisierung: das Modell bekommt nie Name, E-Mail oder Nutzer-ID, nur die nötigen Werte (letzte Messwerte, Programmwoche) und den Chattext; vor dem Aufruf werden E-Mail-Adressen, Telefonnummern und Namen aus dem Nutzertext entfernt. Eine solche Vorschicht ist üblich, aber nie vollständig; Datenminimierung im Aufbau ist wichtiger als der Filter.
  - **Leitplanken:** Systemprompt mit Ton und Grenzen, Antworten gestützt auf eigene freigegebene Texte (Wissensbereich, Programm) statt freiem Weltwissen, Ausgabefilter mit der Verbotsliste aus `scripts/forbidden-terms.json` zur Laufzeit (Treffer: neu formulieren), Erkennung von Krisen-Themen mit Hinweis auf Hilfsangebote, Kennzeichnung als KI (AI Act Art. 50, Pflicht ab 02.08.2026), Testsatz mit Grenzfällen vor dem Start und stichprobenartige Durchsicht mit Einwilligung.
  - **Grenzen:** Das Modell kann Studien erfinden und Grenzen überschreiten; eine Null-Fehler-Garantie gibt es nicht, nur Filter, Tests und Protokoll. Haftung und HWG gelten für jede Antwort wie für einen geschriebenen Text. Laufende Kosten pro Nachricht statt einmal pro Foto.
  - **Ausbaustufe:** Gewohnheiten aus dem Chat plus Foto und Werte ergeben Vorschläge für die Woche. Das ist Coaching auf Lebensstil-Ebene und bleibt erlaubt, solange die Eingaben Lebensstil sind, nicht Krankheit.

## Produkt und Technik

- **Englisch als wählbare Sprache**, Deutsch bleibt Standard, nie gemischt. Dominik, 01.10.2026. Kommt mit der Übersetzung von `content/` nach der Textüberarbeitung. Stand: *entschieden*, D22.
- **Browser-Version** später, Android-App zuerst. Dominik, 01.10.2026. Der Web-Export baut bereits. Stand: *Idee*.
- **Anmeldung mit Apple.** Braucht das Apple-Entwicklerkonto; Pflicht auf iOS, sobald es Google gibt. Stand: *Idee*, D20.
- **Weitere KI-Anbieter und Benchmark.** Dominik, 01.10.2026: OpenAI-Provider im EU-Modus, Vergleich der Anbieter auf denselben Fotos gegen eine Bioimpedanzwaage. Stand: *Idee*, Schritte in `docs/KI.md`.
