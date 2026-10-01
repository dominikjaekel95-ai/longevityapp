# Einrichtung: Was Dominik anlegt und wo die Werte hingehören

Stand 01.10.2026. Konten und Schlüssel legt Dominik an (CLAUDE.md, Abschnitt 7). Kein echter Wert kommt ins Repo oder in einen Chat. Das Repo ist öffentlich; CI scannt auf Secrets.

Reihenfolge für den ersten Testbuild: 1 und 2 reichen für Expo Go und eine APK ohne Konto-Funktionen. 3 schaltet Konto, Sync und Foto-Upload frei. 4 schaltet die Foto-Schätzung frei. 5 ist optional.

## 1. Expo und EAS (Build in der Cloud)

1. Konto auf expo.dev anlegen (kostenlos). `npm i -g eas-cli`, `eas login`.
2. Im Repo: `eas init`. Das vergibt eine Projekt-ID. Sie und der Kontoname gehören in die EAS-Umgebungsvariablen (siehe Tabelle), nicht ins Repo.
3. Erste APK: `eas build -p android --profile preview` (docs/TESTEN.md). EAS fragt beim ersten Mal nach einem Keystore und erzeugt ihn selbst.

## 2. Umgebungsvariablen der App

Alle Variablen stehen mit Erklärung in `.env.example`. Lokal als `.env.local` (ist in `.gitignore`). Für EAS-Builds als Umgebungsvariablen im Expo-Projekt (Project, Environment variables; sichtbar für die Profile preview und production):

| Variable | Woher | Sichtbarkeit |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase, Project Settings, API | öffentlich (im Bundle) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase, Project Settings, API, anon public | öffentlich (RLS schützt) |
| `EXPO_PUBLIC_ESTIMATE_MODE` | `sichtbar` (Standard) oder `hintergrund` | öffentlich |
| `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST` | PostHog Cloud EU, Projekt-API-Key; leer lassen = aus | öffentlich |
| `EXPO_PUBLIC_URL_DATENSCHUTZ`, `EXPO_PUBLIC_URL_IMPRESSUM`, `EXPO_PUBLIC_URL_WISSEN` | vorläufig nachderspritze.de | öffentlich |
| `EAS_PROJECT_ID`, `EXPO_OWNER` | `eas init` | nur Build |
| `APP_NAME`, `ANDROID_PACKAGE` | Arbeitstitel `Longvy`, `de.nachderspritze.longvy`; Paketname vor dem ersten Play-Upload endgültig festlegen | nur Build |

## 3. Supabase (Region EU, Frankfurt)

1. Projekt anlegen auf supabase.com, Region **EU Central (Frankfurt)**. Kostenloser Plan reicht für den Test.
2. Supabase-CLI: `npm i -g supabase`, `supabase login`, im Repo `supabase link --project-ref <ref>`.
3. Schema einspielen: `supabase db push` (führt `supabase/migrations/0001_init.sql` aus: Tabellen, Row Level Security, privater Bucket `checkins`).
4. Auth: Authentication, Providers, Email aktivieren. **E-Mail-Vorlage „Magic Link“** auf den Code umstellen: in Authentication, Email Templates, Magic Link den Platzhalter `{{ .ConfirmationURL }}` durch `{{ .Token }}` ersetzen (sechsstelliger Code, siehe docs/DECISIONS.md). OTP-Gültigkeit 600 Sekunden.
5. Edge Functions: `supabase functions deploy estimate-body` und `supabase functions deploy delete-account`.
6. Secrets für die Functions (nie in EAS, nie im Repo): `supabase secrets set NAME=WERT`. `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` setzt Supabase selbst.

| Secret | Wert |
|---|---|
| `ESTIMATE_PROVIDER` | `mock` für den ersten Test, `gemini` sobald Schritt 4 steht, `claude` vorbereitet |
| `ESTIMATE_CONSISTENCY_THRESHOLD` | `0.6` |
| `GCP_PROJECT_ID`, `GCP_LOCATION`, `GEMINI_MODEL`, `GCP_SERVICE_ACCOUNT_JSON` | aus Schritt 4 |
| `VERTEX_API_HOST` | nur setzen, wenn der Endpunkt für den EU-Standort ein anderer Host ist |

## 4. Google Cloud: Gemini über die Gemini Enterprise Agent Platform (vormals Vertex AI)

Angaben zu Regionen und Modellnamen stammen aus der Recherche der Begleitinstanz (Stand 01.10.2026) und sind beim Anlegen in der Konsole zu prüfen; der Code hat nichts davon hartkodiert.

1. Projekt anlegen, Abrechnung aktivieren, die API der Plattform aktivieren.
2. Standort: Standard ist die EU-Multi-Region `eu` (Speicherung und Verarbeitung in der EU dokumentiert) mit dem aktuellen Flash-Modell. Fallback laut Begleitinstanz: `gemini-3.5-flash` in `europe-west3` (Einzelregion Frankfurt, von Google als Legacy geführt, ohne Abschaltdatum). Beides nur über `GCP_LOCATION` und `GEMINI_MODEL`.
3. Dienstkonto mit Rolle „Vertex AI User“ anlegen, JSON-Schlüssel erzeugen, Inhalt einzeilig als `GCP_SERVICE_ACCOUNT_JSON` in Supabase setzen. Die Datei danach nicht aufheben.
4. Zero Data Retention, vier Schritte:
   - (a) In-Memory-Caching auf Projektebene abschalten (einmaliger API-Aufruf laut Google-Dokumentation zu „data caching“ der Plattform). Vor dem ersten echten Foto.
   - (b) Ausnahme vom Prompt-Logging für das Abuse Monitoring per Google-Formular beantragen. Vor den ersten echten Nutzern, nicht für den internen Test nötig.
   - (c) Request-Response-Logging nicht aktivieren.
   - (d) Im Code bereits so: kein Grounding mit Google Search, kein Context-Caching.
5. Nach dem Umstellen `ESTIMATE_PROVIDER=gemini` setzen und einen Check-in mit Foto testen; das Ergebnis steht in der Tabelle `estimates`.

## 5. PostHog Cloud EU (optional, im ersten Testbuild aus)

Projekt auf eu.posthog.com anlegen, Projekt-API-Key als `EXPO_PUBLIC_POSTHOG_KEY`. In den Projekteinstellungen Autocapture und Session Replay aus, „Discard client IP data“ an. Die App sendet nur mit Opt-in in den Einstellungen und nie Messwerte oder Foto-Informationen.

## 6. Später

- Google Play Console (25 Dollar einmalig) erst für die Veröffentlichung; der Test läuft über APKs. Vorher Paketname und Dachmarke festlegen, Datensicherheitsformular und „Health apps“-Erklärung ausfüllen (Vorlage in `store/android-listing.md`).
- Datenschutzerklärung und Impressum auf der endgültigen Domain, dann die drei URL-Variablen anpassen.
- iOS: Konfiguration liegt in `app.config.ts`, Build erst in Phase 3 (Apple-Entwicklerkonto nötig).

## Hinweis zur Umgebung der Coding-Instanz

Die Cloud-Umgebung der Coding-Instanz erreicht derzeit api.expo.dev und supabase.com nicht (Netzwerkrichtlinie). Sie kann deshalb Builds nicht selbst anstoßen und Migrationen nicht selbst einspielen. Wird das gewünscht, sind diese Hosts in den Umgebungseinstellungen freizugeben und ein Expo-Zugriffstoken (`EXPO_TOKEN`) sowie ein Supabase-Zugriffstoken als Umgebungs-Secrets zu hinterlegen.
