import React, { useState } from 'react';
import { LogHistory } from './LogHistory';
import { History, Fuel } from 'lucide-react';
import { FuelPurchaseHistory } from '../fuel/components/FuelPurchaseHistory';
import { useAppStore } from '../../stores/appStore';

export const HistoryPage: React.FC = () => {
    const {
        logs, fuelPurchases,
        deleteLog, deleteFuelPurchase, openModal
    } = useAppStore();

    const [historySubTab, setHistorySubTab] = useState<'logs' | 'fuel'>('logs');

    return (
        <div className="animate-in fade-in duration-500 space-y-4">
            {/* History Sub-Tab Switcher */}
            <div className="flex justify-center">
                <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                    <button
                        onClick={() => setHistorySubTab('logs')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center space-x-2 ${historySubTab === 'logs'
                            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <History className="w-4 h-4" />
                        <span>Günlük Kayıtlar</span>
                        <span className="bg-gray-200 dark:bg-gray-600 text-xs px-1.5 py-0.5 rounded-full">{logs.length}</span>
                    </button>
                    <button
                        onClick={() => setHistorySubTab('fuel')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center space-x-2 ${historySubTab === 'fuel'
                            ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Fuel className="w-4 h-4" />
                        <span>Yakıt Alımları</span>
                        <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs px-1.5 py-0.5 rounded-full">{fuelPurchases.length}</span>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {historySubTab === 'logs' && (
                <LogHistory
                    logs={logs}
                    onDelete={deleteLog}
                    onEdit={(log) => openModal('entry', log)}
                />
            )}
            {historySubTab === 'fuel' && (
                <FuelPurchaseHistory
                    purchases={fuelPurchases}
                    onDelete={deleteFuelPurchase}
                    onEdit={(purchase) => openModal('fuel', purchase)}
                />
            )}
        </div>
    );
};
