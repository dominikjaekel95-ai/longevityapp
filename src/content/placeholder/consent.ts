/**
 * Platzhalter für die Einwilligung, bis content/rechtliches/<locale>/einwilligung-art9.md der Begleitinstanz vorliegt.
 * Die App zeigt ihn mit der Kennzeichnung „Entwurf“. Kein freigegebener Rechtstext.
 */
import type { ConsentText } from '../consent';

export const placeholderConsent: ConsentText = {
  status: 'platzhalter',
  version: '0.0-platzhalter',
  scope: 'Platzhalter',
  title: 'Einwilligung in die Verarbeitung deiner Gesundheitsdaten',
  screen: [
    'Diese App verarbeitet Gesundheitsdaten: Gewicht, Taillenumfang, Griffkraft, Check-in-Fotos ohne Kopf und Angaben zu deinem Programm. Solche Daten sind nach Art. 9 DSGVO besonders geschützt. Die App verarbeitet sie nur mit deiner ausdrücklichen Einwilligung.',
    'Die erste Einwilligung brauchst du, um die App zu nutzen. Die zweite ist freiwillig. Du kannst jede Einwilligung jederzeit in den Einstellungen widerrufen.',
  ],
  details: [],
  items: [
    {
      id: 'gesundheitsdaten',
      required: true,
      active: true,
      text: 'Ich willige ausdrücklich ein, dass meine Gesundheitsdaten auf meinem Gerät und auf Servern in Frankfurt am Main gespeichert und verarbeitet werden, damit die App mir Programm und Verlauf anzeigen kann.',
      textVisible: null,
    },
    {
      id: 'foto-auswertung',
      required: false,
      active: true,
      text: 'Ich willige ausdrücklich ein, dass meine Check-in-Fotos ohne Kopf an einen KI-Dienst in der EU übermittelt und dort automatisch ausgewertet werden, um meine Körperzusammensetzung zu schätzen.',
      textVisible: null,
    },
  ],
};
