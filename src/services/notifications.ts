import * as Notifications from 'expo-notifications';
import { Platform, Linking, Alert } from 'react-native';
import { Session, Prayer } from '../types';

const CHANNEL_ID = 'prayer-reminders';

// ── Handler (how notifications appear while app is in foreground) ─────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ── One-time setup ────────────────────────────────────────────────────────────

export async function setupNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembretes de Oração',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#B8860B',
    });
  }
}

// ── Permissions ───────────────────────────────────────────────────────────────

export async function requestPermissions(): Promise<boolean> {
  const perms = await Notifications.getPermissionsAsync();

  let granted = perms.granted;
  if (!granted) {
    const result = await Notifications.requestPermissionsAsync();
    granted = result.granted;
  }

  if (!granted) return false;

  // Android 12+ (API 31+): SCHEDULE_EXACT_ALARM requires explicit user grant
  // in Settings → Special app access → Alarms & reminders
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    const canScheduleExact = (perms as any).android?.canScheduleExactAlarms ?? true;
    if (!canScheduleExact) {
      Alert.alert(
        'Notificações na hora exacta',
        'Para receber os lembretes de oração exactamente à hora marcada, activa "Alarmes e lembretes" para Devotio nas Definições do Android.',
        [
          { text: 'Mais tarde', style: 'cancel' },
          {
            text: 'Abrir Definições',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  }

  return granted;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function nextOccurrenceDate(hour: number, minute: number): Date {
  const now    = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target;
}

function buildBody(session: Session, prayers?: Prayer[]): string {
  if (!prayers || session.prayerItems.length === 0) return session.name || 'Hora de orar';
  return session.prayerItems
    .map(({ prayerId, quantity }) => {
      const p = prayers.find((pr) => pr.id === prayerId);
      return `${quantity}× ${p?.title ?? 'Oração'}`;
    })
    .join(' · ');
}

function unitToSeconds(unit: string): number {
  switch (unit) {
    case 'days':   return 86_400;
    case 'weeks':  return 86_400 * 7;
    case 'months': return 86_400 * 30;
    case 'years':  return 86_400 * 365;
    default:       return 86_400;
  }
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export async function scheduleSessionNotifications(
  session: Session,
  prayers?: Prayer[]
): Promise<string[]> {
  const [hour, minute] = session.time.split(':').map(Number);
  const title = session.name || 'Hora de orar';
  const body  = buildBody(session, prayers);
  const data  = { sessionId: session.id };
  const T     = Notifications.SchedulableTriggerInputTypes;

  const ids: string[] = [];

  try {
    switch (session.recurrence) {
      case 'once': {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title, body, data },
          trigger: { type: T.DATE, date: nextOccurrenceDate(hour, minute) },
        });
        ids.push(id);
        break;
      }

      case 'daily': {
        const id = await Notifications.scheduleNotificationAsync({
          content: { title, body, data },
          trigger: { type: T.DAILY, hour, minute },
        });
        ids.push(id);
        break;
      }

      case 'weekly': {
        for (const day of session.daysOfWeek) {
          // expo-notifications weekday: 1 = Sunday … 7 = Saturday
          const id = await Notifications.scheduleNotificationAsync({
            content: { title, body, data },
            trigger: { type: T.WEEKLY, weekday: day + 1, hour, minute },
          });
          ids.push(id);
        }
        break;
      }

      case 'monthly':
      case 'yearly': {
        // No native monthly/yearly repeating trigger — schedule next occurrence.
        // The session will reschedule itself when the user opens the app after firing.
        const id = await Notifications.scheduleNotificationAsync({
          content: { title, body, data },
          trigger: { type: T.DATE, date: nextOccurrenceDate(hour, minute) },
        });
        ids.push(id);
        break;
      }

      case 'custom': {
        const seconds = session.customInterval * unitToSeconds(session.customUnit);
        const id = await Notifications.scheduleNotificationAsync({
          content: { title, body, data },
          trigger: { type: T.TIME_INTERVAL, seconds, repeats: true },
        });
        ids.push(id);
        break;
      }
    }
  } catch (error) {
    console.error('[notifications] schedule error:', error);
  }

  return ids;
}

// ── Cancel ────────────────────────────────────────────────────────────────────

export async function cancelNotifications(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    )
  );
}
