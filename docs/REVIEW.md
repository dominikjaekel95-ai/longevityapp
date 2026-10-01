# Review der Begleitinstanz

Stufen: **MUSS** vor dem nächsten Merge des betroffenen Bereichs · **SOLLTE** im nächsten passenden PR · **INFO**.
Erledigt meldet die Coding-Instanz im PR („erledigt: R3, R5“), abgehakt wird nach Prüfung hier.

## Vorab, vor dem ersten PR (2026-10-01)

Noch kein Code gesehen. Diese Punkte sind Anforderungen, damit der erste Wurf passt.

- [ ] **R1 MUSS · Einwilligungen nachweisbar speichern.** Pro Einwilligung (`gesundheitsdaten`, `foto-auswertung`, `nutzungsstatistik` aus `content/rechtliches/de/einwilligung-art9.md`) Version, Zeitpunkt der Erteilung und des Widerrufs speichern, lokal und in Supabase. Art. 7 Abs. 1 DSGVO verlangt den Nachweis.
- [ ] **R2 MUSS · Einwilligung steuert den Datenfluss.** Ohne `gesundheitsdaten` keine Synchronisation nach Supabase. Ohne `foto-auswertung` ruft die App `estimateBody` nie auf; die Edge Function prüft die Einwilligung serverseitig noch einmal. Ein Widerruf wirkt sofort: keine weiteren Aufrufe. Beim Widerruf von `foto-auswertung` werden die gespeicherten Schätzungen gelöscht.
- [ ] **R3 MUSS · Zuschnitt vor jeder Speicherung.** Das Foto wird an der Schulterlinie beschnitten, bevor es irgendwo gespeichert wird. Das gilt für Upload, SQLite, Cache und Galerie. Das unbeschnittene Original darf nirgends landen, auch nicht in der Fotomediathek des Geräts. Vor dem Speichern zeigt die App den Ausschnitt; so steht es im Einwilligungstext.
- [ ] **R4 MUSS · Keine Gesundheitsdaten in Logs.** Gilt für Edge-Function-Logs, `console.*`, Fehlerberichte und Analytics-Events: keine Messwerte, keine Fotos oder Foto-URLs, keine Schätzungen. Request-IDs ja, Inhalte nein.
- [ ] **R5 MUSS · RLS überall.** Jede Tabelle mit `user_id = auth.uid()` für select, insert, update und delete. Der Storage-Bucket ist privat, seine Policy hängt am Pfadpräfix `<user_id>/`. Signierte URLs mit kurzer Laufzeit. Dazu ein Test pro Tabelle, dass Nutzer B die Daten von Nutzer A nicht lesen kann.
- [ ] **R6 MUSS · Secrets.** Das Repo ist öffentlich. `.env*` steht in `.gitignore`, die CI hat einen Secret-Scan (z. B. gitleaks), und es gibt kein `EXPO_PUBLIC_` für irgendetwas außer Supabase-URL und Anon-Key.
- [ ] **R7 SOLLTE · Gemini-Aufruf.**
  - Location und Modell kommen aus Umgebungsvariablen. Standard ist `eu` plus aktuelles Flash, Fallback `gemini-3.5-flash` in `europe-west3`.
  - Kein Grounding, keine Context-Caches.
  - Strukturierte Ausgabe mit JSON-Schema und Validierung in der Function.
  - Ans Modell gehen nur das beschnittene Bild und der Prompt, keine Nutzer-ID und keine E-Mail.
- [ ] **R8 SOLLTE · Löschen und Export vollständig.** „Konto löschen“ entfernt auch die Storage-Objekte und die Schätzungen, nicht nur Tabellenzeilen. Der ZIP-Export enthält alle gespeicherten Daten, auch die Schätzungen, die die App nicht anzeigt (Auskunftsrecht).
- [ ] **R9 SOLLTE · Texte aus `content/`.** Wochenkarten, Übungen, Hinweise und Einwilligung kommen aus `content/`, Format in `content/README.md`. Solange `status: entwurf` gilt, zeigt die Einwilligung ein sichtbares Banner „Entwurf“. Die Claims-Prüfung läuft auch über `content/` und nimmt nur die Felder mit `ausnahme_claims` für Krankheitsbegriffe aus (`onboarding/de/bevor-du-startest.md`, `vorab_klaeren` der Programme).
- [ ] **R10 INFO · Kein Medizinprodukt-Verhalten.** Die App zeigt Messwerte und Verlauf, bewertet sie aber nicht. Keine Ampeln, keine Warnungen bei Anstieg, keine Texte, die sich nach Messwerten richten. Begründung: `content/README.md`, Regeln 1 und 2.
- [ ] **R11 MUSS · Allgemeine Longevity-App, Programme als Module** (Korrektur von Dominik, 2026-10-01). Der Kern hat keinen Bezug zur Abnehmspritze: App-Name, Onboarding, Startbildschirm, Datenmodell, Texte im Code. Programme liegen in `content/programme/<id>/`; `grundprogramm` ist Standard, `nach-der-spritze` ist optional wählbar. Programmspezifische Angaben (`programm_angaben`, z. B. `letzte_dosis`) speichert die App pro Nutzer und Programm, etwa als `program_settings` (jsonb), nicht als Spalten im Kern. Nutzer können das Programm wechseln, ohne Check-ins und Verlauf zu verlieren; Check-ins gehören zum Nutzer, nicht zum Programm.

## PR #1 „Longvy 0.1“ (geprüft 2026-10-01)

Gesamturteil: Gute Grundlage, sauber getrennt, RLS und Secrets wie gefordert. **PR #1 darf gemergt werden**, weil vorerst nur Dominik und Michael testen. Die MUSS-Punkte unten kommen im nächsten PR. Alle MUSS-Punkte sind erledigt, bevor jemand anderes die App bekommt.

Stand der Vorab-Punkte: R4, R5 (Policies), R6, R10 und R11 sind erfüllt. R1, R2, R3, R7, R8 und R9 sind offen, Details unten.

- [ ] **R12 MUSS · Schalter „Kopf abschneiden“ entfernen** (`src/app/(tabs)/einstellungen.tsx:129`, `settings.headMask`). Die Einwilligung verspricht Fotos ohne Kopf, und ausgeschaltet gingen Fotos mit Gesicht nach Supabase und an Gemini. Der Zuschnitt läuft immer.
- [ ] **R13 MUSS · Originalaufnahme löschen.** `takePictureAsync` legt das unbeschnittene Bild im Cache ab (`pic.uri`, `src/app/checkin/foto.tsx:41`). Nach `processCapture` löschen, auch im Fehlerfall (try/finally).
- [ ] **R14 SOLLTE · Ausrichtung im Gerätetest prüfen.** Der Schnitt bei 20 % setzt voraus, dass das Bild aufrecht ankommt (EXIF-Rotation auf Android). In `docs/TESTEN.md` als Prüfpunkt aufnehmen: Handy hochkant und leicht gekippt, liegt der Kopf vollständig über der Schnittlinie?
- [ ] **R1/R2 konkret, MUSS.**
  - `consents.kind` erlaubt nur `art9` und `age18`. Nötig sind getrennt `gesundheitsdaten`, `foto-auswertung`, `nutzungsstatistik` und `age18`; IDs und Texte stehen in `content/rechtliches/de/einwilligung-art9.md` (`einwilligungen`). Den Check-Constraint und `ConsentKind` anpassen.
  - `requestEstimate` läuft heute nach jedem Check-in mit Foto (`src/app/checkin/werte.tsx:106`). Künftig nur mit aktiver Einwilligung `foto-auswertung`. `estimate-body` prüft dieselbe Einwilligung serverseitig in `consents` und antwortet sonst mit 403.
  - Widerruf in den Einstellungen unter „Datenschutz“, pro Einwilligung. `consents` hat keine Update-Policy, deshalb den Widerruf als neue Zeile anhängen (append-only, z. B. `revoked_at` gesetzt) oder eine Update-Policy nur für `revoked_at`. Beim Widerruf von `foto-auswertung` die eigenen Schätzungen löschen; `estimates` braucht dafür eine Delete-Policy oder eine Edge Function.
  - Die Einwilligung hat für `foto-auswertung` zwei Texte: `text` für `hintergrund` und `text_sichtbar` für `sichtbar`. Die App zeigt den, der zu `EXPO_PUBLIC_ESTIMATE_MODE` passt.
- [ ] **R15 SOLLTE, MUSS vor externen Nutzern · EU-Endpunkt.** Für `GCP_LOCATION=eu` ist der Host `https://aiplatform.eu.rep.googleapis.com` (für `us` entsprechend `aiplatform.us.rep.googleapis.com`). Das ist der Data-Residency-Endpunkt, und so routet auch Googles eigenes SDK `google-genai`. Der globale Host mit `locations/eu` antwortet laut Berichten ebenfalls, ist aber nicht der Residency-Endpunkt. In `defaultHost()` umstellen, `VERTEX_API_HOST` bleibt als Ausweg. Modell: Standard `gemini-3.5-flash` bleibt, es ist für `eu` dokumentiert. Neuere Flash-IDs prüft Dominik beim Anlegen in der Konsole für den Standort `eu` und setzt dann `GEMINI_MODEL`.
- [ ] **R8 konkret, SOLLTE.** Der Export nimmt nur akzeptierte Schätzungen (`listAcceptedEstimates`). Er soll alle Schätzungen enthalten, auch die im Hintergrund und die nicht akzeptierten. Liegen sie nur in Supabase, holt der Export sie vorher.
- [ ] **R16 MUSS vor dem Test, sonst zeigt die App nur Platzhalter · Loader auf `content/README.md` umstellen.** Antwort auf Frage 1:
  - Programme: `content/programme/<id>/programm.md`. Die Felder heißen `programm_angaben` (statt `einstellungen`; `id`, `typ: datum`, `frage`), dazu `vorab_klaeren` (beim Programmstart zeigen) und `hinweise`. IDs: `grundprogramm` und `nach-dem-absetzen-abnehmspritze`, angeglichen an D10. `kraftprogramm-ab-50` bleibt „in Vorbereitung“ ohne Ordner.
  - Wochen: `<id>/de/woche-NN.md`, nur Frontmatter. Felder `einleitung`, `einleitung_quellen`, `training` (`saetze`, `wiederholungen`, `hinweis`, `quellen`; `null` in Woche 0), `checkliste` (`id`, `text`, `quellen`; kein `art`), `hinweis`. Die Checklisten-IDs sind pro Programm eindeutig und stabil, sie sind die `task_id` in `program_progress`.
  - Übungen `content/uebungen/de/uebungen.md`, Quellen `content/quellen.json` (Link „Quelle“ an Punkten mit `quellen`), ärztlicher Rat `content/hinweise/de/aerztlicher-rat.md`.
  - Onboarding: `content/onboarding/de/bevor-du-startest.md` (ersetzt „Für wen nicht“). Einwilligung: `content/rechtliches/de/einwilligung-art9.md`, Frontmatter `einwilligungen`, Body mit den Abschnitten „Bildschirmtext“ und „Details“.
  - `content/README.md` ist Doku und kann aus der Claims-Prüfung heraus. `content/` besteht `check:claims` sonst mit 0 Fehlern, die Hinweise betreffen nur Arzt-Hinweise und Verneinungen.
- [ ] **R17 INFO · Link „Wissen“ im Kern** zeigt auf nachderspritze.de/wissen/ (`src/lib/env.ts:39`). Im allgemeinen Kern weglassen, bis die Dachmarke eine eigene Seite hat, oder nur im Programm „Nach dem Absetzen der Abnehmspritze“ zeigen.
- **Antwort auf Frage 3 (PostHog ohne SDK):** kein Einwand. „Discard client IP data“ steht schon in SETUP.md.
- **Merge-Regel (D11):** wie in `docs/ZUSAMMENARBEIT.md`. Die Coding-Instanz mergt nach grünem `check:all` selbst. Store-Eintrag, Datenschutz und Preise mergt Dominik. Die Einwilligungstexte liegen in `content/` und gehören der Begleitinstanz.
