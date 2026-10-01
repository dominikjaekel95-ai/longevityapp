# KI in Longvy: Gemini oder Claude

Stand 01.10.2026. Antwort auf die Frage „Gemini Flash oder Claude, was ist besser, und kann das Claude Code?“

## Begriffe

- **Claude Code** ist das Werkzeug, mit dem diese App gebaut wird (ein Programmier-Agent). Es läuft nicht in der App.
- **Claude API** ist der Modellzugang, den eine App serverseitig aufruft, so wie Gemini über Google Cloud. Beides kann Bilder analysieren und strukturiertes JSON liefern.
- In der App läuft nie ein Modell und liegt nie ein Schlüssel. Alle Aufrufe gehen über die Supabase Edge Function `estimate-body` (CLAUDE.md, Abschnitt 3).

## Was gebaut ist

Eine Provider-Schnittstelle `estimateBody(photo, meta)` mit drei Implementierungen in `supabase/functions/estimate-body/providers/`:

| Provider | Stand | Konfiguration |
|---|---|---|
| `gemini` | angebunden, Standard | `ESTIMATE_PROVIDER=gemini`, `GCP_PROJECT_ID`, `GCP_LOCATION` (Standard `eu`), `GEMINI_MODEL`, `GCP_SERVICE_ACCOUNT_JSON` |
| `claude` | vorbereitet, Code vorhanden | `ESTIMATE_PROVIDER=claude`, `CLAUDE_VIA=vertex` (Google Cloud, EU-Region) oder `api` (Claude API mit `inference_geo=eu`), `CLAUDE_MODEL` (Standard `claude-opus-5-5`) |
| `mock` | für Entwicklung | `ESTIMATE_PROVIDER=mock`, keine Kosten, kein Netz |

Alle drei liefern dasselbe Schema (`schema.ts`): Spanne in Prozent, Konfidenz, Konsistenz zum Vorfoto, Hinweis-Codes. Kein Freitext erreicht den Nutzer. Der Wechsel ist eine Umgebungsvariable in Supabase, kein neuer App-Build.

## Vergleich für diesen Zweck

| Kriterium | Gemini Flash (Google Cloud) | Claude (Anthropic) |
|---|---|---|
| Bildanalyse mit JSON-Schema | ja | ja (`output_config.format`) |
| EU-Datenresidenz | EU-Multi-Region `eu` oder Einzelregion; Zero-Data-Retention-Schritte in `docs/SETUP.md` | über Google Cloud in einer EU-Region, oder Claude API mit `inference_geo="eu"`; Zero Data Retention bei Anthropic auf Anfrage, für Claude Fable nicht verfügbar |
| Kosten pro Foto (grob, 1080 px, ca. 1.500 Eingabe-Token) | unter 0,1 Cent | Haiku 4.5 etwa 0,2 Cent, Sonnet 5.5 etwa 0,4 Cent, Opus 5.5 etwa 0,8 Cent (Listenpreise Anthropic: 1 / 2 / 4 Dollar je Million Eingabe-Token) |
| Bei 1.000 Nutzern mit 12 Check-ins | unter 10 Euro gesamt | unter 100 Euro gesamt |
| Qualität der Schätzung | für beide unbekannt, bis gegen eine Bioimpedanzwaage geprüft (Entscheidung 3) | wie links; Claude ist bei Anweisungstreue und Begründung meist stärker, bei dieser Aufgabe entscheidet der Abgleich |
| Infrastruktur | ein Anbieter für Gemini und spätere Dienste; Dienstkonto-JSON als Secret | zweiter Vertrag oder ebenfalls über Google Cloud |

Kosten sind bei beiden kein Argument. Entscheidend sind Datenresidenz, Prüfbarkeit der Schätzung und ob ein zweiter Anbieter die Schätzung messbar besser macht. Empfehlung: mit Gemini in der EU starten, wie im Brief, und beim Abgleich mit der Waage beide Provider auf denselben Fotos laufen lassen (`ESTIMATE_PROVIDER` umschalten, Ergebnisse stehen in `estimates.raw`). Dann entscheiden Daten, nicht Vorlieben.

## Was Claude Code zusätzlich kann

Claude Code kann die Edge Functions, Prompts und den Abgleich bauen und auswerten; es kann nicht selbst der Schätzdienst sein. Für die spätere Essensfoto-Schätzung (Phase 2) gilt dieselbe Schnittstelle und derselbe Vergleich.

## Datenschutz im Code

- Kein Grounding mit Google Search, kein Context-Caching, keine Speicherung beim Anbieter. Fotos werden übertragen, nicht hinterlegt.
- Das Modell sieht nur den Torso ohne Kopf (Zuschnitt in der App vor dem Upload).
- `estimates.raw` speichert die strukturierte Modellantwort (keine Bilder) für den Abgleich mit der Waage.
