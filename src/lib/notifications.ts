import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { t } from '@/i18n';

/**
 * Eine Erinnerung pro Woche, lokal geplant (kein Push-Server, keine Push-Tokens). Standard: aus.
 * weekday: 0 = Sonntag … 6 = Samstag (JavaScript). expo-notifications zählt 1 = Sonntag … 7 = Samstag.
 */
const CHANNEL_ID = 'erinnerung';
export const REMINDER_HOUR = 9;

export function configureNotifications(): void {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: t('einstellungen.erinnerung'),
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 100],
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function scheduleWeeklyReminder(weekday: number): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const ok = await requestNotificationPermission();
  if (!ok) return false;
  await ensureChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: t('notification.titel'), body: t('notification.text') },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: weekday + 1,
      hour: REMINDER_HOUR,
      minute: 0,
      channelId: CHANNEL_ID,
    },
  });
  return true;
}

export async function cancelReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
