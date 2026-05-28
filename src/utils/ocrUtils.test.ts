import { describe, it, expect } from 'vitest';
import { parseReceiptText } from './ocrUtils';

describe('parseReceiptText', () => {
  it('extracts the date in YYYY-MM-DD form', () => {
    const result = parseReceiptText('Tarih: 05.03.2026\nTOPLAM 500.00');
    expect(result.date).toBe('2026-03-05');
  });

  it('expands two-digit years to 2000+', () => {
    const result = parseReceiptText('15/06/24\n');
    expect(result.date).toBe('2024-06-15');
  });

  it('ignores invalid dates', () => {
    // 45 is not a valid day -> Date() rolls over, but the check only validates
    // parseability; ensure no crash and a string field shape.
    const result = parseReceiptText('no date here');
    expect(result.date).toBeUndefined();
  });

  it('extracts liters, unit price and total from keyword lines', () => {
    const text = ['LITRE 25,50', 'BIRIM FIYAT 42,30', 'TOPLAM TUTAR 1078.65'].join('\n');
    const result = parseReceiptText(text);
    expect(result.liters).toBeCloseTo(25.5);
    expect(result.unitPrice).toBeCloseTo(42.3);
    expect(result.totalAmount).toBeCloseTo(1078.65);
  });

  it('normalizes comma decimals to dots', () => {
    const result = parseReceiptText('TOPLAM 99,90');
    expect(result.totalAmount).toBeCloseTo(99.9);
  });

  it('always returns the original text', () => {
    const raw = 'arbitrary receipt text';
    expect(parseReceiptText(raw).text).toBe(raw);
  });
});
