/**
 * Centralized, defensive localStorage access.
 *
 * Historically the app scattered raw `localStorage.getItem` / `JSON.parse`
 * calls across many files, which caused crashes when storage was unavailable
 * (private mode / iOS) or held corrupted data. Route access through these
 * helpers so a single try/catch protects every read and write.
 */

/** Canonical storage keys used across the app. */
export const STORAGE_KEYS = {
  store: 'yakit-takip-store',
  logs: 'yakit_takip_logs_v1',
  maintenance: 'yakit_takip_maintenance_v1',
  vehicles: 'yakit_takip_vehicles_v1',
  parts: 'yakit_takip_parts_v1',
  fuelPurchases: 'yakit_takip_fuel_purchases_v1',
  theme: 'yakit_takip_theme_v1',
  accent: 'yakit_takip_accent_v1',
} as const;

const hasStorage = (): boolean => {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
};

/** Read a raw string, returning `null` if missing or storage is unavailable. */
export const getString = (key: string): string | null => {
  if (!hasStorage()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** Write a raw string, swallowing quota/availability errors. */
export const setString = (key: string, value: string): void => {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`[storage] failed to write "${key}"`, e);
  }
};

/** Parse a JSON value, returning `fallback` on missing or corrupted data. */
export const getJSON = <T>(key: string, fallback: T): T => {
  const raw = getString(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[storage] corrupted JSON for "${key}", using fallback`, e);
    return fallback;
  }
};

/** Stringify and store a JSON value. */
export const setJSON = (key: string, value: unknown): void => {
  try {
    setString(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[storage] failed to serialize "${key}"`, e);
  }
};

export const remove = (key: string): void => {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};
