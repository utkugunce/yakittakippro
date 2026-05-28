import { describe, it, expect } from 'vitest';
import { computeTco } from './tco';
import type { FuelPurchase, ChargeSession, Expense, ServiceRecord, DailyLog } from '../types';

const purchase = (date: string, amount: number): FuelPurchase => ({
  id: Math.random().toString(),
  date,
  liters: 10,
  pricePerLiter: amount / 10,
  totalAmount: amount,
});

describe('computeTco', () => {
  it('sums fuel + charging + service + expenses for the year', () => {
    const result = computeTco({
      year: 2026,
      purchases: [purchase('2026-02-01', 1000), purchase('2025-02-01', 999)],
      charges: [{ id: 'c', date: '2026-03-01', kWh: 30, cost: 200 }] as ChargeSession[],
      services: [{ id: 's', date: '2026-04-01', title: 'x', cost: 1500 }] as ServiceRecord[],
      expenses: [
        { id: 'e1', date: '2026-01-01', category: 'mtv', amount: 500 },
        { id: 'e2', date: '2026-01-02', category: 'toll', amount: 100 },
        { id: 'e3', date: '2026-01-03', category: 'toll', amount: 50 },
      ] as Expense[],
    });
    expect(result.fuel).toBe(1000); // 2025 excluded
    expect(result.charging).toBe(200);
    expect(result.service).toBe(1500);
    expect(result.expensesByCategory.toll).toBe(150);
    expect(result.expensesByCategory.mtv).toBe(500);
    expect(result.expensesTotal).toBe(650);
    expect(result.total).toBe(1000 + 200 + 1500 + 650);
  });

  it('falls back to daily-log costs when no purchases exist', () => {
    const logs = [{ id: 'l', date: '2026-05-01', dailyCost: 333 } as DailyLog];
    const result = computeTco({ year: 2026, logs });
    expect(result.fuel).toBe(333);
  });

  it('returns zeros for an empty year', () => {
    expect(computeTco({ year: 2030 }).total).toBe(0);
  });
});
