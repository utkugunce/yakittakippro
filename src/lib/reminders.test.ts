import { describe, it, expect } from 'vitest';
import { buildReminders } from './reminders';
import type { MaintenanceItem, VehicleDocument } from '../types';

const NOW = new Date('2026-05-28T00:00:00Z');

describe('buildReminders', () => {
  it('flags overdue and soon date-based maintenance, hides far-off ones', () => {
    const maintenance: MaintenanceItem[] = [
      { id: 'overdue', title: 'Muayene', status: 'critical', dueDate: '2026-05-01' },
      { id: 'soon', title: 'Sigorta', status: 'warning', dueDate: '2026-06-10' },
      { id: 'far', title: 'Uzak', status: 'ok', dueDate: '2027-01-01' },
    ];
    const reminders = buildReminders({ maintenance, now: NOW });
    const ids = reminders.map((r) => r.id);
    expect(ids).toContain('m-date-overdue');
    expect(ids).toContain('m-date-soon');
    expect(ids).not.toContain('m-date-far');
    // overdue first
    expect(reminders[0].severity).toBe('overdue');
  });

  it('flags km-based maintenance near the odometer', () => {
    const maintenance: MaintenanceItem[] = [
      { id: 'km', title: 'Yağ', status: 'warning', nextDueKm: 100500 },
    ];
    const reminders = buildReminders({ maintenance, currentOdometer: 100000, now: NOW });
    expect(reminders[0]).toMatchObject({ kind: 'maintenance-km', severity: 'soon' });
    expect(reminders[0].kmLeft).toBe(500);
  });

  it('flags expiring documents', () => {
    const documents: VehicleDocument[] = [
      { id: 'd', type: 'insurance', title: 'Trafik', expiryDate: '2026-06-05', createdAt: '' },
    ];
    const reminders = buildReminders({ documents, now: NOW });
    expect(reminders[0].kind).toBe('document');
  });

  it('returns empty when nothing is due', () => {
    expect(buildReminders({ now: NOW })).toEqual([]);
  });
});
