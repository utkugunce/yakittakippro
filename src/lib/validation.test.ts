import { describe, it, expect } from 'vitest';
import {
  dailyLogInputSchema,
  fuelPurchaseInputSchema,
  firstIssueMessage,
} from './validation';

describe('fuelPurchaseInputSchema', () => {
  it('parses valid string inputs into numbers', () => {
    const result = fuelPurchaseInputSchema.safeParse({
      liters: '25.5',
      pricePerLiter: '42.30',
      totalAmount: '1078.65',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.liters).toBeCloseTo(25.5);
      expect(result.data.pricePerLiter).toBeCloseTo(42.3);
      expect(result.data.totalAmount).toBeCloseTo(1078.65);
    }
  });

  it('normalizes Turkish comma decimals', () => {
    const result = fuelPurchaseInputSchema.safeParse({
      liters: '25,50',
      pricePerLiter: '42,30',
      totalAmount: '1.078,00'.replace('.', ''), // "1078,00"
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.liters).toBeCloseTo(25.5);
    }
  });

  it('rejects empty and non-positive values with a message', () => {
    const empty = fuelPurchaseInputSchema.safeParse({
      liters: '',
      pricePerLiter: '40',
      totalAmount: '100',
    });
    expect(empty.success).toBe(false);
    if (!empty.success) {
      expect(firstIssueMessage(empty.error)).toMatch(/Litre miktarı/);
    }

    const zero = fuelPurchaseInputSchema.safeParse({
      liters: '0',
      pricePerLiter: '40',
      totalAmount: '100',
    });
    expect(zero.success).toBe(false);
  });
});

describe('dailyLogInputSchema', () => {
  it('accepts a valid daily log input', () => {
    const result = dailyLogInputSchema.safeParse({
      currentOdometer: '12500',
      dailyDistance: '45',
      avgConsumption: '6.5',
      fuelPrice: '42.5',
    });
    expect(result.success).toBe(true);
  });

  it('allows zero odometer/price (non-negative) but rejects zero distance', () => {
    const ok = dailyLogInputSchema.safeParse({
      currentOdometer: '0',
      dailyDistance: '10',
      avgConsumption: '5',
      fuelPrice: '0',
    });
    expect(ok.success).toBe(true);

    const badDistance = dailyLogInputSchema.safeParse({
      currentOdometer: '100',
      dailyDistance: '0',
      avgConsumption: '5',
      fuelPrice: '40',
    });
    expect(badDistance.success).toBe(false);
  });

  it('rejects non-numeric input', () => {
    const result = dailyLogInputSchema.safeParse({
      currentOdometer: 'abc',
      dailyDistance: '10',
      avgConsumption: '5',
      fuelPrice: '40',
    });
    expect(result.success).toBe(false);
  });
});
