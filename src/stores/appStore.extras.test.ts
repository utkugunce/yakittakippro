import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './appStore';
import type { ChargeSession, Expense, ServiceRecord, FuelPriceEntry, Trip } from '../types';

const charge = (o: Partial<ChargeSession> = {}): ChargeSession => ({
  id: `c-${Math.random()}`,
  date: '2026-01-01',
  kWh: 30,
  cost: 150,
  ...o,
});
const expense = (o: Partial<Expense> = {}): Expense => ({
  id: `e-${Math.random()}`,
  date: '2026-01-01',
  category: 'toll',
  amount: 100,
  ...o,
});
const service = (o: Partial<ServiceRecord> = {}): ServiceRecord => ({
  id: `s-${Math.random()}`,
  date: '2026-01-01',
  title: 'Yağ değişimi',
  cost: 2000,
  ...o,
});
const price = (o: Partial<FuelPriceEntry> = {}): FuelPriceEntry => ({
  id: `p-${Math.random()}`,
  date: '2026-01-01',
  fuelType: 'benzin',
  pricePerLiter: 42,
  ...o,
});
const trip = (o: Partial<Trip> = {}): Trip => ({
  id: `t-${Math.random()}`,
  date: '2026-01-01',
  purpose: 'work',
  distance: 50,
  ...o,
});

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({
    chargeSessions: [],
    expenses: [],
    serviceRecords: [],
    fuelPrices: [],
    trips: [],
  });
});

describe('charge session actions', () => {
  it('adds (prepend), updates and deletes', () => {
    const s = useAppStore.getState();
    s.addChargeSession(charge({ id: 'c1' }));
    s.addChargeSession(charge({ id: 'c2' }));
    expect(useAppStore.getState().chargeSessions.map((x) => x.id)).toEqual(['c2', 'c1']);
    s.updateChargeSession({ ...charge({ id: 'c1' }), kWh: 99 });
    expect(useAppStore.getState().chargeSessions.find((x) => x.id === 'c1')?.kWh).toBe(99);
    s.deleteChargeSession('c2');
    expect(useAppStore.getState().chargeSessions.map((x) => x.id)).toEqual(['c1']);
  });
});

describe('expense actions', () => {
  it('adds, updates and deletes', () => {
    const s = useAppStore.getState();
    s.addExpense(expense({ id: 'e1', amount: 100 }));
    s.updateExpense({ ...expense({ id: 'e1' }), amount: 250 });
    expect(useAppStore.getState().expenses[0].amount).toBe(250);
    s.deleteExpense('e1');
    expect(useAppStore.getState().expenses).toHaveLength(0);
  });
});

describe('service record actions', () => {
  it('adds, updates and deletes', () => {
    const s = useAppStore.getState();
    s.addServiceRecord(service({ id: 's1' }));
    s.updateServiceRecord({ ...service({ id: 's1' }), cost: 3000 });
    expect(useAppStore.getState().serviceRecords[0].cost).toBe(3000);
    s.deleteServiceRecord('s1');
    expect(useAppStore.getState().serviceRecords).toHaveLength(0);
  });
});

describe('fuel price actions', () => {
  it('adds and deletes', () => {
    const s = useAppStore.getState();
    s.addFuelPrice(price({ id: 'p1' }));
    expect(useAppStore.getState().fuelPrices).toHaveLength(1);
    s.deleteFuelPrice('p1');
    expect(useAppStore.getState().fuelPrices).toHaveLength(0);
  });
});

describe('trip actions', () => {
  it('adds, updates and deletes', () => {
    const s = useAppStore.getState();
    s.addTrip(trip({ id: 't1', purpose: 'work' }));
    s.updateTrip({ ...trip({ id: 't1' }), purpose: 'personal' });
    expect(useAppStore.getState().trips[0].purpose).toBe('personal');
    s.deleteTrip('t1');
    expect(useAppStore.getState().trips).toHaveLength(0);
  });
});

describe('clearLogs', () => {
  it('wipes all new collections too', () => {
    const s = useAppStore.getState();
    s.addChargeSession(charge());
    s.addExpense(expense());
    s.addServiceRecord(service());
    s.addFuelPrice(price());
    s.addTrip(trip());
    s.clearLogs();
    const st = useAppStore.getState();
    expect(st.chargeSessions).toHaveLength(0);
    expect(st.expenses).toHaveLength(0);
    expect(st.serviceRecords).toHaveLength(0);
    expect(st.fuelPrices).toHaveLength(0);
    expect(st.trips).toHaveLength(0);
  });
});
