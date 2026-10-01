# Recherche: multimodale KI-Anbieter für die Foto-Schätzung

Stand 01.10.2026, erstellt von einem Recherche-Agenten der Coding-Instanz im Auftrag von Dominik. Aus der Umgebung waren viele Hersteller-Domains gesperrt; vollständig gelesen wurden die Anthropic-Dokumentation, die Anthropic-Nutzungsrichtlinie, der GitHub-Spiegel der Supabase-Doku, die BodyM-Registry-Datei und ein GitHub-Issue zum Gemini-EU-Endpunkt. Alle anderen Aussagen stützen sich auf Suchauszüge der genannten URL (Kennzeichnung „SA“) und sind vor Entscheidungen in der jeweiligen Konsole zu prüfen. Preise: Datum laut Quelle, sonst Abruf 01.10.2026. Zusammenfassung und Empfehlung stehen in `docs/KI.md`.

## 1. Bildeingabe und strukturierte JSON-Ausgabe

| Anbieter | Bildeingabe | JSON-Schema-Ausgabe | Quelle |
|---|---|---|---|
| Google Gemini | ja | ja, `responseSchema` in `generateContent`; mit Bild-Input dokumentiert | ai.google.dev/gemini-api/docs/structured-output (SA); discuss.ai.google.dev/t/76731 (SA) |
| OpenAI | ja | ja, `json_schema` mit `strict: true`, „compatible with vision inputs“ | openai.com/index/introducing-structured-outputs-in-the-api (SA); developers.openai.com/api/docs/guides/structured-outputs (SA) |
| xAI Grok | ja (jpg/png, max. 20 MiB) | ja, JSON-Schema in `response_format` | docs.x.ai/docs/guides/image-understanding (SA); docs.x.ai/developers/model-capabilities/text/structured-outputs (SA) |
| Anthropic Claude | ja (JPEG/PNG/GIF/WebP, max. 8000×8000 px, 10 MB; auf Bedrock/Google Cloud 5 MB, nur base64) | ja, `output_config.format` (GA) auf Claude API, Google Cloud, Microsoft Foundry. Nicht auf „Claude in Amazon Bedrock“ (neue Integration ab Opus 4.7) | platform.claude.com: vision, structured-outputs, claude-in-amazon-bedrock (gelesen) |
| Mistral | ja (Medium 3.5, Small 4, Pixtral Large) | ja, `response_format` json_schema | openrouter.ai/mistralai/mistral-medium-3-5 (SA); docs.mistral.ai/capabilities/vision (SA) |
| Alibaba Qwen-VL | ja | JSON-Schema-Modus (`strict: true`) für Qwen3-VL und neuer „in non-thinking mode“ | alibabacloud.com/help/en/model-studio/qwen-structured-output (SA) |
| Meta Llama 4 (gehostet) | ja | hosterabhängig, nicht geprüft | keine Quelle gefunden |

## 2. Datenresidenz EU und Speicherung der Eingaben

**Google (Gemini Enterprise Agent Platform, vormals Vertex AI).** Regionale Endpunkte (europe-west1/-west3/-west4 u. a.) und eine EU-Multi-Region `eu` über `aiplatform.eu.rep.googleapis.com`; der globale Endpunkt kann in die USA routen (GitHub-Issue epam/ai-dial-adapter-vertexai#471 vom 27.05.2026, gelesen; optinest.de, SA). Engpass ist die Modellverfügbarkeit: Gemini 3.5 Flash in `eu` sowie single-region europe-west2/-west3 (London, Frankfurt); Gemini 3.1 Flash Lite in `eu`; Gemini 3.1 Pro nur global; Gemini 3.8 Flash nur global plus EU/US-Multi-Region (docs.cloud.google.com, modelavailability.com, innfactory.ai; SA). Für Frankfurt-Pinning bleibt damit derzeit Gemini 3.5 Flash; für Pro-Modelle ist keine EU-Option belegt. Speicherung: Ein- und Ausgaben werden standardmäßig bis zu 24 h im Arbeitsspeicher gecacht (projektweit, nicht at-rest); für Zero Data Retention Caching pro Projekt abschalten und per Antrag aus dem Abuse-Monitoring austreten (docs.cloud.google.com/vertex-ai/generative-ai/docs/vertex-ai-zero-data-retention, SA). Kein Training mit Kundendaten (meetily.ai, SA).

**OpenAI.** EU-Datenresidenz nur für neu angelegte Projekte mit Region „Europe“, Endpunkt `https://eu.api.openai.com`; Anfragen werden „handled in-region … with zero data retention“ (openai.com/index/introducing-data-residency-in-europe, SA; help.openai.com/en/articles/10503543, SA). Für Nicht-US-Regionen verlangt OpenAI eine Freigabe für Abuse-Monitoring-Kontrollen und ein ZDR-Amendment (openempower.com, SA). Bildeingabe ist im EU-Modus für `/v1/chat/completions` abgedeckt; GPT-5.4 und GPT-5.5 mit Residenz kosten 10 % Aufschlag (developers.openai.com, SA).

**xAI.** Dokumentiert ist ein US-Regionalendpunkt `https://us.api.x.ai/v1` (nur grok-4.7/4.6, +10 %), für Enterprise „Data residency options“ und „EU data residency options“ ohne benannte Region (docs.x.ai/developers/faq/security, SA). Ein `eu-west-1`-Endpunkt wird nur in Drittquellen genannt (mem0.ai, SA). Speicherdauer und ZDR: keine Primärquelle gefunden.

**Anthropic.** Claude API (First Party): `inference_geo` kennt nur `"global"` und `"us"`, keine EU-Option (platform.claude.com/docs/en/manage-claude/data-residency, gelesen). EU über Partner: Google Cloud Multi-Region `eu` für alle aktuellen Modelle; single-region (z. B. europe-west1) nur bis Sonnet 4.6; Aufschlag 10 % (claude-on-vertex-ai, gelesen). Amazon Bedrock: EU-Inference-Profil inklusive eu-central-1 Frankfurt, In-Region-only nur eu-north-1 und eu-west-1, regional +10 %, aber ohne Structured Outputs in der neuen Integration (claude-in-amazon-bedrock, gelesen). Bilder: „Image uploads are ephemeral and not stored beyond the duration of the API request“, kein Training (Vision-Doku, gelesen).

**Mistral.** La Plateforme läuft in der EU; Endpunkt `api.eu.mistral.ai` (EU/EFTA-Rechenzentren) (requesty.ai, SA). Zustandslose API-Aufrufe werden 30 Tage für Abuse-Monitoring gespeichert; ZDR nur im Scale-Plan (docs.prisme.ai, meetily.ai, SA).

**Alibaba Qwen.** Model Studio hat eine Region Deutschland (Frankfurt) mit eigener Preisliste (alibabacloud.com, inferencehub.org, SA). Speicherdauer/ZDR: keine Quelle gefunden. US-Hoster (Together, Fireworks) bieten EU nur für dedizierte Deployments (SA).

**Meta Llama.** Llama 4 auf Bedrock nur in US-Regionen; die Llama-4-Community-Lizenz schließt Unternehmen mit Hauptsitz in der EU von den multimodalen Modellen aus (innfactory.ai, SA; Lizenztext nicht erreichbar). Für ein EU-Unternehmen damit ausgeschlossen.

**Supabase.** Edge Functions laufen standardmäßig in der Region, die dem Aufrufer am nächsten ist; mit Header `x-region: eu-central-1` oder Client-Option `region` fest auf Frankfurt gepinnt (Supabase-Doku, gelesen). Das pinnt nur die Funktion; die Region des KI-Aufrufs ist getrennt zu wählen.

## 3. Preis pro Foto (1080 × 1152 px)

Annahmen: Bild plus 300 Prompt-Tokens, 150 Ausgabe-Tokens (JSON), Listenpreise USD, grobe Rechnung.

| Modell | Bild-Tokens | In/Out je 1M | Kosten/Foto | Preisquelle |
|---|---|---|---|---|
| Gemini 3.5 Flash | 1 120 (media_resolution_high), 560 (medium) | 1,50 / 9,00 | 0,0035 | docs.cloud.google.com (SA) |
| Gemini 3.1 Pro | 1 120 | 2,00 / 12,00 | 0,0046 | docs.cloud.google.com (SA) |
| Gemini 3.8 Flash | 1 120 | 0,75 / 3,75 (Einführungspreis bis 31.12.2026) | 0,0017 | developer.puter.com, Sep 2026 (Drittquelle) |
| GPT-5.5 | 630 (detail high) | 5,00 / 30,00 | 0,009 (+10 % EU) | morphllm.com, cometapi.com (SA) |
| Grok 4.3 | ≤ 1 792 | 1,25 / 2,50 | 0,003 | openrouter.ai, mem0.ai (SA) |
| Grok 4.7 | ≤ 1 792 | 2,00 / 6,00 (+10 % US-Regional) | 0,005 | mem0.ai (SA) |
| Claude Haiku 4.5 | 1 564 | 1,00 / 5,00 | 0,0026 (+10 % EU-Endpunkt) | platform.claude.com (gelesen) |
| Claude Sonnet 5.5 | 1 638 | 2,00 / 10,00 | 0,0054 (+10 %) | platform.claude.com (gelesen) |
| Claude Opus 5.5 | 1 638 | 4,00 / 20,00 | 0,011 (+10 %) | platform.claude.com (gelesen) |
| Mistral Medium 3.5 | 1 587 | 1,50 / 7,50 | 0,004 | openrouter.ai (SA) |
| Mistral Small 4 | 1 587 | 0,15 / 0,60 | 0,0004 | openrouter.ai (SA) |
| Qwen3-VL-Plus (Frankfurt) | ca. 1 280–1 587 | 0,20 / 1,60 | 0,0006 | morphllm.com (SA) |
| Qwen3-VL-Flash (Frankfurt) | wie oben | 0,05 / 0,40 | 0,0002 | inferencehub.org (SA) |

Bei acht Check-ins je Nutzer in zwölf Wochen liegen die Modellkosten je Nutzer zwischen etwa 0,2 Cent (Qwen Flash) und 9 Cent (Opus). Der Preis ist nachrangig gegenüber Qualität, Residenz und Verweigerungsrate.

## 4. Belege zur Qualität

Spezialisierte Verfahren (CNN/3D, Referenz DXA):
- ShapedNet, Einzelbild, 1 273 Erwachsene: MAE 1,59 Prozentpunkte (Männer), 2,03 (Frauen) (arxiv.org/abs/2310.09709; SA).
- Amazon „Visual Body Composition“ (Majmudar et al., npj Digital Medicine 2022, mehrere Fotos): „accurate and without significant bias compared to DXA“ (nature.com/articles/s41746-022-00628-3, SA).
- Cambridge/Fenland-App, 4 Fotos zu 3D-Avatar, >20 000 DXA-Scans (npj Digital Medicine 2025): „high level of accuracy“, Zahlen nicht abrufbar (SA).
- Spren Vision (Smartphone-Kamera, Pennington Biomedical): MAE 2,6 %, Median 1,9 %, r 0,95; Herstellerpressemitteilung (SA).
- Prism Labs (3D-Scan per Smartphone, 550 Personen): MAE 3,24 %, r 0,95; Hersteller-Whitepaper 2026 (SA).
- Unabhängige Prüfung einer Smartphone-CV-App: „reliable but biased compared to BODPOD and InBody“ (medRxiv 2025, SA).
- CASCON 2025 (arXiv 2511.17576): CNN auf 282 Reddit-Frontalfotos mit selbstberichtetem Körperfett: MAE 3,34 %; die Autoren: „no public datasets exist for computer-vision-based body fat estimation“ (SA).
- Herstellerzusammenfassung (gainframe.app): Einzelfoto ±4–5 Prozentpunkte gegen DXA; Front plus Seite halbiert den Fehler etwa (SA).

Allgemeine Vision-LLMs:
- Peer-reviewte Studien zu GPT, Gemini, Claude oder Grok bei Körperfett-Schätzung: keine Quelle gefunden.
- Informeller Test (A. Riedl, Mai 2025, GPT-4o, Reddit-Fotos mit selbstberichteten DEXA-Werten): Median-Absolutfehler 2,4 Prozentpunkte bei Männern, 5,7 bei Frauen (annaleptikon.substack.com, SA; Kritik im HN-Thread 44008867). Kein kontrolliertes Design.
- Essensfotos: Benchmark mit zehn Modellen auf Nutrition5k, 3 229 Bilder (bioRxiv, 07/2026): Gemini 3.0 Flash MAE 80,7 kcal, CCC 0,767; Gemini 3.1 Flash Lite CCC 0,754 bei 0,59 USD je 1 000 Bilder; GPT-4o, GPT-4o-mini, GPT-5 Mini, Claude Haiku 4.5 und Qwen2-VL-7B schlechter (SA). Drei-LLM-Studie 2025 mit standardisierten Fotos: ChatGPT und Claude MAPE rund 36 % für Energie, Gemini 64–110 % (pubmed 41081011, SA). Spannen müssen breit sein.
- Verzerrung: VLMs folgen Sprach-Priors statt Bildbefund (arXiv 2505.23941, SA); LLM-Regression leidet unter Quantisierung durch Tokenisierung (karthick.ai, SA). Mittelwert-Tendenz bei Körperfett: im eigenen Benchmark über die Regressionssteigung zu prüfen.

## 5. Verweigerungsverhalten und Richtlinien

- Google: Prohibited Use Policy verbietet irreführende Expertise-Behauptungen in Gesundheitsfragen und automatisierte Hochrisiko-Entscheidungen im Gesundheitswesen ohne menschliche Aufsicht (SA). Sicherheitsfilter per API einstellbar, „harte“ Filter nicht. Belegte Fehlalarme betreffen Unterwäsche- und Bademoden-Bilder bei der Bildgenerierung (SA). Für Bildverständnis leicht bekleideter Personen: keine Quelle gefunden.
- OpenAI: Usage Policies vom 29.10.2025 verbieten „tailored advice that requires a license, such as … medical advice, without appropriate involvement by a licensed professional“ (SA). Ob eine nicht-medizinische Körperfett-Spanne darunter fällt, ist nicht geregelt.
- Anthropic: Gesundheitsentscheidungen sind Hochrisiko-Anwendung mit Pflicht zu Fachprüfung und Offenlegung; „wellness advice (sleep, stress, nutrition, exercise)“ ausdrücklich ausgenommen. Verboten ist die Kritik von Körperform oder -größe; sexuelle Inhalte verboten (anthropic.com/legal/aup, gelesen). Verweigerungen kommen als `stop_reason: "refusal"`. Ein neutrales Schätz-JSON ohne Bewertung steht nicht im Widerspruch zur AUP.
- xAI: AUP verbietet Sexualisierung realer Personen; zu Gesundheitsanwendungen nichts Spezifisches gefunden (SA).
- Messbare Verweigerungsraten bei Fotos mit freiem Oberkörper oder in Unterwäsche: keine Quelle gefunden; nur im eigenen Benchmark feststellbar.

## 6. Allgemeine Bild-Benchmarks (Stand 2026, Spiegelseiten)

- LMArena Vision (Spiegel, Juli 2026): Platz 1 claude-fable-5, dann Claude Opus 4.7-thinking und Claude Opus 4.6, danach Gemini- und GPT-Modelle (modelgauntlet.com, benchmarklist.com; SA).
- MMMU-Pro (Spiegel, August 2026): GPT-5.4 Pro 94 %, Gemini 3.1 Pro 83,9 %, Gemini 3.5 Flash 83,6 %; Claude Opus 5.5 88 % in einer anderen Auswertung; Qwen3.6-Plus 86 % auf MMMU (SA). Nicht direkt vergleichbar.
- Diese Benchmarks messen Dokument-, Diagramm- und Prüfungsaufgaben; ein Zusammenhang mit der Schätzgüte von Körperfett ist nicht belegt.

## Vergleichstabelle

| Kriterium | Gemini | OpenAI | xAI | Claude | Mistral | Qwen-VL | Llama 4 |
|---|---|---|---|---|---|---|---|
| Bild + JSON-Schema | ja | ja | ja | ja (nicht auf neuem Bedrock) | ja | ja (non-thinking) | hosterabhängig |
| EU-Verarbeitung | `eu`-Multi-Region; Frankfurt nur 3.5 Flash; Pro nur global | EU-Projekt, eu.api.openai.com, +10 % | unklar | über Google Cloud `eu` (+10 %) oder Bedrock EU (+10 %, ohne Structured Outputs); First Party nein | EU-Hosting | Alibaba Frankfurt | nein |
| Keine Speicherung der Eingaben | 24-h-Cache abschaltbar, Abuse-Opt-out per Antrag | ZDR im EU-Modus | nicht belegt | Bilder ephemer; Partnerregeln | 30 Tage; ZDR nur Scale | nicht belegt | – |
| Kosten/Foto (USD) | 0,002–0,005 | 0,009 | 0,003–0,005 | 0,003–0,011 | 0,0004–0,004 | 0,0002–0,0006 | 0,0005 |
| Qualitätsbeleg Körperfett | keiner | nur informell | keiner | keiner | keiner | keiner | keiner |
| Essensfoto-Beleg | bester Wert (Nutrition5k 2026) | mittel | – | mittel | – | schwach | – |
| Richtlinienrisiko Körperfoto | Filter-Fehlalarme möglich | „tailored medical advice“ | kaum dokumentiert | neutrale Schätzung zulässig | nicht geprüft | nicht geprüft | – |

## 7. Vorschlag für einen eigenen Benchmark

- Probanden: eigene Erhebung mit ausdrücklicher Einwilligung (Art. 9 DSGVO), 60 bis 100 Erwachsene, breite Spanne nach Alter, Geschlecht, BMI 18 bis 40. Referenz: Bioimpedanz für alle (gleiches Gerät, morgens, nüchtern), DXA für eine Teilmenge von 20 bis 30 Personen, um den BIA-Fehler selbst zu beziffern.
- Fotos: pro Person zwei Aufnahmen am selben Tag mit der App-Posenanleitung (frontal, Kopf abgeschnitten, 1080×1152), zusätzlich eine Variante bei anderem Licht; identische Vorverarbeitung für alle Anbieter.
- Prompt und Schema identisch: Spanne, Spannenmitte, Konfidenz, Pose- und Lichthinweise; kein Freitext; Temperatur 0, wo möglich; drei Wiederholungen je Bild.
- Metriken: MAE der Spannenmitte gegen BIA/DXA in Prozentpunkten, getrennt nach Geschlecht und BMI-Tertil; Trefferquote der Spanne zusammen mit der mittleren Spannenbreite; Bias und Steigung der Regression Schätzung auf Referenz (Steigung deutlich unter 1 ist das Warnsignal für Mittelwert-Tendenz); Test-Retest zwischen den zwei Fotos (ICC, mittlere absolute Differenz); Verweigerungs- und Fehlerrate je Kleidungsgrad; Latenz p50/p95 aus der Edge Function in Frankfurt; Kosten aus den Token-Zählern.
- Mindestanforderung für die App: Test-Retest-Differenz deutlich kleiner als die in zwölf Wochen erwartete Veränderung, sonst ist der Verlauf Rauschen; Verweigerungsrate unter 5 %.
- Stichprobe: Bei n = 80 und einer Fehler-Standardabweichung von etwa 4 Prozentpunkten liegt das 95-%-Konfidenzintervall des MAE bei etwa ±0,9 Punkten. Das trennt „brauchbar“ von „unbrauchbar“, aber keine Anbieterunterschiede unter einem Punkt.

Öffentliche Datensätze (Lizenz geprüft, soweit erreichbar): BodyM (Silhouetten, kein Körperfett, CC BY-NC), HBW/SHAPY (Fotos mit 3D-Scans, kein Körperfett, nur Forschung), Model Agency Dataset (Körpermaße, kein Körperfett), UniqueData body-measurements (CC BY-NC-ND, kein Körperfett), Reddit-Scrapes mit selbstberichteten DEXA-Werten (keine Lizenz, personenbezogen, nicht nutzbar), NHANES (DXA ohne Fotos), UK Biobank und Fenland (nur Forschung auf Antrag). Ergebnis: Kein öffentlicher Datensatz verbindet echte Frontalfotos mit gemessenem Körperfett unter einer Lizenz, die den Test für ein kommerzielles Produkt erlaubt. Der Benchmark braucht eigene Daten.

## Nicht belegbar

Offizielle Google-Preis- und Datenresidenz-Seiten (nur Suchauszüge); Verfügbarkeit anderer Gemini-Modelle als 3.5 Flash in europe-west3. OpenAI: offizielle Preisseite, Wortlaut der Usage Policies. xAI: EU-Endpunkt und Speicherfristen aus Primärquelle. Mistral und Alibaba: Datenschutz- und ZDR-Bedingungen aus Primärquelle. Llama 4: Lizenztext. Jede peer-reviewte Messung von GPT, Gemini, Claude oder Grok bei Körperfett; Verweigerungsraten bei Körperfotos. Offizielle Leaderboard-Stände.

## Quellen

Google: ai.google.dev/gemini-api/docs/structured-output · ai.google.dev/gemini-api/docs/tokens · ai.google.dev/gemini-api/docs/generate-content/gemini-3 · cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing · docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash · docs.cloud.google.com/gemini-enterprise-agent-platform/resources/data-residency · docs.cloud.google.com/vertex-ai/generative-ai/docs/vertex-ai-zero-data-retention · github.com/epam/ai-dial-adapter-vertexai/issues/471 · modelavailability.com/models/google/gemini-3-5-flash · ai.google.dev/gemini-api/docs/safety-settings · policies.google.com/terms/generative-ai/use-policy
OpenAI: openai.com/index/introducing-structured-outputs-in-the-api · developers.openai.com/api/docs/guides/images-vision · openai.com/index/introducing-data-residency-in-europe · help.openai.com/en/articles/10503543-data-residency-for-the-openai-api · developers.openai.com/api/docs/models/gpt-5.5 · openai.com/policies/usage-policies
xAI: docs.x.ai/docs/guides/image-understanding · docs.x.ai/developers/model-capabilities/text/structured-outputs · docs.x.ai/developers/faq/security · openrouter.ai/x-ai/grok-4.3
Anthropic: platform.claude.com/docs/en/build-with-claude/vision · platform.claude.com/docs/en/build-with-claude/structured-outputs · platform.claude.com/docs/en/about-claude/pricing · platform.claude.com/docs/en/manage-claude/data-residency · platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock · platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai · platform.claude.com/docs/en/build-with-claude/refusals-and-fallback · anthropic.com/legal/aup
Mistral: docs.mistral.ai/capabilities/vision · openrouter.ai/mistralai/mistral-medium-3-5 · requesty.ai/eu/mistral · docs.prisme.ai/resources/security/llm-provider-data-retention
Qwen und Hoster: alibabacloud.com/help/en/model-studio/qwen-structured-output · alibabacloud.com/help/en/model-studio/model-pricing · inferencehub.org/blog/alibaba-cloud-qwen-api-pricing-2026 · support.together.ai/articles/8079447813 · docs.fireworks.ai/deployments/regions
Llama: docs.aws.amazon.com/bedrock/latest/userguide/model-card-meta-llama-4-maverick-17b-instruct.html · innfactory.ai/en/ai-models/meta-llama
Supabase: supabase.com/docs/guides/functions/regional-invocation
Studien: arxiv.org/abs/2310.09709 · nature.com/articles/s41746-022-00628-3 · jesus.cam.ac.uk/articles/body-fat-accurately-predicted-ai-powered-smartphone-app · spren.com/blog/the-latest-spren-vision-validation-research · prismlabs.tech/white-papers/body-composition-dxa-alternative-2026 · medrxiv.org/content/10.1101/2025.08.01.25332763v1.full · ieeexplore.ieee.org/document/8490993 · arxiv.org/abs/2511.17576 · annaleptikon.substack.com/p/can-chatgpt-accurately-estimate-body · news.ycombinator.com/item?id=44008867 · biorxiv.org/content/10.64898/2026.07.26.740845v1 · pubmed.ncbi.nlm.nih.gov/41081011 · arxiv.org/html/2505.23941v4
Benchmarks: modelgauntlet.com/leaderboard/vision · benchlm.ai/benchmarks/mmmu-pro · llm-stats.com/benchmarks/mmmu-pro
Datensätze: github.com/awslabs/open-data-registry/blob/main/datasets/bodym.yaml · shapy.is.tue.mpg.de/datasets.html · huggingface.co/datasets/UniqueData/body-measurements-dataset
