import React, { useState } from 'react';
import { MaintenanceItem, VehiclePart, PartType } from './types';
import { Wrench, Plus, Trash2, AlertTriangle, CheckCircle, AlertCircle, Circle, Archive, Disc, Zap, Fan } from 'lucide-react';

interface MaintenanceProps {
    items: MaintenanceItem[];
    parts: VehiclePart[];
    currentOdometer: number;
    onAdd: (item: MaintenanceItem) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, lastKm: number) => void;
    onAddPart: (part: VehiclePart) => void;
    onDeletePart: (id: string) => void;
    onTogglePart: (id: string) => void;
}

export const Maintenance: React.FC<MaintenanceProps> = ({
    items, parts, currentOdometer, onAdd, onDelete, onUpdate, onAddPart, onDeletePart, onTogglePart
}) => {
    const [subTab, setSubTab] = useState<'scheduled' | 'parts'>('scheduled');
    const [showAddForm, setShowAddForm] = useState(false);

    // --- Scheduled Maintenance Form State ---
    const [title, setTitle] = useState('');
    const [maintenanceType, setMaintenanceType] = useState<'km' | 'date' | 'both'>('km');
    const [intervalKm, setIntervalKm] = useState('');
    const [lastKm, setLastKm] = useState('');
    const [dueDate, setDueDate] = useState('');

    // --- Part Form State ---
    const [partType, setPartType] = useState<PartType>('tire');
    const [partName, setPartName] = useState('');
    const [installKm, setInstallKm] = useState('');
    const [installDate, setInstallDate] = useState(new Date().toISOString().split('T')[0]);
    const [lifespanKm, setLifespanKm] = useState('');


    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (subTab === 'scheduled') {
            if (!title) return;

            let newItem: MaintenanceItem = {
                id: crypto.randomUUID(),
                title,
                type: maintenanceType,
                status: 'ok'
            };

            if (maintenanceType === 'km' || maintenanceType === 'both') {
                if (!intervalKm || !lastKm) return;
                const interval = parseInt(intervalKm);
                const last = parseInt(lastKm);
                newItem.intervalKm = interval;
                newItem.lastMaintenanceKm = last;
                newItem.nextDueKm = last + interval;
                newItem.notifyBeforeKm = 1000;
            }

            if (maintenanceType === 'date' || maintenanceType === 'both') {
                if (!dueDate) return;
                newItem.dueDate = dueDate;
                newItem.notifyBeforeDays = 30;
            }

            onAdd(newItem);
            setTitle(''); setIntervalKm(''); setLastKm(''); setDueDate('');
        } else {
            // Add Part
            if (!partName || !installKm) return;

            const newPart: VehiclePart = {
                id: crypto.randomUUID(),
                type: partType,
                name: partName,
                installDate,
                installKm: parseInt(installKm),
                lifespanKm: lifespanKm ? parseInt(lifespanKm) : undefined,
                isActive: partType === 'tire' ? true : true, // Default active
                notes: ''
            };
            onAddPart(newPart);
            setPartName(''); setInstallKm(''); setLifespanKm('');
        }
        setShowAddForm(false);
    };

    const calculateStatus = (item: MaintenanceItem) => {
        // Date Check
        let dateStatus = { isDue: false, diff: 0, text: '' };
        if ((item.type === 'date' || item.type === 'both') && item.dueDate) {
            const days = Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            if (days < 0) dateStatus = { isDue: true, diff: days, text: `${Math.abs(days)} gün geçti` };
            else if (days <= (item.notifyBeforeDays || 30)) dateStatus = { isDue: true, diff: days, text: `${days} gün kaldı` };
            else dateStatus = { isDue: false, diff: days, text: `${days} gün kaldı` };
        }

        // KM Check
        let kmStatus = { isDue: false, diff: 0, text: '' };
        if ((item.type === 'km' || item.type === 'both') && item.nextDueKm) {
            const remaining = item.nextDueKm - currentOdometer;
            if (remaining < 0) kmStatus = { isDue: true, diff: remaining, text: `${Math.abs(remaining).toLocaleString()} km geçti` };
            else if (remaining <= (item.notifyBeforeKm || 1000)) kmStatus = { isDue: true, diff: remaining, text: `${remaining.toLocaleString()} km kaldı` };
            else kmStatus = { isDue: false, diff: remaining, text: `${remaining.toLocaleString()} km kaldı` };
        }

        // Combine
        if (item.type === 'date') return getStatusObject(dateStatus.diff, dateStatus.text, dateStatus.isDue, 'date');
        if (item.type === 'km') return getStatusObject(kmStatus.diff, kmStatus.text, kmStatus.isDue, 'km');

        // Both - return the worse one
        // If one is overdue (negative), return that. If both, return most overdue.
        // If neither overdue, return closest.
        if (dateStatus.diff < 0 || kmStatus.diff < 0) {
            // Priority to the one passed
            if (dateStatus.diff < 0 && kmStatus.diff >= 0) return getStatusObject(dateStatus.diff, dateStatus.text, true, 'date');
            if (kmStatus.diff < 0 && dateStatus.diff >= 0) return getStatusObject(kmStatus.diff, kmStatus.text, true, 'km');
            return getStatusObject(kmStatus.diff, `${kmStatus.text} / ${dateStatus.text}`, true, 'both');
        }

        // Both future - return closest relative to urgency threshold? Or just show both?
        // Let's show both texts or the most urgent one.
        // Simple heuristic: if day < 30 or km < 1000
        const isWarning = dateStatus.isDue || kmStatus.isDue;
        return getStatusObject(0, `${kmStatus.text} / ${dateStatus.text}`, isWarning, 'both');
    };

    const getStatusObject = (diff: number, text: string, isWarning: boolean, type: string) => {
        if (diff < 0) return { color: 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800', text: 'Süresi Dolmuş', icon: <AlertCircle className="w-5 h-5 text-red-600" />, remaining: text };
        if (isWarning) return { color: 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800', text: 'Yaklaşıyor', icon: <AlertTriangle className="w-5 h-5 text-amber-600" />, remaining: text };
        return { color: 'text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800', text: 'Durum İyi', icon: <CheckCircle className="w-5 h-5 text-green-600" />, remaining: text };
    }

    const getPartIcon = (type: PartType) => {
        switch (type) {
            case 'tire': return <Disc className="w-5 h-5" />;
            case 'battery': return <Zap className="w-5 h-5" />;
            case 'wiper': return <Fan className="w-5 h-5" />; // Approx icon
            case 'pad': return <Circle className="w-5 h-5" />;
            default: return <Archive className="w-5 h-5" />;
        }
    };

    // Helper: auto-fill install KM with current Odometer
    const handleAddClick = () => {
        setLastKm(currentOdometer.toString());
        setInstallKm(currentOdometer.toString());
        setShowAddForm(!showAddForm);
    };

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                        <Wrench className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                        Bakım & Parçalar
                    </h3>
                    <div className="px-3 py-1 text-xs font-normal bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                        {currentOdometer.toLocaleString()} km
                    </div>
                </div>

                <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    <button
                        onClick={() => setSubTab('scheduled')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${subTab === 'scheduled' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-300 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Periyodik Bakım
                    </button>
                    <button
                        onClick={() => setSubTab('parts')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${subTab === 'parts' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-300 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Parça & Lastik
                    </button>
                </div>
            </div>

            {/* Add Button */}
            <button
                onClick={handleAddClick}
                className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:border-primary-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 font-bold transition-all flex items-center justify-center"
            >
                <Plus className="w-5 h-5 mr-2" />
                {subTab === 'scheduled' ? 'Yeni Bakım Hatırlatıcısı' : 'Yeni Parça Ekle'}
            </button>

            {/* Form */}
            {showAddForm && (
                <form onSubmit={handleDetailsSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2">
                    {subTab === 'scheduled' ? (
                        <>
                            {/* Existing Scheduled Maintenance Form Logic */}
                            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-2">
                                <button type="button" onClick={() => setMaintenanceType('km')} className={`flex-1 py-1.5 text-xs font-bold rounded ${maintenanceType === 'km' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}>KM Bazlı</button>
                                <button type="button" onClick={() => setMaintenanceType('date')} className={`flex-1 py-1.5 text-xs font-bold rounded ${maintenanceType === 'date' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}>Tarih Bazlı</button>
                                <button type="button" onClick={() => setMaintenanceType('both')} className={`flex-1 py-1.5 text-xs font-bold rounded ${maintenanceType === 'both' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}>Her İkisi</button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {['Periyodik Bakım', 'Muayene', 'Kasko', 'Trafik Sigortası'].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => {
                                            setTitle(suggestion);
                                            // Auto-select 'date' for insurance/inspection
                                            if (suggestion === 'Kasko' || suggestion === 'Trafik Sigortası' || suggestion === 'Muayene') {
                                                setMaintenanceType('date');
                                            } else {
                                                setMaintenanceType('km');
                                            }
                                        }}
                                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                            <input type="text" placeholder="Bakım Adı (Örn: Yağ Değişimi)" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" required />

                            {(maintenanceType === 'km' || maintenanceType === 'both') && (
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" placeholder="Periyot (KM)" value={intervalKm} onChange={e => setIntervalKm(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" required />
                                    <input type="number" placeholder="Son Yapılan KM" value={lastKm} onChange={e => setLastKm(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" required />
                                </div>
                            )}

                            {(maintenanceType === 'date' || maintenanceType === 'both') && (
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" required />
                            )}
                        </>
                    ) : (
                        <>
                            {/* Part Entry Form */}
                            <label className="block text-xs font-bold text-gray-500 uppercase">Parça Türü</label>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {(['tire', 'battery', 'pad', 'wiper', 'other'] as const).map(t => (
                                    <button
                                        key={t} type="button"
                                        onClick={() => setPartType(t)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${partType === t ? 'bg-primary-100 border-primary-200 text-primary-700 dark:bg-gray-800 dark:border-primary-500 dark:text-primary-300' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600'}`}
                                    >
                                        {t === 'tire' ? 'Lastik' : t === 'battery' ? 'Akü' : t === 'pad' ? 'Balata' : t === 'wiper' ? 'Silecek' : 'Diğer'}
                                    </button>
                                ))}
                            </div>
                            <input type="text" placeholder="Parça Adı (Örn: Michelin Alpin 6)" value={partName} onChange={e => setPartName(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" required />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-500">Takılma KM</label>
                                    <input type="number" value={installKm} onChange={e => setInstallKm(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" required />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Takılma Tarihi</label>
                                    <input type="date" value={installDate} onChange={e => setInstallDate(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" required />
                                </div>
                            </div>
                            <input type="number" placeholder="Beklenen Ömür (KM) - Opsiyonel" value={lifespanKm} onChange={e => setLifespanKm(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
                        </>
                    )}
                    <button type="submit" className="w-full bg-primary-600 text-white font-bold py-2 rounded-lg">Kaydet</button>
                </form>
            )}

            {/* Content List */}
            <div className="space-y-3">
                {subTab === 'scheduled' ? (
                    items.length === 0 ? <p className="text-center text-gray-400 py-4">Kayıt yok.</p> :
                        items.map(item => {
                            const status = calculateStatus(item);
                            const isDate = item.type === 'date';
                            const isBoth = item.type === 'both';
                            return (
                                <div key={item.id} className={`p-4 rounded-xl border ${status.color} bg-white dark:bg-gray-800`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            {status.icon}
                                            <div>
                                                <h4 className="font-bold text-gray-800 dark:text-white">{item.title}</h4>
                                                <div className="text-xs opacity-70">
                                                    {isDate && `Son Tarih: ${new Date(item.dueDate!).toLocaleDateString('tr-TR')}`}
                                                    {item.type === 'km' && `Periyot: ${item.intervalKm} km`}
                                                    {isBoth && (
                                                        <span>
                                                            {item.intervalKm} km / {new Date(item.dueDate!).toLocaleDateString('tr-TR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {(item.type === 'km' || isBoth) && <button onClick={() => { if (confirm('Bakım yapıldı mı?')) onUpdate(item.id, currentOdometer) }} className="px-2 py-1 text-xs bg-white/50 rounded font-bold">Yapıldı</button>}
                                            <button onClick={() => onDelete(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold opacity-80">
                                        <span>{status.text}</span>
                                        <span>{status.remaining}</span>
                                    </div>
                                </div>
                            );
                        })
                ) : (
                    parts.length === 0 ? <p className="text-center text-gray-400 py-4">Parça kaydı yok.</p> :
                        parts.map(part => {
                            const usage = currentOdometer - part.installKm;
                            const lifePercent = part.lifespanKm ? Math.min(100, (usage / part.lifespanKm) * 100) : 0;

                            return (
                                <div key={part.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                                    {part.type === 'tire' && (
                                        <div className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold rounded-bl-lg ${part.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {part.isActive ? 'TAKILI' : 'DEPO'}
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3 relative z-10">
                                        <div className={`p-2 rounded-lg ${part.isActive ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {getPartIcon(part.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 dark:text-white text-sm">{part.name}</h4>
                                            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                                <p>Takılma: {part.installKm.toLocaleString()} km ({new Date(part.installDate).toLocaleDateString('tr-TR')})</p>
                                                <p className="font-bold text-primary-600 dark:text-primary-400">Kullanım: {usage.toLocaleString()} km</p>
                                            </div>

                                            {/* Lifespan Bar */}
                                            {part.lifespanKm && (
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                                        <span>Ömür</span>
                                                        <span>%{lifePercent.toFixed(0)}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${lifePercent > 90 ? 'bg-red-500' : 'bg-primary-500'}`} style={{ width: `${lifePercent}%` }}></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 relative z-10">
                                        {part.type === 'tire' && !part.isActive && (
                                            <button onClick={() => onTogglePart(part.id)} className="text-xs font-bold text-green-600 hover:bg-green-50 px-2 py-1 rounded">
                                                Tak
                                            </button>
                                        )}
                                        {part.type === 'tire' && part.isActive && (
                                            <button onClick={() => onTogglePart(part.id)} className="text-xs font-bold text-amber-600 hover:bg-amber-50 px-2 py-1 rounded">
                                                Sök (Depoya Kaldır)
                                            </button>
                                        )}
                                        <button onClick={() => onDeletePart(part.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    );
};
