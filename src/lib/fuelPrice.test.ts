import { describe, it, expect } from 'vitest';
import { latestPrice, cheapestEntry, priceTrend } from './fuelPrice';
import type { FuelPriceEntry } from '../types';

const p = (date: string, pricePerLiter: number, station?: string): FuelPriceEntry => ({
  id: Math.random().toString(),
  date,
  fuelType: 'benzin',
  pricePerLiter,
  station,
});

describe('fuelPrice helpers', () => {
  const prices = [p('2026-01-01', 42, 'A'), p('2026-03-01', 44, 'B'), p('2026-02-01', 40, 'C')];

  it('latestPrice returns the most recent entry', () => {
    expect(latestPrice(prices, 'benzin')?.pricePerLiter).toBe(44);
  });

  it('cheapestEntry returns the lowest unit price', () => {
    expect(cheapestEntry(prices, 'benzin')?.station).toBe('C');
  });

  it('priceTrend compares the two most recent prices', () => {
    expect(priceTrend(prices, 'benzin')).toBe('up'); // 40 (Feb) -> 44 (Mar)
  });

  it('returns null when no data for the type', () => {
    expect(latestPrice(prices, 'dizel')).toBeNull();
    expect(priceTrend([p('2026-01-01', 42)], 'benzin')).toBeNull();
  });
});
