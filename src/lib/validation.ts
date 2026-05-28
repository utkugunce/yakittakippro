import { z } from 'zod';

/**
 * Form-input validation schemas.
 *
 * Forms hold their numeric fields as strings, so these schemas accept strings,
 * normalize Turkish comma decimals ("25,50" -> 25.5), and emit validated
 * numbers. This replaces ad-hoc `parseFloat` + `isNaN` checks scattered in the
 * forms with a single, tested source of truth.
 */

const toNumber = (s: string): number => Number(s.replace(',', '.'));

const requiredNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} zorunludur.`)
    .transform(toNumber)
    .refine((n) => Number.isFinite(n), `${label} geçerli bir sayı olmalı.`);

const positive = (label: string) =>
  requiredNumber(label).refine((n) => n > 0, `${label} 0'dan büyük olmalı.`);

const nonNegative = (label: string) =>
  requiredNumber(label).refine((n) => n >= 0, `${label} negatif olamaz.`);

export const dailyLogInputSchema = z.object({
  currentOdometer: nonNegative('Kilometre sayacı'),
  dailyDistance: positive('Günlük mesafe'),
  avgConsumption: positive('Ortalama tüketim'),
  fuelPrice: nonNegative('Yakıt fiyatı'),
});

export const fuelPurchaseInputSchema = z.object({
  liters: positive('Litre miktarı'),
  pricePerLiter: positive('Litre fiyatı'),
  totalAmount: positive('Toplam tutar'),
});

export const chargeSessionInputSchema = z.object({
  kWh: positive('Şarj miktarı (kWh)'),
  cost: nonNegative('Ücret'),
});

export const expenseInputSchema = z.object({
  amount: positive('Tutar'),
});

export const serviceInputSchema = z.object({
  title: z.string().trim().min(1, 'İşlem açıklaması zorunludur.'),
  cost: nonNegative('Tutar'),
});

export const tripInputSchema = z.object({
  distance: positive('Mesafe'),
});

export const fuelPriceInputSchema = z.object({
  pricePerLiter: positive('Birim fiyat'),
});

export type DailyLogInput = z.infer<typeof dailyLogInputSchema>;
export type FuelPurchaseInput = z.infer<typeof fuelPurchaseInputSchema>;

/** First human-readable error message from a failed parse, for inline display. */
export const firstIssueMessage = (error: z.ZodError): string =>
  error.issues[0]?.message ?? 'Geçersiz giriş.';
