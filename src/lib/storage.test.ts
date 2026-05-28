import { describe, it, expect, beforeEach } from 'vitest';
import { getString, setString, getJSON, setJSON, remove, STORAGE_KEYS } from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('storage helpers', () => {
  it('round-trips raw strings', () => {
    setString('k', 'v');
    expect(getString('k')).toBe('v');
  });

  it('returns null for missing strings', () => {
    expect(getString('missing')).toBeNull();
  });

  it('round-trips JSON values', () => {
    setJSON('obj', { a: 1, b: [2, 3] });
    expect(getJSON('obj', null)).toEqual({ a: 1, b: [2, 3] });
  });

  it('returns the fallback for missing JSON', () => {
    expect(getJSON('nope', { default: true })).toEqual({ default: true });
  });

  it('returns the fallback for corrupted JSON instead of throwing', () => {
    localStorage.setItem('bad', '{not json');
    expect(getJSON('bad', [])).toEqual([]);
  });

  it('removes a key', () => {
    setString('k', 'v');
    remove('k');
    expect(getString('k')).toBeNull();
  });

  it('exposes canonical storage keys', () => {
    expect(STORAGE_KEYS.store).toBe('yakit-takip-store');
    expect(STORAGE_KEYS.logs).toBe('yakit_takip_logs_v1');
  });
});
