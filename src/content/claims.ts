/**
 * Alle nutzerseitigen Texte mit Körper- oder Gesundheitsbezug (CLAUDE.md, Abschnitt 2 und 7).
 * Jeder Eintrag hat de und en. `npm run check:claims` prüft diese Datei gegen scripts/forbidden-terms.json.
 *
 * Regeln: Die App zeigt Verläufe und Schätzungen mit Spanne. Sie bewertet nichts, stellt nichts fest, warnt nicht.
 * Kein Medikamentenname, keine Schwellenwerte mit Gesundheitsbezug. Ton: nüchtern, „du“, keine Superlative.
 */
export type ClaimText = { de: string; en: string };

export const claims = {
  // --- Was die App ist ---
  appIs: {
    de: "Longvy macht deinen Verlauf über Wochen sichtbar: Foto, Gewicht, Griffkraft, Umfang. Programme geben dir dazu konkrete Wochenaufgaben für Kraft, Protein und Alltag.",
    en: "Longvy makes your progress visible over weeks: photo, weight, grip strength, circumference. Programmes add concrete weekly tasks for strength, protein and daily life.",
  },
  appIsNot: {
    de: 'Die App stellt keine Befunde, bewertet deine Gesundheit nicht und ersetzt kein Gespräch mit deiner Ärztin oder deinem Arzt.',
    en: 'The app does not produce findings, does not assess your health and does not replace a conversation with your doctor.',
  },
  doctorHint: {
    de: 'Bei Beschwerden sprich mit deiner Ärztin oder deinem Arzt.',
    en: 'If you feel unwell, talk to your doctor.',
  },
  trendOnly: {
    de: 'Aussagekräftig ist nur der Verlauf über Wochen, nicht der einzelne Wert.',
    en: 'Only the trend over weeks is meaningful, not a single value.',
  },

  // --- Check-in: Erklärungen zu den Werten ---
  weightWhy: {
    de: 'Gewicht einmal pro Woche, morgens, gleiche Bedingungen. Ein bis zwei Kilo Schwankung von Tag zu Tag sind Wasser und Speicher.',
    en: 'Weight once a week, in the morning, same conditions. Day-to-day swings of one or two kilos are water and glycogen.',
  },
  gripWhy: {
    de: 'Griffkraft mit einem Handdynamometer: dreimal drücken, bester Wert zählt. Sie ist ein einfacher Hinweis darauf, ob dein Training wirkt, unabhängig von der Waage.',
    en: 'Grip strength with a hand dynamometer: squeeze three times, best value counts. It is a simple indicator of whether your training is working, independent of the scales.',
  },
  gripHow: {
    de: 'Stehend oder sitzend, Arm angewinkelt, Gerät nicht am Körper abstützen. Immer dieselbe Hand.',
    en: 'Standing or seated, elbow bent, do not brace the device against your body. Always the same hand.',
  },
  waistWhy: {
    de: 'Taillenumfang optional: auf Nabelhöhe, nach dem Ausatmen, Maßband locker anliegend. Verändert sich oft, bevor die Waage es zeigt.',
    en: 'Waist circumference is optional: at navel height, after exhaling, tape snug but not tight. Often changes before the scales do.',
  },
  photoWhy: {
    de: 'Ein Foto pro Woche in gleicher Pose, gleichem Licht, gleichem Abstand. Nur so lassen sich Fotos vergleichen. Der Kopf ist nicht nötig und wird abgeschnitten.',
    en: 'One photo per week in the same pose, same light, same distance. That is the only way photos can be compared. Your head is not needed and is cropped out.',
  },
  photoPose: {
    de: 'Stell dich frontal vor einen hellen, ruhigen Hintergrund. Füße hüftbreit, Arme leicht vom Körper, Kleidung eng oder Oberkörper frei. Richte die Schultern an der Linie aus.',
    en: 'Stand facing the camera in front of a bright, plain background. Feet hip-width apart, arms slightly away from your body, tight clothing or bare torso. Align your shoulders with the line.',
  },
  photoRejected: {
    de: 'Das Foto passt nicht genug zum Vorfoto, um es zu vergleichen. Häufige Gründe: anderer Abstand, anderes Licht, andere Haltung. Du kannst es erneut aufnehmen oder ohne Vergleich speichern.',
    en: 'This photo does not match the previous one closely enough to compare. Common reasons: different distance, light or posture. You can retake it or save it without comparison.',
  },

  // --- Foto-Schätzung (Beta) ---
  estimateTitle: {
    de: 'Beta-Schätzung Körperfett',
    en: 'Beta estimate body fat',
  },
  estimateExplain: {
    de: 'Eine Schätzung aus dem Foto, als Spanne. Sie ist ungenau und kein Messwert. Aussagekräftig ist nur, wie sich die Spanne über Wochen verschiebt.',
    en: 'An estimate from the photo, shown as a range. It is imprecise and not a measurement. Only how the range shifts over weeks is meaningful.',
  },
  estimateRange: {
    de: 'Schätzung {low} bis {high} Prozent',
    en: 'Estimate {low} to {high} percent',
  },
  estimateFirst: {
    de: 'Erste Schätzung, noch ohne Vorfoto zum Vergleich.',
    en: 'First estimate, no previous photo to compare yet.',
  },
  estimatePending: {
    de: 'Schätzung läuft. Sie erscheint hier, sobald das Foto hochgeladen ist.',
    en: 'Estimate in progress. It appears here once the photo has been uploaded.',
  },
  estimateUnavailable: {
    de: 'Ohne Konto und Internetverbindung gibt es keine Schätzung. Dein Verlauf funktioniert trotzdem.',
    en: 'Without an account and internet connection there is no estimate. Your progress tracking works regardless.',
  },

  // --- Verlauf ---
  trendUp: { de: 'Wochentrend: steigend', en: 'Weekly trend: rising' },
  trendDown: { de: 'Wochentrend: fallend', en: 'Weekly trend: falling' },
  trendFlat: { de: 'Wochentrend: gleichbleibend', en: 'Weekly trend: steady' },
  trendTooFew: {
    de: 'Ab drei Check-ins zeigt die App einen Wochentrend.',
    en: 'After three check-ins the app shows a weekly trend.',
  },

  // --- Programm ---
  programIntro: {
    de: 'Das Programm gibt dir jede Woche wenige konkrete Aufgaben: Protein, Krafttraining, Messen, Alltag. Es ist für gesunde Erwachsene gleich aufgebaut und passt sich deiner Fitnessstufe an, nicht deiner Gesundheit.',
    en: 'The programme gives you a few concrete tasks each week: protein, strength training, measuring, daily life. It is the same for all healthy adults and adapts to your fitness level, not your health.',
  },
  programDraft: {
    de: 'Textfassung: Entwurf aus den Website-Inhalten, fachliche Prüfung steht aus.',
    en: 'Text version: draft from the website content, expert review pending.',
  },
  proteinGeneral: {
    de: 'Protein trägt zur Erhaltung von Muskelmasse bei. Übersichtsarbeiten nennen für Erwachsene beim Gewichthalten 1,2 bis 1,6 g pro Kilogramm Körpergewicht und Tag, verteilt auf drei Mahlzeiten.',
    en: 'Protein contributes to the maintenance of muscle mass. Reviews cite 1.2 to 1.6 g per kilogram of body weight per day for adults maintaining weight, spread over three meals.',
  },
  strengthGeneral: {
    de: 'Zwei Krafteinheiten pro Woche für den ganzen Körper, je etwa 30 Minuten. Die WHO empfiehlt für Erwachsene mindestens zwei Tage Krafttraining pro Woche.',
    en: 'Two full-body strength sessions per week, about 30 minutes each. The WHO recommends at least two days of strength training per week for adults.',
  },

  // --- Einstellungen, Export, Löschen ---
  exportExplain: {
    de: 'Export als ZIP: alle Check-ins als CSV und alle Fotos. Die Datei entsteht auf deinem Gerät.',
    en: 'Export as ZIP: all check-ins as CSV and all photos. The file is created on your device.',
  },
  deleteExplain: {
    de: 'Konto löschen entfernt sofort alle Daten: auf dem Gerät, im Konto und alle Fotos im Speicher. Das lässt sich nicht rückgängig machen.',
    en: 'Deleting your account immediately removes all data: on the device, in the account and all photos in storage. This cannot be undone.',
  },
  headMaskExplain: {
    de: 'Das Foto wird vor dem Speichern oberhalb der Schulterlinie beschnitten. Das lässt sich nicht abschalten; die Einwilligung gilt für Fotos ohne Kopf.',
    en: 'The photo is cropped above the shoulder line before it is saved. This cannot be switched off; the consent covers photos without head.',
  },
  reminderExplain: {
    de: 'Eine Erinnerung pro Woche an deinen Check-in, am Wochentag deiner Wahl. Standard: aus.',
    en: 'One reminder per week for your check-in, on the weekday of your choice. Default: off.',
  },
} satisfies Record<string, ClaimText>;

export type ClaimKey = keyof typeof claims;
