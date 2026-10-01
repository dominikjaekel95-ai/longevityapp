# Entscheidungen

Jede Entscheidung mit Begründung, Alternativen und wer sie getroffen hat. Dominik kann jede davon ändern; Vorschläge mit Abwägung stehen hier, die Umsetzung ist so gebaut, dass der Wechsel klein bleibt. Designbrief „Gegen den KI-Look“ als Dokument: https://claude.ai/code/artifact/7d459b44-6363-4027-b235-0216c2d10a07 (Kurzfassung in docs/DESIGN.md).

## D1. Longvy ist eine allgemeine Longevity-App, kein GLP-1-Produkt

Dominik, 01.10.2026. Kern (Name, Onboarding, Startbildschirm, Texte im Code) ohne Bezug zur Abnehmspritze. Programme sind Module in `content/programme/<id>/`; Standard ist das Grundprogramm, „Nach dem Absetzen der Abnehmspritze“ ist optional. Programmspezifische Angaben (z. B. ein Datum, das nur ein Programm braucht) liegen in `program_settings` (jsonb pro Nutzer und Programm), nicht im Kern. Der Brief in CLAUDE.md beschreibt Phase 1 noch als GLP-1-App; die Funktionen bleiben, der Rahmen ist allgemein.

## D2. Foto-Schätzung sichtbar, als Beta mit Spanne

Dominik, 01.10.2026: im Testbuild sichtbar, für Nutzer ebenfalls, nach längerer Analyse gegen die Waage. Standard im Code ist deshalb `sichtbar`; `hintergrund` bleibt als Konfiguration für einen Nutzer-Build, falls der Abgleich das nahelegt. Die Abwägung, die zu der Frage führte:

- **Sichtbar** (`EXPO_PUBLIC_ESTIMATE_MODE=sichtbar`, Standard): Nach dem Foto erscheint ausklappbar „Beta-Schätzung Körperfett: 21 bis 27 Prozent“ mit dem Hinweis, dass nur der Verlauf zählt. Vorteil: sofortiger Nutzen aus dem Foto. Nachteil: Die Schätzung ist ungeprüft; eine Zahl, die um fünf Punkte danebenliegt, kostet Vertrauen, und beim ersten Foto gibt es keinen Verlauf.
- **Hintergrund** (`hintergrund`): Die Schätzung wird berechnet und gespeichert (`estimates.raw`), der Nutzer sieht nichts. Vorteil: Abgleich mit einer Bioimpedanzwaage, bevor jemand eine Zahl sieht. Nachteil: Das Foto zeigt im Verlauf nur sich selbst.
- Regulatorisch ist beides zulässig, solange es eine Schätzung mit Spanne ohne Bewertung bleibt (CLAUDE.md, Abschnitt 2, „Erlaubt“). Der Grund für Hintergrund ist Qualität, nicht Recht.
- Umsetzung: ausklappbar im Check-in-Abschluss, Kurve mit Spanne im Verlauf, immer mit dem Hinweis, dass nur der Verlauf zählt. Beides ist eine Umgebungsvariable je Build, kein Code.

## D3. Anmeldung mit sechsstelligem E-Mail-Code statt Magic-Link

Coding-Instanz, bestätigt von der Begleitinstanz. Supabase bietet beides ohne Passwort. Magic-Links öffnen auf Android oft den Browser statt die App und brechen den Ablauf; der Code bleibt in der App. Umsetzung: `signInWithOtp` plus `verifyOtp(type: 'email')`; die E-Mail-Vorlage braucht `{{ .Token }}` (docs/SETUP.md).

## D4. Kopf abschneiden durch festen Schnitt an der Schulterlinie

Coding-Instanz, bestätigt. Die Pose-Anleitung hat eine Schulterlinie bei 20 Prozent der Bildhöhe; das Foto wird vor dem Speichern dort beschnitten (`src/lib/photo.ts`). Deterministisch, ohne Gesichtserkennung, ohne ML-Modul. Standard an, abschaltbar in den Einstellungen. Alternative wäre Gesichtserkennung auf dem Gerät gewesen (mehr Abhängigkeiten, nicht zuverlässiger).

## D5. Erinnerung als lokale Benachrichtigung

Coding-Instanz, bestätigt. Eine Erinnerung pro Woche braucht keinen Push-Server und keine Push-Tokens. Standard aus, Wochentag wählbar, 9 Uhr.

## D6. Analytics: PostHog Cloud EU mit Opt-in statt Plausible

Begleitinstanz, nachvollziehbar: Plausible ist Web-Analyse, PostHog EU kann App-Ereignisse. Umsetzung ohne SDK (nur Ereignis-Endpunkt), kein Autocapture, kein Session Replay, Standard aus, Opt-in in den Einstellungen, Kennung ist eine zufällige Installations-ID. Ereignisse enthalten keine Messwerte und keine Foto-Informationen. Im ersten Testbuild aus (kein Key gesetzt).

## D7. Programmtexte kommen aus content/ der Begleitinstanz, die App liest sie im Build-Schritt

docs/ZUSAMMENARBEIT.md. Die Coding-Instanz schreibt keine eigenen Programmtexte; bis die Dateien auf main liegen, zeigt die App Platzhalter („Woche n“, Aufgabe „Check-in der Woche“). Das erwartete Format steht in docs/CONTENT-LOADER.md; verbindlich wird content/README.md. Hinweis an Dominik: Ein Entwurf der Wochenkarten aus der Website-Checkliste existierte in dieser Session und wurde nach dieser Regel wieder entfernt; er lässt sich auf Wunsch als Platzhalter wiederherstellen.

## D8. Gemini über Google Cloud in der EU als erster Provider, Claude vorbereitet

CLAUDE.md, Abschnitt 3; Standort und Modell nach Recherche der Begleitinstanz konfigurierbar (`eu` mit aktuellem Flash, Fallback `gemini-3.5-flash` in `europe-west3`). Claude ist als zweiter Provider im Code (Google Cloud EU-Region oder Claude API mit `inference_geo=eu`). Vergleich und Empfehlung in docs/KI.md: beim Abgleich mit der Waage beide auf denselben Fotos laufen lassen.

## D9. Zero Data Retention in vier Schritten

Begleitinstanz. (a) In-Memory-Caching auf Projektebene aus, (b) Abuse-Monitoring-Ausnahme beantragen, (c) kein Request-Response-Logging, (d) im Code kein Grounding, kein Context-Caching. Schritte für Dominik in docs/SETUP.md, (d) ist umgesetzt.

## D10. Programmnamen nüchtern statt Marketing

Dominik, 01.10.2026: ernsthafte Namen. Umgesetzt: „Grundprogramm“, „Nach dem Absetzen der Abnehmspritze“, „Kraftprogramm ab 50“. Dominiks Vorschlag „Absetzprogramm Abnehmspritze“ wurde bewusst nicht gewählt: „Absetzprogramm“ klingt nach einer Anleitung zum Absetzen des Medikaments, und genau das darf die App nicht sein (keine Absetz-Anleitung, HWG). „Nach dem Absetzen“ beschreibt die Zeit danach. Wenn Dominik „Absetzprogramm“ trotzdem will, ist es eine Zeile in `src/content/programs.ts` bzw. in `content/programme/<id>/programm.md`.

## D11. main und Pull Requests

Begleitinstanz hat main angelegt (docs/ZUSAMMENARBEIT.md); die Coding-Instanz mergt ihre PRs selbst, wenn `check:all` grün ist. Einschränkung aus dem Brief, die weiter gilt: Alles, was Store-Eintrag, Einwilligungstexte, Datenschutz, Preise oder Verlinkung zu Käufen betrifft, mergt Dominik. Deshalb liegt der Store-Entwurf in einem eigenen PR; der Einwilligungs-Platzhalter ist als Platzhalter gekennzeichnet und wird durch den Entwurf der Begleitinstanz ersetzt.

## D12. Paketname und App-Name sind Arbeitstitel

`Longvy`, `de.nachderspritze.longvy`, als Konstanten in `app.config.ts` und per Umgebungsvariable überschreibbar. Der Paketname wird vor dem ersten Play-Upload endgültig festgelegt (Dachmarke offen). Für den Test reicht die APK aus dem EAS-Profil `preview`.

## D13. Vier Tabs, eine Schrift, Website-Palette

docs/DESIGN.md. Verlauf, Check-in, Programm, Einstellungen; Hanken Grotesk; Variante d1 der Website. Offen (siehe Designbrief): eigene Farbe für die Dachmarke, Dunkelmodus-Schalter, Testseite für das Verfahren.

## D14. Lokal zuerst, Konto optional

Alle Daten liegen in SQLite auf dem Gerät; ohne Konto funktioniert die App vollständig außer Sync und Foto-Schätzung. Mit Konto werden Zeilen und Fotos nach Supabase gespiegelt (Fotos nur im privaten Bucket, signierte URLs 10 Minuten). Löschen entfernt zuerst serverseitig (Edge Function), dann lokal.

## D15. Einwilligungen pro ID, Fassung und Zeitpunkt, mit Folgen für den Datenfluss

docs/REVIEW.md R1 und R2, umgesetzt 01.10.2026. IDs aus `content/rechtliches/de/einwilligung-art9.md`: `gesundheitsdaten` (Pflicht), `foto-auswertung`, `nutzungsstatistik`; dazu `alter18`. Jede Erteilung ist eine Zeile mit Fassung und Zeitpunkt, ein Widerruf setzt `revoked_at`; lokal und in Supabase. Ohne `gesundheitsdaten` verlässt nichts das Gerät. Ohne `foto-auswertung` ruft die App die Schätzung nicht auf, und die Edge Function prüft die Einwilligung noch einmal serverseitig. Widerruf von `foto-auswertung` löscht alle Schätzungen lokal und im Konto. Widerruf von `gesundheitsdaten` ist das Löschen des Kontos. Der Export enthält Schätzungen und Einwilligungen als eigene CSV-Dateien (R8).

Die Einwilligung `foto-auswertung` hat zwei Texte (`text` für hintergrund, `text_sichtbar` für sichtbar); die App zeigt den, der zu `EXPO_PUBLIC_ESTIMATE_MODE` passt.

## D16. Fragt ein Programm ein Datum ab, ist es Woche 0

Coding-Instanz, 01.10.2026. „Nach der Spritze“ fragt `letzte_dosis` ab (typ datum). Dieses Datum ist der Programmstart; es darf in der Zukunft liegen (Woche 0 beginnt dann später, bis dahin zählt Woche 0). Ein zweites Startdatum entfiele sonst nicht erklärbar daneben. Für Programme ohne Datumsfeld gilt weiter das frei gewählte Startdatum. Check-ins gehören zum Nutzer, nicht zum Programm (R11); ein Programmwechsel verliert nichts.

## D17. EXPO_PUBLIC_ bleibt für öffentliche Konfiguration erlaubt

Einwand zu docs/REVIEW.md R6 („kein EXPO_PUBLIC_ außer Supabase-URL und Anon-Key“): `EXPO_PUBLIC_` ist der einzige Weg, Werte in den App-Bundle zu bekommen, und der Bundle ist ohnehin öffentlich. Hier liegen nur Werte, die öffentlich sein dürfen: der Schätz-Modus, der PostHog-Projekt-Key (schreibt nur Ereignisse, ist in jeder PostHog-App öffentlich) und drei URLs. Geheimnisse (Service-Role, Dienstkonto, API-Schlüssel) liegen ausschließlich in Supabase-Secrets. Wenn die Begleitinstanz den PostHog-Key trotzdem nicht im Bundle will, bleibt nur ein Proxy über eine Edge Function; das wäre ein eigener PR.

## D18. Programmnamen in content/ sind Sache der Begleitinstanz

Dominik will nüchterne Namen statt Marketing (D10). Die Begleitinstanz hat das Programm am 01.10.2026 auf `nach-dem-absetzen-abnehmspritze` umbenannt; die App zeigt den Titel aus `programm.md`. Erledigt.

## D19. Zuschnitt ohne Schalter

docs/REVIEW.md R12, 01.10.2026. Der Schnitt an der Schulterlinie läuft immer; die Einwilligung verspricht Fotos ohne Kopf, ein Schalter hätte das Versprechen brechen können. Die Einstellungen zeigen den Zuschnitt nur noch als Information.

## D20. Google-Anmeldung über den Browser, kein Google-SDK

Dominik, 01.10.2026: Single Sign-on mit den Standardanbietern. Umgesetzt ist Google über Supabase (PKCE, Rücksprung per App-Link `longvy://auth`), ohne natives Google-SDK. Vorteil: läuft in Expo Go und im Build, keine SHA-1-Registrierung, kein zusätzliches natives Modul. Nachteil: ein Browserfenster statt des nativen Google-Dialogs. Apple folgt mit dem Apple-Entwicklerkonto (Pflicht auf iOS, sobald es Google gibt). Der E-Mail-Code bleibt als Weg ohne Google-Konto. Einrichtung in docs/SETUP.md, Abschnitt 3.5.
