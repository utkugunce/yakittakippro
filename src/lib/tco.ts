import {
  DailyLog,
  FuelPurchase,
  ChargeSession,
  Expense,
  ServiceRecord,
  ExpenseCategory,
} from '../types';

export interface TcoBreakdown {
  fuel: number;
  charging: number;
  service: number;
  expensesByCategory: Partial<Record<ExpenseCategory, number>>;
  expensesTotal: number;
  total: number;
}

const inYear = (iso: string, year: number): boolean => new Date(iso).getFullYear() === year;

/**
 * Total cost of ownership for a given year: fuel + charging + service + other
 * expenses. Fuel uses explicit purchases when present, otherwise falls back to
 * the daily-log costs, to avoid double counting between the two logging styles.
 */
export function computeTco(params: {
  year: number;
  logs?: DailyLog[];
  purchases?: FuelPurchase[];
  charges?: ChargeSession[];
  expenses?: Expense[];
  services?: ServiceRecord[];
}): TcoBreakdown {
  const { year, logs = [], purchases = [], charges = [], expenses = [], services = [] } = params;

  const fuelFromPurchases = purchases
    .filter((p) => inYear(p.date, year))
    .reduce((s, p) => s + (p.totalAmount || 0), 0);
  const fuelFromLogs = logs
    .filter((l) => inYear(l.date, year))
    .reduce((s, l) => s + (l.dailyCost || 0), 0);
  const fuel = fuelFromPurchases > 0 ? fuelFromPurchases : fuelFromLogs;

  const charging = charges
    .filter((c) => inYear(c.date, year))
    .reduce((s, c) => s + (c.cost || 0), 0);

  const service = services
    .filter((r) => inYear(r.date, year))
    .reduce((s, r) => s + (r.cost || 0), 0);

  const expensesByCategory: Partial<Record<ExpenseCategory, number>> = {};
  let expensesTotal = 0;
  expenses
    .filter((e) => inYear(e.date, year))
    .forEach((e) => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + (e.amount || 0);
      expensesTotal += e.amount || 0;
    });

  return {
    fuel,
    charging,
    service,
    expensesByCategory,
    expensesTotal,
    total: fuel + charging + service + expensesTotal,
  };
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  toll: 'HGS / OGS',
  parking: 'Otopark',
  wash: 'Yıkama',
  fine: 'Trafik Cezası',
  mtv: 'MTV',
  insurance: 'Sigorta / Kasko',
  inspection: 'Muayene',
  tax: 'Vergi / Harç',
  accessory: 'Aksesuar',
  other: 'Diğer',
};
