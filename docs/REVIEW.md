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
