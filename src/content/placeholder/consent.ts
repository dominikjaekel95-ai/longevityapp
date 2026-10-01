/**
 * Platzhalter für den Einwilligungstext (Art. 9 DSGVO), bis der Entwurf der Begleitinstanz in
 * content/rechtliches/ liegt und Dominik ihn freigibt. Die App zeigt ihn mit der Kennzeichnung „Entwurf“.
 */
import type { ConsentRaw } from '../consent';

export const placeholderConsent: ConsentRaw = {
  status: 'platzhalter',
  version: '2026-10-01-platzhalter',
  title: {
    de: 'Einwilligung in die Verarbeitung deiner Körperdaten',
    en: 'Consent to the processing of your body data',
  },
  intro: {
    de: 'Gewicht, Griffkraft, Taillenumfang und Fotos deines Körpers sind besondere Kategorien personenbezogener Daten nach Art. 9 DSGVO. Die App verarbeitet sie nur mit deiner ausdrücklichen Einwilligung.',
    en: 'Weight, grip strength, waist circumference and photos of your body are special categories of personal data under Art. 9 GDPR. The app processes them only with your explicit consent.',
  },
  points: {
    de: [
      'Zweck: Deinen Verlauf über Wochen anzeigen und dich durch das Programm führen. Kein anderer Zweck, keine Werbung.',
      'Ort: Daten liegen auf deinem Gerät und, wenn du ein Konto anlegst, in deinem Konto auf Servern in Frankfurt (Supabase, Region EU). Fotos liegen in einem privaten Speicher mit Zugriff nur über zeitlich begrenzte Links.',
      'Foto-Schätzung: Für die Schätzung der Körperzusammensetzung wird das Foto an einen KI-Dienst von Google Cloud in der EU übertragen und dort nicht gespeichert. Der Kopf ist vorher abgeschnitten.',
      'Kein Zugriff Dritter: keine Weitergabe an Werbenetzwerke, keine Werbe-SDKs, keine Cookies.',
      'Widerruf: Du kannst die Einwilligung jederzeit widerrufen, indem du dein Konto in den Einstellungen löschst. Dann werden alle Daten sofort gelöscht, auch die Fotos.',
      'Freiwillig: Ohne Einwilligung kannst du die App nicht nutzen, weil sie ohne diese Daten keinen Zweck hat.',
    ],
    en: [
      'Purpose: to show your progress over weeks and guide you through the programme. No other purpose, no advertising.',
      'Location: data is stored on your device and, if you create an account, in your account on servers in Frankfurt (Supabase, EU region). Photos are kept in private storage, accessible only via time-limited links.',
      'Photo estimate: for the body composition estimate the photo is sent to a Google Cloud AI service in the EU and not stored there. Your head is cropped out beforehand.',
      'No third-party access: no sharing with ad networks, no advertising SDKs, no cookies.',
      'Withdrawal: you can withdraw consent at any time by deleting your account in the settings. All data is then deleted immediately, including photos.',
      'Voluntary: without consent you cannot use the app, because it has no purpose without this data.',
    ],
  },
  checkbox: {
    de: 'Ich willige ausdrücklich ein, dass die App meine Körperdaten und Fotos wie oben beschrieben verarbeitet.',
    en: 'I explicitly consent to the app processing my body data and photos as described above.',
  },
  ageCheckbox: { de: 'Ich bin mindestens 18 Jahre alt.', en: 'I am at least 18 years old.' },
  draftNotice: {
    de: 'Textfassung: Platzhalter. Den Entwurf erstellt die Begleitinstanz, die Freigabe erteilt der Anbieter.',
    en: 'Text version: placeholder. The draft is written by the companion instance and approved by the operator.',
  },
};
