import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Route as RouteIcon, Trash2, ArrowLeft, PlusCircle, Briefcase, User, Pencil, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { toast } from '../../stores/toastStore';
import { tripInputSchema, firstIssueMessage } from '../../lib/validation';
import { formatDate } from '../../utils/dateUtils';
import { EmptyStateCompact } from '../../components/EmptyState';
import type { Trip, TripPurpose } from '../../types';

const today = () => new Date().toISOString().split('T')[0];

export const TripsPage: React.FC = () => {
  const { trips, addTrip, deleteTrip, updateTrip } = useAppStore();

  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(today());
  const [purpose, setPurpose] = useState<TripPurpose>('work');
  const [distance, setDistance] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setDate(today());
    setPurpose('work');
    setDistance('');
    setFrom('');
    setTo('');
  };

  const startEdit = (t: Trip) => {
    setEditingId(t.id);
    setDate(t.date.split('T')[0]);
    setPurpose(t.purpose);
    setDistance(String(t.distance));
    setFrom(t.from || '');
    setTo(t.to || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const year = new Date().getFullYear();
  const stats = useMemo(() => {
    const ofYear = trips.filter((t) => new Date(t.date).getFullYear() === year);
    const work = ofYear.filter((t) => t.purpose === 'work').reduce((s, t) => s + t.distance, 0);
    const personal = ofYear.filter((t) => t.purpose === 'personal').reduce((s, t) => s + t.distance, 0);
    return { work, personal, total: work + personal };
  }, [trips, year]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((t) =>
      `${t.from || ''} ${t.to || ''} ${t.purpose === 'work' ? 'iş' : 'özel'}`.toLowerCase().includes(q)
    );
  }, [trips, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = tripInputSchema.safeParse({ distance });
    if (!parsed.success) {
      toast.error(firstIssueMessage(parsed.error));
      return;
    }
    const trip: Trip = {
      id: editingId || crypto.randomUUID(),
      date: new Date(date).toISOString(),
      purpose,
      distance: parsed.data.distance,
      from: from.trim() || undefined,
      to: to.trim() || undefined,
    };
    if (editingId) {
      updateTrip(trip);
      toast.success('Sefer güncellendi.');
    } else {
      addTrip(trip);
      toast.success('Sefer eklendi.');
    }
    resetForm();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/garage" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 rounded-xl shadow">
            <RouteIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sefer Günlüğü</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">İş / özel ayrımıyla kilometre takibi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.work.toLocaleString('tr-TR')}</p>
          <p className="text-[10px] uppercase text-gray-500">İş km ({year})</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.personal.toLocaleString('tr-TR')}</p>
          <p className="text-[10px] uppercase text-gray-500">Özel km</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total.toLocaleString('tr-TR')}</p>
          <p className="text-[10px] uppercase text-gray-500">Toplam</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setPurpose('work')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${purpose === 'work' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
            <Briefcase className="w-4 h-4" /> İş
          </button>
          <button type="button" onClick={() => setPurpose('personal')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${purpose === 'personal' ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
            <User className="w-4 h-4" /> Özel
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tarih</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Mesafe (km)</span>
            <input inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="45" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nereden (ops.)</span>
            <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Ofis" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Nereye (ops.)</span>
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Müşteri" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
        </div>
        <div className="flex gap-2">
          {editingId && (
            <button type="button" onClick={resetForm} className="flex items-center justify-center gap-1 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl">
              <X className="w-4 h-4" /> Vazgeç
            </button>
          )}
          <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors">
            <PlusCircle className="w-4 h-4" /> {editingId ? 'Güncelle' : 'Sefer Ekle'}
          </button>
        </div>
      </form>

      {trips.length > 0 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Seferlerde ara (nereden, nereye, iş/özel)…"
          aria-label="Seferlerde ara"
          className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500"
        />
      )}
      <div className="space-y-2">
        {trips.length === 0 && <EmptyStateCompact message="Henüz sefer kaydı yok. İş/özel yolculuklarını ekle." emoji="🚗" />}
        {trips.length > 0 && filtered.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">Eşleşen sefer yok.</p>
        )}
        {filtered.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.purpose === 'work' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'}`}>
                {t.purpose === 'work' ? 'İŞ' : 'ÖZEL'}
              </span>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t.distance.toLocaleString('tr-TR')} km</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(t.date)}{t.from || t.to ? ` · ${t.from || '?'} → ${t.to || '?'}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={() => startEdit(t)} className="p-2 text-gray-400 hover:text-primary-500" aria-label="Düzenle">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => { deleteTrip(t.id); toast.info('Sefer silindi.', { action: { label: 'Geri Al', onClick: () => addTrip(t) } }); }} className="p-2 text-gray-400 hover:text-red-500" aria-label="Sil">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
