# Longvy

Allgemeine Longevity-App: Körperzusammensetzung aus Fotos, Kraft, Verlauf, Programme. Android zuerst, iOS aus demselben Code später. Expo (React Native, TypeScript), Expo Router, Supabase (EU, Frankfurt), KI nur serverseitig.

Verbindliche Vorgaben: `CLAUDE.md` (Brief und Zweckbestimmung), `docs/ZUSAMMENARBEIT.md` (Rollen der beiden Claude-Instanzen), `docs/DESIGN.md` (Gestaltung), `docs/DECISIONS.md` (Entscheidungen mit Begründung).

## Befehle

```bash
npm ci                    # Abhängigkeiten (Node 22)
npm run build:content     # content/ der Begleitinstanz nach src/content/generated/content.json einlesen
npm run check:all         # Inhalte, Typen, Lint, Claims-Prüfung, Tests. Pflicht vor jedem Push.
npm start                 # Expo-Entwicklungsserver (Expo Go oder Dev Build)
npx eas-cli build -p android --profile preview   # APK zum Testen (docs/TESTEN.md)
```

## Struktur

| Pfad | Inhalt |
|---|---|
| `src/app/` | Bildschirme (Expo Router): `onboarding/`, `(tabs)/` mit Verlauf, Check-in, Programm, Einstellungen, `checkin/` (Foto, Werte, Fertig), Detailseiten |
| `src/components/` | Bausteine nach `docs/DESIGN.md`: Txt, Screen, Button, Field, Row, Choice, Checkbox, Notice, LineChart, Silhouette, TabIcon |
| `src/content/` | `claims.ts` (alle Texte mit Körper- oder Gesundheitsbezug), `programs.ts` (Programmverzeichnis), Loader für `content/`, Platzhalter, `generated/content.json` |
| `src/i18n/` | Oberflächentexte Deutsch und Englisch, `t()`, `tc()`, Formatierung |
| `src/lib/db/` | SQLite-Schema und Repositories (lokal zuerst) |
| `src/lib/sync/` | Supabase-Client, Abgleich, Foto-Upload in den privaten Bucket |
| `src/lib/estimate/` | Aufruf der Edge Function für die Foto-Schätzung |
| `src/lib/` | Fotoverarbeitung (Schnitt an der Schulterlinie), Erinnerung, Export, Analytics (PostHog EU, Opt-in), Trends, Daten |
| `src/theme/` | Design-Tokens: Farben der Website (Variante d1), Hanken Grotesk, Abstände |
| `supabase/` | Migration mit Row Level Security und Bucket-Regeln, Edge Functions `estimate-body` (Provider Gemini, Claude, Mock) und `delete-account` |
| `scripts/` | `check-claims.mjs` mit `forbidden-terms.json`, `build-content.mjs` |
| `content/` | Programmtexte und Rechtstext-Entwürfe der Begleitinstanz (nur sie ändert dort) |
| `docs/` | SETUP, TESTEN, DECISIONS, DESIGN, KI, CONTENT-LOADER, REVIEW (Begleitinstanz) |
| `store/` | Entwurf des Store-Eintrags, Freigabe durch Dominik |

## Arbeitsweise

Ein Pull Request pro Thema gegen `main`. `npm run check:all` muss grün sein. Vor jedem neuen PR: `git fetch origin`, `docs/REVIEW.md` lesen, offene MUSS-Punkte zuerst. Fragen an die Begleitinstanz stehen in der PR-Beschreibung unter „Frage an die Begleitinstanz“. Entscheidungen trifft Dominik; Vorschläge mit Abwägung stehen in `docs/DECISIONS.md`.
