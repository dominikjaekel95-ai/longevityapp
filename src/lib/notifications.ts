import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import { t } from '@/i18n';

/**
 * Eine Erinnerung pro Woche, lokal geplant (kein Push-Server, keine Push-Tokens). Standard: aus.
 * weekday: 0 = Sonntag … 6 = Samstag (JavaScript). expo-notifications zählt 1 = Sonntag … 7 = Samstag.
 *
 * expo-notifications darf in Expo Go nicht einmal importiert werden: Seit SDK 53 wirft das Modul dort auf Android
 * beim Laden einen Fehler. Deshalb kein Import auf oberster Ebene, sondern require bei Bedarf, und in Expo Go sind
 * alle Funktionen hier No-ops. Im eigenen Build (APK, Development Build) funktioniert die Erinnerung.
 */
const CHANNEL_ID = 'erinnerung';
export const REMINDER_HOUR = 9;

export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
export const notificationsAvailable = Platform.OS !== 'web' && !isExpoGo;

type NotificationsModule = typeof import('expo-notifications');
let cached: NotificationsModule | null = null;

function load(): NotificationsModule | null {
  if (!notificationsAvailable) return null;
  if (!cached) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-notifications') as NotificationsModule;
  }
  return cached;
}

export function configureNotifications(): void {
  const N = load();
  if (!N) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannel(N: NotificationsModule): Promise<void> {
  if (Platform.OS !== 'android') return;
  await N.setNotificationChannelAsync(CHANNEL_ID, {
    name: t('einstellungen.erinnerung'),
    importance: N.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 100],
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const N = load();
  if (!N) return false;
  const current = await N.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await N.requestPermissionsAsync();
  return asked.granted;
}

export async function scheduleWeeklyReminder(weekday: number): Promise<boolean> {
  const N = load();
  if (!N) return false;
  const ok = await requestNotificationPermission();
  if (!ok) return false;
  await ensureChannel(N);
  await N.cancelAllScheduledNotificationsAsync();
  await N.scheduleNotificationAsync({
    content: { title: t('notification.titel'), body: t('notification.text') },
    trigger: {
      type: N.SchedulableTriggerInputTypes.WEEKLY,
      weekday: weekday + 1,
      hour: REMINDER_HOUR,
      minute: 0,
      channelId: CHANNEL_ID,
    },
  });
  return true;
}

export async function cancelReminder(): Promise<void> {
  const N = load();
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync();
}
