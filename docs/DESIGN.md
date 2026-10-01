# Design: Gegen den KI-Look

Kurzfassung des Designbriefs (vollständig mit Recherche und Quellen als Claude-Dokument, Link in docs/DECISIONS.md). Verbindlich für jeden Bildschirm. Grundlage ist die Website nachderspritze.de in der aktiven Variante d1, damit App und Website zusammengehören. Tokens: `src/theme/tokens.ts`. Bausteine: `src/components/`.

## Zehn Regeln

| Nr. | KI-Muster | Stattdessen | UX-Grund |
|---|---|---|---|
| 1 | Zentrierte Startfläche, Verlaufshintergrund, zwei Buttons | Linksbündiger Text, eine Hauptaktion pro Bildschirm | Lesefluss von links, klare Priorität |
| 2 | Alles ist eine Karte mit Schatten und großem Radius | Listen mit Trennlinien; Fläche nur für abgegrenzte Objekte, Radius 0, kein Schatten | Weniger Rauschen, mehr Inhalt pro Bildschirm |
| 3 | Icon in farbigem Kreis vor jedem Punkt | Text ohne Icon; Icons nur in der Tab-Leiste und für Kamera, Teilen, Zurück | Icons ohne Bedeutung kosten Aufmerksamkeit |
| 4 | Lila-blaue Verläufe, Neon auf Dunkel, Glaseffekte | Palette der Website: eine Akzentfarbe (Aubergine), heller Grund; Dunkelmodus folgt dem System | Kontrast 4,5:1, Wiedererkennung |
| 5 | Inter oder Systemschrift, riesige fette Überschriften | Hanken Grotesk (Tabellenziffern), Titel 26 pt mit Gewicht 400, Text 17 pt | Zahlen vergleichbar, Lesbarkeit |
| 6 | Motivationsfloskeln, Emojis, Konfetti, Streak-Flammen, Fortschrittsringe | Zahlen und Fakten, nüchtern, kein Lob, kein Druck | Ton der Website; keine Bewertung von Körperdaten |
| 7 | Diagramme mit Verlaufsfläche, Glättung, ohne Achsen | Linie mit Punkten, beschriftete Achsen, Wert am letzten Punkt, Spanne als Balken; unter drei Punkten Zahl statt Linie | Daten lesbar, Unsicherheit sichtbar |
| 8 | Fünf Tabs nur mit Icons | Vier Tabs mit Text: Verlauf, Check-in, Programm, Einstellungen | Android-Konvention, Verständlichkeit |
| 9 | Einblenden, Fade-up, Parallax überall | Bewegung nur, wenn sie einen Zustand erklärt | Geschwindigkeit, Ruhe |
| 10 | Onboarding-Karussell mit Illustrationen | Kurze Formularstrecke „Schritt n von 5“, Einwilligung als eigener Schritt | Unter zwei Minuten, Einwilligung sichtbar |

## Was nie umgekehrt wird

Kontrast 4,5:1 (3:1 für große Schrift), Berührungsziele 48 dp, sichtbare Beschriftung bei jedem Icon und Feld, Fehlertext am Feld, Leer- und Ladezustände mit nächstem Schritt, Offline als Hinweis statt Fehler, Dunkelmodus vollständig.

## Vorgaben für Longvy 0.1

- Schrift: Hanken Grotesk 300/400/500/600. Titel 26, Zwischenüberschrift 20 (500), Text 17, Klein 14, Kicker 12 Versalien gesperrt, große Zahlen 40 in 300 mit Tabellenziffern.
- Farben hell: Papier #f5f4f1, Tinte #221a25, Tinte 2 #4c4350, Tinte 3 #6f6672, Linie #dcd7d9, Akzent #5c2d5e, Ocker #d9824f für Spannen, Button #1a1a1a auf #f6f5f2. Dunkel: Papier #1b171c, Tinte #f1ecf0, Akzent #cfa9d1.
- Flächen: Radius 0; Pille nur für Buttons. Keine Schatten, Verläufe, Glaseffekte.
- Layout: linksbündig, 16 dp Rand, Inhaltsbreite höchstens 640 dp, eine Hauptaktion unten.
- Formulare: Label über dem Feld, Linie unter dem Feld, Einheit als Suffix, Vorwert der letzten Woche als Hilfetext, Fehlertext ersetzt den Hilfetext.
- Text: „du“, kurze Sätze, keine Ausrufezeichen, keine Emojis, keine Superlative, kein Lob. Alle Texte aus `src/i18n` oder `src/content/claims.ts`.

## Prüfliste für jeden PR mit Oberfläche

- [ ] Kein Verlauf, kein Schatten, kein Radius außer der Button-Pille
- [ ] Kein Icon vor Listenpunkten, kein Icon in einem Kreis, kein Emoji
- [ ] Text linksbündig, höchstens eine Primäraktion
- [ ] Zahlen mit Tabellenziffern und Einheit, Dezimalkomma im Deutschen
- [ ] Kein Lob, keine Floskel, kein Streak, kein Ring, kein Konfetti
- [ ] Diagramm: Punkte sichtbar, Achsen beschriftet, Wert am letzten Punkt, keine Fläche unter der Linie
- [ ] Kontrast und Berührungsziele geprüft, Label bei jedem Feld, Fehlertext am Feld
- [ ] Leerzustand mit nächstem Schritt, Offline als Hinweis, Ladezustand sichtbar
- [ ] Dunkelmodus vollständig
- [ ] Claims-Prüfung grün

## Verfahren pro Bildschirm

1. Analyse: Was hätte ein Modell ohne Vorgabe gebaut? 2. Umkehrung: die Gegenentscheidung je Element. 3. UX-Prüfung gegen die Liste oben. 4. Bau mit Tokens und Bausteinen. Die drei Sätze zu 1 bis 3 stehen in der PR-Beschreibung.
