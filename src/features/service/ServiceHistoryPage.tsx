import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Trash2, ArrowLeft, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { toast } from '../../stores/toastStore';
import { serviceInputSchema, firstIssueMessage } from '../../lib/validation';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { EmptyStateCompact } from '../../components/EmptyState';
import type { ServiceRecord } from '../../types';

const today = () => new Date().toISOString().split('T')[0];

export const ServiceHistoryPage: React.FC = () => {
  const { serviceRecords, addServiceRecord, deleteServiceRecord } = useAppStore();

  const [date, setDate] = useState(today());
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState('');
  const [odometer, setOdometer] = useState('');
  const [provider, setProvider] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  const totalCost = useMemo(() => serviceRecords.reduce((s, r) => s + r.cost, 0), [serviceRecords]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.onerror = () => toast.error('Fotoğraf okunamadı.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = serviceInputSchema.safeParse({ title, cost });
    if (!parsed.success) {
      toast.error(firstIssueMessage(parsed.error));
      return;
    }
    const record: ServiceRecord = {
      id: crypto.randomUUID(),
      date: new Date(date).toISOString(),
      title: parsed.data.title,
      cost: parsed.data.cost,
      odometer: odometer ? parseFloat(odometer.replace(',', '.')) : undefined,
      provider: provider.trim() || undefined,
      photoUrl,
    };
    addServiceRecord(record);
    toast.success('Servis kaydı eklendi.');
    setTitle('');
    setCost('');
    setOdometer('');
    setProvider('');
    setPhotoUrl(undefined);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/garage" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Servis Geçmişi</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Yapılan bakım/onarımlar ve maliyetleri</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Toplam Servis Harcaması</span>
        <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCost)}</span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <label className="block col-span-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">İşlem</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Yağ ve filtre değişimi" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tarih</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tutar (₺)</span>
            <input inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="2000" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Kilometre (ops.)</span>
            <input inputMode="decimal" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="85000" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Servis (ops.)</span>
            <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Yetkili servis" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
          <ImageIcon className="w-4 h-4" />
          <span>{photoUrl ? 'Fatura eklendi ✓' : 'Fatura fotoğrafı ekle (ops.)'}</span>
          <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        </label>
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
          <PlusCircle className="w-4 h-4" /> Servis Kaydı Ekle
        </button>
      </form>

      <div className="space-y-2">
        {serviceRecords.length === 0 && <EmptyStateCompact message="Henüz servis kaydı yok. Yapılan bakımları ekle." emoji="🔧" />}
        {serviceRecords.map((r) => (
          <div key={r.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 min-w-0">
              {r.photoUrl && <img src={r.photoUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
              <div className="min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">{r.title} · {formatCurrency(r.cost)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {formatDate(r.date)}{r.odometer ? ` · ${r.odometer.toLocaleString('tr-TR')} km` : ''}{r.provider ? ` · ${r.provider}` : ''}
                </p>
              </div>
            </div>
            <button onClick={() => { deleteServiceRecord(r.id); toast.info('Kayıt silindi.', { action: { label: 'Geri Al', onClick: () => addServiceRecord(r) } }); }} className="p-2 text-gray-400 hover:text-red-500 shrink-0" aria-label="Sil">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
