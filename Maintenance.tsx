import React, { useState, useEffect } from 'react';
import { MaintenanceItem } from './types';
import { Wrench, Plus, Trash2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface MaintenanceProps {
    items: MaintenanceItem[];
    currentOdometer: number;
    onAdd: (item: MaintenanceItem) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, lastKm: number) => void;
}

export const Maintenance: React.FC<MaintenanceProps> = ({ items, currentOdometer, onAdd, onDelete, onUpdate }) => {
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [maintenanceType, setMaintenanceType] = useState<'km' | 'date'>('km');
    const [intervalKm, setIntervalKm] = useState('');
    const [lastKm, setLastKm] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        if (maintenanceType === 'km') {
            if (!intervalKm || !lastKm) return;
            const interval = parseInt(intervalKm);
            const last = parseInt(lastKm);
            const nextDue = last + interval;

            const newItem: MaintenanceItem = {
                id: crypto.randomUUID(),
                title,
                type: 'km',
                intervalKm: interval,
                lastMaintenanceKm: last,
                notifyBeforeKm: 1000,
                nextDueKm: nextDue,
                status: 'ok'
            };
            onAdd(newItem);
        } else {
            if (!dueDate) return;
            const newItem: MaintenanceItem = {
                id: crypto.randomUUID(),
                title,
                type: 'date',
                dueDate,
                notifyBeforeDays: 30,
                status: 'ok'
            };
            onAdd(newItem);
        }

        setTitle('');
        setIntervalKm('');
        setLastKm('');
        setDueDate('');
        setShowAddForm(false);
    };

    const calculateStatus = (item: MaintenanceItem): { color: string, text: string, icon: React.ReactNode, remaining: number | string } => {
        // Date-based items (muayene, sigorta)
        if (item.type === 'date' && item.dueDate) {
            const dueDate = new Date(item.dueDate);
            const today = new Date();
            const diffTime = dueDate.getTime() - today.getTime();
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const notifyDays = item.notifyBeforeDays || 30;

            if (daysRemaining < 0) {
                return {
                    color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                    text: 'Süresi Dolmuş',
                    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
                    remaining: `${Math.abs(daysRemaining)} gün geçti`
                };
            } else if (daysRemaining <= notifyDays) {
                return {
                    color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
                    text: 'Yaklaşıyor',
                    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
                    remaining: `${daysRemaining} gün kaldı`
                };
            } else {
                return {
                    color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                    text: 'Durum İyi',
                    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                    remaining: `${daysRemaining} gün kaldı`
                };
            }
        }

        // KM-based items (default)
        const remaining = (item.nextDueKm || 0) - currentOdometer;
        const notifyKm = item.notifyBeforeKm || 1000;

        if (remaining < 0) {
            return {
                color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                text: 'Acil Bakım Gerekli',
                icon: <AlertCircle className="w-5 h-5 text-red-600" />,
                remaining
            };
        } else if (remaining <= notifyKm) {
            return {
                color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
                text: 'Bakım Yaklaşıyor',
                icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
                remaining
            };
        } else {
            return {
                color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                text: 'Durum İyi',
                icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                remaining
            };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                    <Wrench className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Bakım Takibi
                    <div className="ml-3 px-3 py-1 text-xs font-normal bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                        Güncel KM: {currentOdometer.toLocaleString()}
                    </div>
                </h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center space-x-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Yeni Ekle</span>
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2">
                    {/* Type Selector */}
                    <div className="flex rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                        <button
                            type="button"
                            onClick={() => setMaintenanceType('km')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${maintenanceType === 'km' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'}`}
                        >
                            KM Bazlı
                        </button>
                        <button
                            type="button"
                            onClick={() => setMaintenanceType('date')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${maintenanceType === 'date' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'}`}
                        >
                            Tarih Bazlı
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                {maintenanceType === 'km' ? 'Bakım Adı' : 'Hatırlatıcı Adı'}
                            </label>
                            <input
                                type="text"
                                placeholder={maintenanceType === 'km' ? 'Örn: Yağ Değişimi' : 'Örn: Araç Muayenesi'}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        {maintenanceType === 'km' ? (
                            <>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Periyot (KM)</label>
                                    <input
                                        type="number"
                                        placeholder="10000"
                                        value={intervalKm}
                                        onChange={e => setIntervalKm(e.target.value)}
                                        className="w-full p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">En Son Yapılan KM</label>
                                    <input
                                        type="number"
                                        placeholder="125000"
                                        value={lastKm}
                                        onChange={e => setLastKm(e.target.value)}
                                        className="w-full p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Son Tarih</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg text-sm transition-colors">
                        Kaydet
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 gap-4">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Wrench className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p>Henüz bakım kaydı eklenmedi.</p>
                    </div>
                ) : (
                    items.map(item => {
                        const status = calculateStatus(item);
                        const isDateBased = item.type === 'date';
                        const percent = isDateBased ? 0 : Math.min(100, Math.max(0, ((currentOdometer - (item.lastMaintenanceKm || 0)) / (item.intervalKm || 1)) * 100));

                        return (
                            <div key={item.id} className={`p-4 rounded-xl border ${status.color} transition-all`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        {status.icon}
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-white">{item.title}</h4>
                                            <p className="text-xs opacity-70">
                                                {isDateBased
                                                    ? `Son Tarih: ${new Date(item.dueDate!).toLocaleDateString('tr-TR')}`
                                                    : `Periyot: ${(item.intervalKm || 0).toLocaleString()} km`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {!isDateBased && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`${item.title} bakımını şimdi yaptığınızı onaylıyor musunuz? (Yeni KM: ${currentOdometer})`)) {
                                                        onUpdate(item.id, currentOdometer);
                                                    }
                                                }}
                                                className="px-3 py-1.5 text-xs font-bold bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 rounded-lg transition-colors"
                                            >
                                                Bakım Yapıldı
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium opacity-80">
                                        <span>{status.text}</span>
                                        <span>{typeof status.remaining === 'string' ? status.remaining : `${status.remaining.toLocaleString()} km kaldı`}</span>
                                    </div>
                                    {!isDateBased && (
                                        <>
                                            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${typeof status.remaining === 'number' && status.remaining < 0 ? 'bg-red-500' : typeof status.remaining === 'number' && status.remaining <= (item.notifyBeforeKm || 1000) ? 'bg-amber-500' : 'bg-green-500'}`}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] opacity-60">
                                                <span>Son: {(item.lastMaintenanceKm || 0).toLocaleString()}</span>
                                                <span>Hedef: {(item.nextDueKm || 0).toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div >
    );
};
