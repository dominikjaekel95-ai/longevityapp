# Testen auf Android

Drei Wege, vom schnellsten zum vollständigsten. Für alle gilt: Node 22 oder neuer, dann einmalig

```bash
cd ~
git clone https://github.com/dominikjaekel95-ai/longevityapp.git
cd longevityapp
npm ci
```

Kein `npm install -g`: Auf dem Mac scheitert das oft an Berechtigungen (`EACCES`). Alles läuft mit `npx`.

## 1. Expo Go (zehn Minuten, kein Konto nötig)

1. App „Expo Go“ aus dem Play Store installieren.
2. Auf dem Laptop im Repo: `npx expo start`. Laptop und Handy im selben WLAN. Bricht die Verbindung ab: `npx expo start --tunnel`.
3. In Expo Go den QR-Code scannen. Die App lädt vom Laptop; Änderungen am Code erscheinen sofort.

Was geht: alles aus Phase 1, auch Kamera, lokale Datenbank, Erinnerung, Export. Was nicht geht: eigenes App-Icon und eigener Name (es ist Expo Go), und ohne `.env.local` mit Supabase-Werten läuft die App im Modus „nur Gerät“ (kein Konto, keine Foto-Schätzung).

## 2. Eigene APK über EAS (eine Stunde beim ersten Mal, dann zehn Minuten)

Voraussetzungen aus `docs/SETUP.md`: Expo-Konto, `eas init`, EAS-Secrets.

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

EAS baut in der Cloud und zeigt einen Link zur APK. Link auf dem Handy öffnen, APK installieren (Installation aus unbekannten Quellen einmal erlauben). Diese APK läuft ohne Laptop und lässt sich an Michael weitergeben. Kein Play-Upload nötig.

## 3. Development Build (für laufende Entwicklung mit nativen Modulen)

```bash
npx eas-cli@latest build --platform android --profile development
npx expo start --dev-client
```

Wie Expo Go, aber mit dem eigenen Build. Nötig, sobald Module dazukommen, die Expo Go nicht enthält (in Phase 1 keins).

## Was beim ersten Test geprüft wird

| Ablauf | Erwartung |
|---|---|
| Onboarding | Fünf Schritte, Alter und Einwilligung sind Pflicht, Programm und Startdatum, Konto optional, Erinnerung standardmäßig aus |
| Check-in mit Foto | Vorschau 3:4 mit Silhouette, Foto wird oberhalb der Schulterlinie abgeschnitten, Werte mit Vorwert als Hilfe, unter zwei Minuten |
| Foto, Ausrichtung | Handy hochkant und leicht gekippt fotografieren: Liegt der Kopf im gespeicherten Ausschnitt vollständig über der Schnittlinie? Android liefert Bilder teils gedreht (EXIF); dann meldet der Test, bei welchem Gerät |
| Check-in ohne Foto | Nur Werte, mindestens ein Wert Pflicht |
| Verlauf | Unter drei Check-ins Zahl und Veränderung, ab drei eine Kurve mit Punkten und Achsen |
| Programm | Wochenkarten mit Checkliste; Haken bleiben nach Neustart |
| Einstellungen | Erinnerung an/aus mit Wochentag, Kopf abschneiden an/aus, Sprache, Export als ZIP, Konto löschen mit Bestätigungswort |
| Offline | Flugmodus an: Check-in speichern funktioniert; danach synchronisiert die App, sobald ein Konto besteht |
| Dunkelmodus | Systemeinstellung umschalten: alle Bildschirme lesbar |

Fehler bitte mit Bildschirm, Schrittfolge und Gerätemodell melden; Screenshots helfen. Logs: in Expo Go schütteln, „Show Dev Menu“, „Debug“.

## Was die Coding-Instanz selbst prüft

Typen, Lint, Claims-Prüfung und Tests (`npm run check:all`), dazu den Web-Export als Bündel-Test. Keinen Android-Build und kein echtes Gerät: das ist der Test oben.
