import React from 'react';
import { DailyLog } from '@/types';
import { FuelPurchase } from '@/FuelPurchaseForm';
import { Charts } from '@/Charts'; // Re-use existing Charts component
import { BarChart3 } from 'lucide-react';

interface ChartsPageProps {
    logs: DailyLog[];
    purchases: FuelPurchase[];
    yearFilter: '2026' | '2025' | 'all';
}

export const ChartsPage: React.FC<ChartsPageProps> = ({ logs, purchases, yearFilter }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Detaylı Grafikler</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {yearFilter === 'all' ? 'Tüm zamanların' : `${yearFilter} yılı`} harcama ve tüketim analizleri
                        </p>
                    </div>
                </div>
            </div>

            <Charts
                logs={yearFilter === 'all' ? logs : logs.filter(l => new Date(l.date).getFullYear().toString() === yearFilter)}
                purchases={purchases}
            />
        </div>
    );
};
