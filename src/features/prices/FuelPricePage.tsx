import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Trash2, ArrowLeft, PlusCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { toast } from '../../stores/toastStore';
import { fuelPriceInputSchema, firstIssueMessage } from '../../lib/validation';
import { latestPrice, cheapestEntry, priceTrend } from '../../lib/fuelPrice';
import { formatDate } from '../../utils/dateUtils';
import { EmptyStateCompact } from '../../components/EmptyState';
import type { FuelPriceEntry } from '../../types';

const today = () => new Date().toISOString().split('T')[0];
type FType = FuelPriceEntry['fuelType'];
const FUEL_LABELS: Record<FType, string> = { benzin: 'Benzin', dizel: 'Dizel', lpg: 'LPG', elektrik: 'Elektrik' };

export const FuelPricePage: React.FC = () => {
  const { fuelPrices, addFuelPrice, deleteFuelPrice } = useAppStore();

  const [date, setDate] = useState(today());
  const [fuelType, setFuelType] = useState<FType>('benzin');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [station, setStation] = useState('');
  const [city, setCity] = useState('');
  const [viewType, setViewType] = useState<FType>('benzin');

  const stationOptions = useMemo(
    () => Array.from(new Set(fuelPrices.map((p) => p.station).filter(Boolean))) as string[],
    [fuelPrices]
  );

  const view = useMemo(() => ({
    latest: latestPrice(fuelPrices, viewType),
    cheapest: cheapestEntry(fuelPrices, viewType),
    trend: priceTrend(fuelPrices, viewType),
    list: fuelPrices.filter((p) => p.fuelType === viewType),
  }), [fuelPrices, viewType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = fuelPriceInputSchema.safeParse({ pricePerLiter });
    if (!parsed.success) {
      toast.error(firstIssueMessage(parsed.error));
      return;
    }
    const entry: FuelPriceEntry = {
      id: crypto.randomUUID(),
      date: new Date(date).toISOString(),
      fuelType,
      pricePerLiter: parsed.data.pricePerLiter,
      station: station.trim() || undefined,
      city: city.trim() || undefined,
    };
    addFuelPrice(entry);
    setViewType(fuelType);
    toast.success('Fiyat kaydedildi.');
    setPricePerLiter('');
    setStation('');
  };

  const TrendIcon = view.trend === 'up' ? TrendingUp : view.trend === 'down' ? TrendingDown : Minus;
  const trendColor = view.trend === 'up' ? 'text-red-500' : view.trend === 'down' ? 'text-emerald-500' : 'text-gray-400';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/garage" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-rose-500 to-red-600 p-2.5 rounded-xl shadow">
            <Fuel className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yakıt Fiyat Takibi</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fiyat geçmişi ve en ucuz istasyon</p>
          </div>
        </div>
      </div>

      {/* View selector */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(FUEL_LABELS) as FType[]).map((t) => (
          <button key={t} onClick={() => setViewType(t)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${viewType === t ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
            {FUEL_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{view.latest ? `${view.latest.pricePerLiter.toFixed(2)} ₺` : '—'}</p>
          <p className="text-[10px] uppercase text-gray-500">Son Fiyat</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{view.cheapest ? `${view.cheapest.pricePerLiter.toFixed(2)} ₺` : '—'}</p>
          <p className="text-[10px] uppercase text-gray-500 truncate">{view.cheapest?.station ? `En ucuz · ${view.cheapest.station}` : 'En ucuz'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
          <TrendIcon className={`w-6 h-6 ${trendColor}`} />
          <p className="text-[10px] uppercase text-gray-500">Trend</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tarih</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Yakıt</span>
            <select value={fuelType} onChange={(e) => setFuelType(e.target.value as FType)} className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500">
              {(Object.keys(FUEL_LABELS) as FType[]).map((t) => <option key={t} value={t}>{FUEL_LABELS[t]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Birim Fiyat (₺)</span>
            <input inputMode="decimal" value={pricePerLiter} onChange={(e) => setPricePerLiter(e.target.value)} placeholder="42,50" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">İstasyon (ops.)</span>
            <input list="price-stations" value={station} onChange={(e) => setStation(e.target.value)} placeholder="Shell / Opet…" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
            <datalist id="price-stations">{stationOptions.map((s) => <option key={s} value={s} />)}</datalist>
          </label>
          <label className="block col-span-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">İl (ops.)</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="İstanbul" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors">
          <PlusCircle className="w-4 h-4" /> Fiyat Kaydet
        </button>
      </form>

      <div className="space-y-2">
        {view.list.length === 0 && <EmptyStateCompact message="Bu yakıt türü için fiyat kaydı yok." emoji="⛽" />}
        {view.list.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{p.pricePerLiter.toFixed(2)} ₺</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(p.date)}{p.station ? ` · ${p.station}` : ''}{p.city ? ` · ${p.city}` : ''}
              </p>
            </div>
            <button onClick={() => { deleteFuelPrice(p.id); toast.info('Kayıt silindi.', { action: { label: 'Geri Al', onClick: () => addFuelPrice(p) } }); }} className="p-2 text-gray-400 hover:text-red-500" aria-label="Sil">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
