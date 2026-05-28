import { FuelPriceEntry } from '../types';

const byDateDesc = (a: FuelPriceEntry, b: FuelPriceEntry) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

/** Most recently recorded price for a fuel type. */
export function latestPrice(
  prices: FuelPriceEntry[],
  fuelType: FuelPriceEntry['fuelType']
): FuelPriceEntry | null {
  const sorted = prices.filter((p) => p.fuelType === fuelType).sort(byDateDesc);
  return sorted[0] ?? null;
}

/** Cheapest entry (by unit price) for a fuel type across all recorded stations. */
export function cheapestEntry(
  prices: FuelPriceEntry[],
  fuelType: FuelPriceEntry['fuelType']
): FuelPriceEntry | null {
  const matches = prices.filter((p) => p.fuelType === fuelType);
  if (matches.length === 0) return null;
  return matches.reduce((min, p) => (p.pricePerLiter < min.pricePerLiter ? p : min));
}

export type PriceTrend = 'up' | 'down' | 'flat';

/** Trend from the two most recent prices for a fuel type. */
export function priceTrend(
  prices: FuelPriceEntry[],
  fuelType: FuelPriceEntry['fuelType']
): PriceTrend | null {
  const sorted = prices.filter((p) => p.fuelType === fuelType).sort(byDateDesc);
  if (sorted.length < 2) return null;
  const [latest, prev] = sorted;
  if (latest.pricePerLiter > prev.pricePerLiter) return 'up';
  if (latest.pricePerLiter < prev.pricePerLiter) return 'down';
  return 'flat';
}
