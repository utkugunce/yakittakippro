import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency } from './dateUtils';

describe('formatDate', () => {
  it('returns empty string for falsy input', () => {
    expect(formatDate('')).toBe('');
  });

  it('formats an ISO date in Turkish locale', () => {
    // tr-TR long format: "1 Ocak 2026"
    const result = formatDate('2026-01-01');
    expect(result).toContain('2026');
    expect(result).toContain('Ocak');
  });
});

describe('formatCurrency', () => {
  it('formats a number as Turkish Lira', () => {
    const result = formatCurrency(1234.5);
    // Should contain the lira symbol and the grouped number.
    expect(result).toMatch(/₺/);
    expect(result).toMatch(/1\.234/);
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toMatch(/0/);
  });
});
