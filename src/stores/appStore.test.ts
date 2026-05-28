import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './appStore';
import type { DailyLog, FuelPurchase } from '../types';

const makeLog = (overrides: Partial<DailyLog> = {}): DailyLog => ({
  id: `log-${Math.random().toString(36).slice(2)}`,
  date: '2026-01-01',
  currentOdometer: 1000,
  dailyDistance: 100,
  avgConsumption: 7,
  isRefuelDay: false,
  fuelPrice: 0,
  dailyFuelConsumed: 7,
  dailyCost: 0,
  costPerKm: 0,
  ...overrides,
});

const makePurchase = (overrides: Partial<FuelPurchase> = {}): FuelPurchase => ({
  id: `fp-${Math.random().toString(36).slice(2)}`,
  date: '2026-01-01',
  liters: 40,
  pricePerLiter: 40,
  totalAmount: 1600,
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({
    logs: [],
    fuelPurchases: [],
    maintenanceItems: [],
    vehicleParts: [],
    documents: [],
  });
});

describe('appStore log actions', () => {
  it('addLog prepends the new log', () => {
    const a = makeLog({ id: 'a' });
    const b = makeLog({ id: 'b' });
    useAppStore.getState().addLog(a);
    useAppStore.getState().addLog(b);
    const { logs } = useAppStore.getState();
    expect(logs.map((l) => l.id)).toEqual(['b', 'a']);
  });

  it('deleteLog removes only the matching log', () => {
    const a = makeLog({ id: 'a' });
    const b = makeLog({ id: 'b' });
    useAppStore.setState({ logs: [a, b] });
    useAppStore.getState().deleteLog('a');
    expect(useAppStore.getState().logs.map((l) => l.id)).toEqual(['b']);
  });

  it('updateLog replaces the matching log in place', () => {
    const a = makeLog({ id: 'a', notes: 'before' });
    useAppStore.setState({ logs: [a] });
    useAppStore.getState().updateLog({ ...a, notes: 'after' });
    expect(useAppStore.getState().logs[0].notes).toBe('after');
  });

  it('importLogs replaces the whole collection', () => {
    useAppStore.setState({ logs: [makeLog({ id: 'old' })] });
    const fresh = [makeLog({ id: 'x' }), makeLog({ id: 'y' })];
    useAppStore.getState().importLogs(fresh);
    expect(useAppStore.getState().logs.map((l) => l.id)).toEqual(['x', 'y']);
  });

  it('clearLogs wipes logs, maintenance, purchases and parts', () => {
    useAppStore.setState({
      logs: [makeLog()],
      fuelPurchases: [makePurchase()],
      maintenanceItems: [{ id: 'm', title: 't', status: 'ok' }],
      vehicleParts: [
        { id: 'p', type: 'tire', name: 'n', installDate: '2026-01-01', installKm: 0, isActive: true },
      ],
    });
    useAppStore.getState().clearLogs();
    const s = useAppStore.getState();
    expect(s.logs).toHaveLength(0);
    expect(s.fuelPurchases).toHaveLength(0);
    expect(s.maintenanceItems).toHaveLength(0);
    expect(s.vehicleParts).toHaveLength(0);
  });
});

describe('appStore fuel purchase actions', () => {
  it('adds, updates and deletes purchases', () => {
    const p = makePurchase({ id: 'p1', pricePerLiter: 40 });
    useAppStore.getState().addFuelPurchase(p);
    expect(useAppStore.getState().fuelPurchases.map((x) => x.id)).toEqual(['p1']);

    useAppStore.getState().updateFuelPurchase({ ...p, pricePerLiter: 45 });
    expect(useAppStore.getState().fuelPurchases[0].pricePerLiter).toBe(45);

    useAppStore.getState().deleteFuelPurchase('p1');
    expect(useAppStore.getState().fuelPurchases).toHaveLength(0);
  });
});

describe('repairFuelPrices', () => {
  it('backfills fuelPrice from the most recent purchase on/before the log date', () => {
    useAppStore.setState({
      logs: [makeLog({ id: 'l1', date: '2026-02-01', fuelPrice: 0, dailyFuelConsumed: 10, dailyDistance: 100 })],
      fuelPurchases: [makePurchase({ id: 'p1', date: '2026-01-15', pricePerLiter: 40 })],
    });

    const updated = useAppStore.getState().repairFuelPrices();
    expect(updated).toBe(1);

    const log = useAppStore.getState().logs[0];
    expect(log.fuelPrice).toBe(40);
    expect(log.dailyCost).toBeCloseTo(400);
    expect(log.costPerKm).toBeCloseTo(4);
  });

  it('returns 0 when there are no purchases or no logs', () => {
    useAppStore.setState({ logs: [makeLog()], fuelPurchases: [] });
    expect(useAppStore.getState().repairFuelPrices()).toBe(0);
  });

  it('does not change logs that already have the correct price', () => {
    useAppStore.setState({
      logs: [makeLog({ id: 'l1', date: '2026-02-01', fuelPrice: 40 })],
      fuelPurchases: [makePurchase({ date: '2026-01-15', pricePerLiter: 40 })],
    });
    expect(useAppStore.getState().repairFuelPrices()).toBe(0);
  });
});

describe('hydrate (legacy migration / data-loss protection)', () => {
  it('merges legacy localStorage logs without creating duplicates', async () => {
    const shared = makeLog({ id: 'shared' });
    const legacyOnly = makeLog({ id: 'legacy-only' });

    // Current in-store state already has the shared log.
    useAppStore.setState({ logs: [shared] });
    // Legacy key holds the shared log (duplicate) plus a brand-new one.
    localStorage.setItem('yakit_takip_logs_v1', JSON.stringify([shared, legacyOnly]));

    await useAppStore.getState().hydrate();

    const ids = useAppStore.getState().logs.map((l) => l.id).sort();
    expect(ids).toEqual(['legacy-only', 'shared']);
  });

  it('tolerates corrupted legacy data without throwing or losing state', async () => {
    const existing = makeLog({ id: 'keep-me' });
    useAppStore.setState({ logs: [existing] });
    localStorage.setItem('yakit_takip_logs_v1', 'not-valid-json{');

    await expect(useAppStore.getState().hydrate()).resolves.toBeUndefined();
    expect(useAppStore.getState().logs.map((l) => l.id)).toContain('keep-me');
  });
});
