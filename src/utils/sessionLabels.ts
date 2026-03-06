import { Session, PrayerItem } from '../types';
import { Prayer } from '../types';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const UNIT_LABELS: Record<string, string> = {
  days: 'dias', weeks: 'semanas', months: 'meses', years: 'anos',
};

export function recurrenceLabel(session: Session): string {
  switch (session.recurrence) {
    case 'once':   return 'Uma vez';
    case 'daily':  return 'Todos os dias';
    case 'monthly': return 'Todos os meses';
    case 'yearly': return 'Todos os anos';
    case 'weekly': {
      if (session.daysOfWeek.length === 7) return 'Todos os dias';
      if (session.daysOfWeek.length === 0) return 'Semanalmente';
      const names = [...session.daysOfWeek]
        .sort((a, b) => a - b)
        .map((d) => DAY_LABELS[d]);
      return names.join(', ');
    }
    case 'custom':
      return `A cada ${session.customInterval} ${UNIT_LABELS[session.customUnit] ?? session.customUnit}`;
    default:
      return '';
  }
}

export function prayerItemsSummary(
  prayerItems: PrayerItem[],
  prayers: Prayer[]
): string {
  return prayerItems
    .map(({ prayerId, quantity }) => {
      const prayer = prayers.find((p) => p.id === prayerId);
      const name   = prayer?.title ?? 'Oração';
      return `${quantity}× ${name}`;
    })
    .join(' · ');
}
