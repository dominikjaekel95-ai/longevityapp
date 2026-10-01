---
status: entwurf
version: "0.1"
stand: 2026-10-01
geltung: "Testversion für eingeladene Testerinnen und Tester"
einwilligungen:
  - id: gesundheitsdaten
    pflicht: true
    text: "Ich willige ausdrücklich ein, dass meine Gesundheitsdaten (Gewicht, Taillenumfang, Griffkraft, Check-in-Fotos ohne Kopf, Angaben zu meinem gewählten Programm und mein Programmfortschritt) auf meinem Gerät und auf Servern in Frankfurt am Main gespeichert und verarbeitet werden, damit die App mir mein Programm und meinen Verlauf anzeigen kann."
  - id: foto-auswertung
    pflicht: false
    text: "Ich willige ausdrücklich ein, dass meine Check-in-Fotos ohne Kopf an Google übermittelt und dort in der EU automatisch ausgewertet werden, um meine Körperzusammensetzung zu schätzen. In dieser Version wird die Schätzung nur gespeichert und mir nicht angezeigt. Sie dient dazu, die Genauigkeit des Verfahrens zu prüfen."
    text_sichtbar: "Ich willige ausdrücklich ein, dass meine Check-in-Fotos ohne Kopf an Google übermittelt und dort in der EU automatisch ausgewertet werden, um meine Körperzusammensetzung zu schätzen. Die Schätzung ist ungeprüft und wird mir als Spanne angezeigt; sie dient außerdem dazu, die Genauigkeit des Verfahrens zu prüfen."
    hinweis_modus: "text gilt für EXPO_PUBLIC_ESTIMATE_MODE=hintergrund, text_sichtbar für sichtbar"
  - id: nutzungsstatistik
    pflicht: false
    aktiv: false
    text: "Ich willige ein, dass die App erfasst, welche Bildschirme und Funktionen ich nutze, und diese Angaben an PostHog (Server in der EU) übermittelt werden, damit die App verbessert werden kann. Messwerte und Fotos werden dabei nicht übertragen."
---

# Einwilligung in die Verarbeitung deiner Gesundheitsdaten

## Bildschirmtext

Diese App verarbeitet Gesundheitsdaten: dein Gewicht, deinen Taillenumfang, deine Griffkraft, deine Check-in-Fotos und Angaben zu deinem gewählten Programm. Solche Daten sind nach Art. 9 DSGVO besonders geschützt. Wir verarbeiten sie nur mit deiner ausdrücklichen Einwilligung.

Die erste Einwilligung brauchst du, um die App zu nutzen. Die zweite ist freiwillig. Du kannst jede Einwilligung jederzeit in den Einstellungen unter „Datenschutz“ widerrufen. Der Widerruf gilt ab dann, die Verarbeitung bis dahin bleibt rechtmäßig.

Vor jedem Upload schneidet die App das Foto auf deinem Gerät an der Schulterlinie der Vorlage ab. Du siehst den Ausschnitt, bevor er gespeichert wird. Achte beim Foto darauf, dass dein Kopf oberhalb der Linie ist.

Die App stellt keine Diagnosen und gibt keine medizinischen Empfehlungen.

[Kästchen „gesundheitsdaten“, nicht vorausgewählt]
[Kästchen „foto-auswertung“, nicht vorausgewählt]
[Kästchen „nutzungsstatistik“, erst sichtbar, wenn die Nutzungsstatistik eingeschaltet ist]
[Link „Alle Details“ öffnet den Abschnitt darunter]

## Details

**Verantwortlich:** [PRÜFEN: Name und Anschrift; für den Test wie im Impressum von nachderspritze.de, nach einer Gründung die Gesellschaft]

**Welche Daten:** E-Mail-Adresse für die Anmeldung; Bestätigung, dass du mindestens 18 Jahre alt bist; Gewicht, Taillenumfang, Griffkraft; Check-in-Fotos ohne Kopf; Angaben, die dein gewähltes Programm abfragt (zum Beispiel im Programm „Nach der Spritze“ das Datum der letzten Dosis); abgehakte Punkte der Wochenkarten; Erinnerungszeit. Mit der zweiten Einwilligung zusätzlich die automatische Schätzung der Körperzusammensetzung.

**Wozu:** Programm und Verlauf anzeigen, Daten zwischen Gerät und Konto abgleichen, Export und Löschung. Mit der zweiten Einwilligung: prüfen, wie genau eine Schätzung aus Fotos ist.

**Rechtsgrundlage:** deine ausdrückliche Einwilligung, Art. 9 Abs. 2 lit. a und Art. 6 Abs. 1 lit. a DSGVO. Für die Nutzungsstatistik zusätzlich § 25 Abs. 1 TDDDG.

**Wer die Daten verarbeitet:**
- Supabase (Datenbank, Anmeldung, Speicher für Fotos), Serverstandort Frankfurt am Main.
- Google Cloud (Gemini), Verarbeitung in der EU. Nur mit der zweiten Einwilligung, nur die Fotos ohne Kopf, ohne Name und E-Mail-Adresse.
- PostHog, Server in der EU. Nur mit der dritten Einwilligung, ohne Messwerte und Fotos.

[PRÜFEN: Auftragsverarbeitungsverträge mit allen drei Anbietern abschließen. Alle drei haben ihren Sitz in den USA; Absicherung der Übermittlung über das EU-US Data Privacy Framework oder Standardvertragsklauseln je Anbieter prüfen und hier nennen.]

**Wie lange:** bis du die Einwilligung widerrufst oder dein Konto löschst. Dann löschen wir deine Daten einschließlich der Fotos und Schätzungen. [PRÜFEN: Löschfrist für Backups bei Supabase nennen.] Google speichert die Fotos nach der Auswertung nicht. [PRÜFEN: erst zutreffend, wenn das Caching abgeschaltet und die Ausnahme vom Prompt-Logging für Missbrauchserkennung bewilligt ist; bis dahin die Speicherfrist laut Google nennen.]

**Deine Rechte:** Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit (Export in der App, inklusive der Schätzungen), Widerruf jeder Einwilligung. Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der Berliner Beauftragten für Datenschutz und Informationsfreiheit.

**Wenn du widerrufst:** Widerrufst du die erste Einwilligung, kannst du die App nicht weiter nutzen. Vorher kannst du deine Daten exportieren; danach werden sie gelöscht. Widerrufst du die zweite, werden keine Fotos mehr ausgewertet und die bisherigen Schätzungen gelöscht.
