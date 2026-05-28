import { MaintenanceItem, VehicleDocument } from '../types';

export type ReminderSeverity = 'ok' | 'soon' | 'overdue';

export interface Reminder {
  id: string;
  kind: 'maintenance-date' | 'maintenance-km' | 'document';
  title: string;
  detail: string;
  severity: ReminderSeverity;
  daysLeft?: number;
  kmLeft?: number;
}

const DEFAULT_NOTIFY_DAYS = 30;
const DEFAULT_NOTIFY_KM = 1000;

const daysBetween = (target: Date, now: Date): number =>
  Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

const DOC_LABELS: Record<VehicleDocument['type'], string> = {
  license: 'Ruhsat',
  insurance: 'Sigorta',
  inspection: 'Muayene',
  other: 'Belge',
};

/**
 * Derives actionable reminders from maintenance items and glovebox documents.
 * Date-based items use daysLeft; km-based items use kmLeft against the current
 * odometer. Returns only items that are due "soon" or "overdue", most urgent
 * first.
 */
export function buildReminders(params: {
  maintenance?: MaintenanceItem[];
  documents?: VehicleDocument[];
  currentOdometer?: number;
  now?: Date;
}): Reminder[] {
  const { maintenance = [], documents = [], currentOdometer = 0, now = new Date() } = params;
  const reminders: Reminder[] = [];

  for (const item of maintenance) {
    // Date-based (muayene/sigorta vb.)
    if (item.dueDate) {
      const daysLeft = daysBetween(new Date(item.dueDate), now);
      const threshold = item.notifyBeforeDays ?? DEFAULT_NOTIFY_DAYS;
      if (daysLeft <= threshold) {
        reminders.push({
          id: `m-date-${item.id}`,
          kind: 'maintenance-date',
          title: item.title,
          detail:
            daysLeft < 0 ? `${Math.abs(daysLeft)} gün gecikti` : `${daysLeft} gün kaldı`,
          severity: daysLeft < 0 ? 'overdue' : 'soon',
          daysLeft,
        });
      }
    }

    // Km-based
    if (item.nextDueKm && currentOdometer > 0) {
      const kmLeft = item.nextDueKm - currentOdometer;
      const threshold = item.notifyBeforeKm ?? DEFAULT_NOTIFY_KM;
      if (kmLeft <= threshold) {
        reminders.push({
          id: `m-km-${item.id}`,
          kind: 'maintenance-km',
          title: item.title,
          detail:
            kmLeft < 0
              ? `${Math.abs(kmLeft).toLocaleString('tr-TR')} km gecikti`
              : `${kmLeft.toLocaleString('tr-TR')} km kaldı`,
          severity: kmLeft < 0 ? 'overdue' : 'soon',
          kmLeft,
        });
      }
    }
  }

  for (const doc of documents) {
    if (!doc.expiryDate) continue;
    const daysLeft = daysBetween(new Date(doc.expiryDate), now);
    if (daysLeft <= DEFAULT_NOTIFY_DAYS) {
      reminders.push({
        id: `doc-${doc.id}`,
        kind: 'document',
        title: `${DOC_LABELS[doc.type]}: ${doc.title}`,
        detail: daysLeft < 0 ? `${Math.abs(daysLeft)} gün gecikti` : `${daysLeft} gün kaldı`,
        severity: daysLeft < 0 ? 'overdue' : 'soon',
        daysLeft,
      });
    }
  }

  const rank: Record<ReminderSeverity, number> = { overdue: 0, soon: 1, ok: 2 };
  return reminders.sort((a, b) => {
    if (rank[a.severity] !== rank[b.severity]) return rank[a.severity] - rank[b.severity];
    return (a.daysLeft ?? a.kmLeft ?? 0) - (b.daysLeft ?? b.kmLeft ?? 0);
  });
}
