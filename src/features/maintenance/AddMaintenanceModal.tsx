import React, { useState, useEffect } from 'react';
import { MaintenanceItem, VehiclePart, PartType } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Calendar, GaugeCircle, Wrench, Package, Info } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

interface AddMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: 'scheduled' | 'parts';
    currentOdometer: number;
}

export const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({ isOpen, onClose, activeTab, currentOdometer }) => {
    const { addMaintenance, addPart } = useAppStore();

    // --- Scheduled Maintenance Form State ---
    const [title, setTitle] = useState('');
    const [maintenanceType, setMaintenanceType] = useState<'km' | 'date' | 'both'>('km');
    const [intervalKm, setIntervalKm] = useState('');
    const [lastKm, setLastKm] = useState(currentOdometer.toString());
    const [dueDate, setDueDate] = useState('');

    // --- Part Form State ---
    const [partType, setPartType] = useState<PartType>('tire');
    const [partName, setPartName] = useState('');
    const [installKm, setInstallKm] = useState(currentOdometer.toString());
    const [installDate, setInstallDate] = useState(new Date().toISOString().split('T')[0]);
    const [lifespanKm, setLifespanKm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLastKm(currentOdometer.toString());
            setInstallKm(currentOdometer.toString());
        }
    }, [isOpen, currentOdometer]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'scheduled') {
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

            addMaintenance(newItem);
        } else {
            if (!partName || !installKm) return;

            const newPart: VehiclePart = {
                id: crypto.randomUUID(),
                type: partType,
                name: partName,
                installDate,
                installKm: parseInt(installKm),
                lifespanKm: lifespanKm ? parseInt(lifespanKm) : undefined,
                isActive: partType === 'tire' ? true : true,
                notes: ''
            };
            addPart(newPart);
        }

        // Reset and close
        setTitle('');
        setIntervalKm('');
        setPartName('');
        setLifespanKm('');
        onClose();
    };

    const suggestions = ['Periyodik Bakım', 'Muayene', 'Kasko', 'Trafik Sigortası'];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={activeTab === 'scheduled' ? 'Yeni Bakım Hatırlatıcısı' : 'Yeni Parça Ekle'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'scheduled' ? (
                    <>
                        {/* Type Selector */}
                        <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setMaintenanceType('km')}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${maintenanceType === 'km' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                KM Bazlı
                            </button>
                            <button
                                type="button"
                                onClick={() => setMaintenanceType('date')}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${maintenanceType === 'date' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Tarih Bazlı
                            </button>
                            <button
                                type="button"
                                onClick={() => setMaintenanceType('both')}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${maintenanceType === 'both' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Her İkisi
                            </button>
                        </div>

                        {/* Suggestions */}
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                        setTitle(s);
                                        if (s === 'Kasko' || s === 'Trafik Sigortası' || s === 'Muayene') {
                                            setMaintenanceType('date');
                                        }
                                    }}
                                    className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-300 transition-colors border border-gray-100 dark:border-gray-600"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <Input
                            label="Bakım Adı"
                            placeholder="Örn: Yağ Değişimi"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            icon={Wrench}
                        />

                        {(maintenanceType === 'km' || maintenanceType === 'both') && (
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Periyot (KM)"
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="10000"
                                    value={intervalKm}
                                    onChange={(e) => setIntervalKm(e.target.value)}
                                    required
                                    icon={GaugeCircle}
                                />
                                <Input
                                    label="Son Yapılan KM"
                                    type="number"
                                    inputMode="numeric"
                                    value={lastKm}
                                    onChange={(e) => setLastKm(e.target.value)}
                                    required
                                    icon={GaugeCircle}
                                />
                            </div>
                        )}

                        {(maintenanceType === 'date' || maintenanceType === 'both') && (
                            <Input
                                label="Bitiş Tarihi"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required
                                icon={Calendar}
                            />
                        )}
                    </>
                ) : (
                    <>
                        {/* Part Type Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Parça Türü</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {(['tire', 'battery', 'pad', 'wiper', 'other'] as const).map(t => (
                                    <button
                                        key={t} type="button"
                                        onClick={() => setPartType(t)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${partType === t
                                                ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'
                                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        {t === 'tire' ? 'Lastik' : t === 'battery' ? 'Akü' : t === 'pad' ? 'Balata' : t === 'wiper' ? 'Silecek' : 'Diğer'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input
                            label="Parça Adı"
                            placeholder="Örn: Michelin Alpin 6"
                            value={partName}
                            onChange={(e) => setPartName(e.target.value)}
                            required
                            icon={Package}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Takılma KM"
                                type="number"
                                inputMode="numeric"
                                value={installKm}
                                onChange={(e) => setInstallKm(e.target.value)}
                                required
                                icon={GaugeCircle}
                            />
                            <Input
                                label="Takılma Tarihi"
                                type="date"
                                value={installDate}
                                onChange={(e) => setInstallDate(e.target.value)}
                                required
                                icon={Calendar}
                            />
                        </div>

                        <Input
                            label="Beklenen Ömür (KM - Opsiyonel)"
                            type="number"
                            inputMode="numeric"
                            placeholder="Örn: 50000"
                            value={lifespanKm}
                            onChange={(e) => setLifespanKm(e.target.value)}
                            icon={Info}
                        />
                    </>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95"
                    >
                        Kaydet
                    </button>
                </div>
            </form>
        </Modal>
    );
};
