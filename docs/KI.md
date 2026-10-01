# KI in Longvy: Anbieterwahl für die Foto-Schätzung

Stand 01.10.2026. Antwort auf die Fragen „Gemini Flash oder Claude, was ist besser, kann das Claude Code, und sind ChatGPT oder Grok besser?“ Die vollständige Recherche mit Quellen steht in `docs/KI-RECHERCHE.md`.

## Ergebnis der Recherche in sechs Sätzen

Kein Anbieter hat einen belegten Vorsprung bei der Körperfett-Schätzung aus Fotos; es gibt keine begutachtete Studie zu GPT, Gemini, Claude oder Grok dafür, nur einen informellen GPT-4o-Test. Spezialisierte Bildmodelle erreichen gegen DXA etwa 1,6 bis 3,3 Prozentpunkte Fehler, ein einzelnes Frontalfoto eher 4 bis 5; das ist der Maßstab, an dem sich jeder Anbieter messen muss. Für EU-Verarbeitung taugen derzeit Gemini (`eu`-Multi-Region über `aiplatform.eu.rep.googleapis.com`, Frankfurt allein nur mit Gemini 3.5 Flash), OpenAI (EU-Projekt mit `eu.api.openai.com` und Zero Data Retention, 10 Prozent Aufschlag), Claude über Google Cloud `eu` (10 Prozent Aufschlag; über Bedrock ohne strukturierte Ausgabe), Mistral (EU-Hosting, aber 30 Tage Speicherung ohne Scale-Plan) und Qwen in Alibaba Frankfurt; Grok hat keine belegte EU-Region, Llama 4 ist für EU-Unternehmen lizenzrechtlich ausgeschlossen. Kosten liegen bei allen zwischen 0,02 und 1 Cent pro Foto und entscheiden nichts. Es gibt keinen öffentlichen Datensatz mit echten Fotos und gemessenem Körperfett, den ein kommerzielles Produkt nutzen dürfte; der Benchmark braucht eigene Daten mit Einwilligung, Bioimpedanzwaage für alle und DXA für eine Teilmenge. Empfehlung: Gemini 3.5 Flash in `eu` als Start, OpenAI im EU-Modus als zweiten Provider anbinden, Claude über Google Cloud `eu` als dritten, und alle drei im eigenen Benchmark auf denselben Fotos messen; dann entscheiden Zahlen.

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

## Nächste Schritte

1. Provider `openai` (EU-Endpunkt, Structured Outputs) neben `gemini` und `claude` in `supabase/functions/estimate-body/providers/` anlegen; gleiche Schnittstelle, gleiches Schema.
2. Benchmark-Werkzeug `scripts/benchmark-estimate/`: Ordner mit Fotos und Referenzwerten (BIA, optional DXA), läuft alle Provider mit identischem Prompt dreimal je Bild, schreibt MAE, Trefferquote der Spanne, Spannenbreite, Bias, Steigung, Test-Retest, Verweigerungsrate, Latenz und Kosten als CSV.
3. Datenerhebung mit Dominik und Michael planen: 60 bis 100 Personen, Einwilligung, eine Waage, zwei Fotos pro Person. Vorher genügt ein Lauf mit euren eigenen Fotos, um grobe Ausreißer und Verweigerungen zu sehen.

## Was Claude Code zusätzlich kann

Claude Code kann die Edge Functions, Prompts und den Abgleich bauen und auswerten; es kann nicht selbst der Schätzdienst sein. Für die spätere Essensfoto-Schätzung (Phase 2) gilt dieselbe Schnittstelle und derselbe Vergleich.

## Datenschutz im Code

- Kein Grounding mit Google Search, kein Context-Caching, keine Speicherung beim Anbieter. Fotos werden übertragen, nicht hinterlegt.
- Das Modell sieht nur den Torso ohne Kopf (Zuschnitt in der App vor dem Upload).
- `estimates.raw` speichert die strukturierte Modellantwort (keine Bilder) für den Abgleich mit der Waage.
