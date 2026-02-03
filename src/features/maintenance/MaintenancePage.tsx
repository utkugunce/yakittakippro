import React, { useState } from 'react';
import { Plus, Wrench, Package2, Sparkles } from 'lucide-react';
import { MaintenanceHeaderGradient } from './components/MaintenanceHeaderGradient';
import { MaintenanceStatsBar } from './components/MaintenanceStatsBar';
import { MaintenanceTips } from './components/MaintenanceTips';
import { MaintenanceCard } from './components/MaintenanceCard';
import { PartCard } from './components/PartCard';
import { AddMaintenanceModal } from './AddMaintenanceModal';
import { useAppStore } from '../../stores/appStore';

export const Maintenance: React.FC = () => {
    const {
        maintenanceItems: items,
        vehicleParts: parts,
        logs,
        deleteMaintenance: onDelete,
        updateMaintenance: onUpdate,
        deletePart: onDeletePart,
        togglePart: onTogglePart
    } = useAppStore();

    const currentOdometer = logs.length > 0 ? Math.max(...logs.map(l => l.currentOdometer)) : 0;

    const [subTab, setSubTab] = useState<'scheduled' | 'parts'>('scheduled');
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Gradient Header */}
            <MaintenanceHeaderGradient />

            {/* Stats Bar */}
            <MaintenanceStatsBar items={items} parts={parts} currentOdometer={currentOdometer} />

            {/* Tips */}
            <MaintenanceTips />

            {/* Tab Selector */}
            <div className="flex p-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-2xl">
                <button
                    onClick={() => setSubTab('scheduled')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${subTab === 'scheduled'
                            ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <Wrench className="w-4 h-4" />
                    Periyodik Bakım
                </button>
                <button
                    onClick={() => setSubTab('parts')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${subTab === 'parts'
                            ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-300 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <Package2 className="w-4 h-4" />
                    Parça & Lastik
                </button>
            </div>

            {/* Add Button */}
            <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 hover:border-primary-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 font-bold transition-all flex items-center justify-center group active:scale-[0.98]"
            >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                    <Plus className="w-5 h-5 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                </div>
                {subTab === 'scheduled' ? 'Yeni Hatırlatıcı Ekle' : 'Yeni Parça Ekle'}
            </button>

            {/* Modal */}
            <AddMaintenanceModal
                isOpen={showAddForm}
                onClose={() => setShowAddForm(false)}
                activeTab={subTab}
                currentOdometer={currentOdometer}
            />

            {/* Content List */}
            <div className="space-y-4">
                {subTab === 'scheduled' ? (
                    items.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Henüz bakım kaydı yok</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Yukarıdaki butona tıklayarak ekleyin</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <MaintenanceCard
                                key={item.id}
                                item={item}
                                currentOdometer={currentOdometer}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                            />
                        ))
                    )
                ) : (
                    parts.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <Package2 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Henüz parça kaydı yok</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Lastik, akü ve diğer parçalarınızı takip edin</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {parts.map(part => (
                                <PartCard
                                    key={part.id}
                                    part={part}
                                    currentOdometer={currentOdometer}
                                    onToggle={onTogglePart}
                                    onDelete={onDeletePart}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};
