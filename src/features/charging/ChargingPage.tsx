import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Trash2, ArrowLeft, BatteryCharging } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { toast } from '../../stores/toastStore';
import { chargeSessionInputSchema, firstIssueMessage } from '../../lib/validation';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { EmptyStateCompact } from '../../components/EmptyState';
import type { ChargeSession } from '../../types';

const today = () => new Date().toISOString().split('T')[0];

export const ChargingPage: React.FC = () => {
  const { chargeSessions, addChargeSession, deleteChargeSession } = useAppStore();

  const [date, setDate] = useState(today());
  const [kWh, setKWh] = useState('');
  const [cost, setCost] = useState('');
  const [chargeType, setChargeType] = useState<'ac' | 'dc'>('ac');
  const [location, setLocation] = useState<'home' | 'station'>('home');
  const [station, setStation] = useState('');

  const stats = useMemo(() => {
    const totalKWh = chargeSessions.reduce((s, c) => s + c.kWh, 0);
    const totalCost = chargeSessions.reduce((s, c) => s + c.cost, 0);
    return {
      totalKWh,
      totalCost,
      avgPerKWh: totalKWh > 0 ? totalCost / totalKWh : 0,
      count: chargeSessions.length,
    };
  }, [chargeSessions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = chargeSessionInputSchema.safeParse({ kWh, cost });
    if (!parsed.success) {
      toast.error(firstIssueMessage(parsed.error));
      return;
    }
    const session: ChargeSession = {
      id: crypto.randomUUID(),
      date: new Date(date).toISOString(),
      kWh: parsed.data.kWh,
      cost: parsed.data.cost,
      pricePerKwh: parsed.data.kWh > 0 ? parsed.data.cost / parsed.data.kWh : undefined,
      chargeType,
      location,
      station: station.trim() || undefined,
    };
    addChargeSession(session);
    toast.success('Şarj kaydı eklendi.');
    setKWh('');
    setCost('');
    setStation('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/garage" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-xl shadow">
            <BatteryCharging className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Şarj Kayıtları</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Elektrikli / hibrit araç şarjı (kWh)</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalKWh.toFixed(1)}</p>
          <p className="text-[10px] uppercase text-gray-500">Toplam kWh</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalCost)}</p>
          <p className="text-[10px] uppercase text-gray-500">Toplam Ücret</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.avgPerKWh.toFixed(2)} ₺</p>
          <p className="text-[10px] uppercase text-gray-500">Ort. TL/kWh</p>
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
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">İstasyon (ops.)</span>
            <input value={station} onChange={(e) => setStation(e.target.value)} placeholder="Ev / Trugo / Eşarj…" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Enerji (kWh)</span>
            <input inputMode="decimal" value={kWh} onChange={(e) => setKWh(e.target.value)} placeholder="30" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ücret (₺)</span>
            <input inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="150" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tip</span>
            <select value={chargeType} onChange={(e) => setChargeType(e.target.value as 'ac' | 'dc')} className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500">
              <option value="ac">AC (Yavaş)</option>
              <option value="dc">DC (Hızlı)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Konum</span>
            <select value={location} onChange={(e) => setLocation(e.target.value as 'home' | 'station')} className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500">
              <option value="home">Ev</option>
              <option value="station">İstasyon</option>
            </select>
          </label>
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors">
          <Zap className="w-4 h-4" /> Şarj Kaydı Ekle
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {chargeSessions.length === 0 && (
          <EmptyStateCompact message="Henüz şarj kaydı yok. İlk şarjını ekle." emoji="🔌" />
        )}
        {chargeSessions.map((c) => (
          <div key={c.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                {c.kWh.toFixed(1)} kWh · {formatCurrency(c.cost)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(c.date)} · {c.chargeType === 'dc' ? 'DC' : 'AC'} · {c.location === 'home' ? 'Ev' : c.station || 'İstasyon'}
              </p>
            </div>
            <button onClick={() => { deleteChargeSession(c.id); toast.info('Kayıt silindi.', { action: { label: 'Geri Al', onClick: () => addChargeSession(c) } }); }} className="p-2 text-gray-400 hover:text-red-500" aria-label="Sil">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
