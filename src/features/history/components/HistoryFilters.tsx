import React from 'react';
import { Filter, X, Calendar } from 'lucide-react';

interface HistoryFiltersProps {
    yearFilter: string;
    setYearFilter: (year: string) => void;
    monthFilter: string;
    setMonthFilter: (month: string) => void;
    sortOrder: 'desc' | 'asc';
    setSortOrder: (order: 'desc' | 'asc') => void;
    currentFilters: { year: boolean; month: boolean };
    onClear: () => void;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
    yearFilter, setYearFilter,
    monthFilter, setMonthFilter,
    sortOrder, setSortOrder,
    currentFilters, onClear
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                        <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>

                    {/* Year Filter */}
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 min-w-[100px] transition-colors"
                    >
                        <option value="all">Tüm Yıllar</option>
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                    </select>

                    {/* Month Filter */}
                    <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 min-w-[120px] transition-colors"
                    >
                        <option value="all">Tüm Aylar</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i.toString()}>
                                {new Date(0, i).toLocaleDateString('tr-TR', { month: 'long' })}
                            </option>
                        ))}
                    </select>

                    {/* Sort Order */}
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 min-w-[120px] transition-colors"
                    >
                        <option value="desc">Yeniden Eskiye</option>
                        <option value="asc">Eskiden Yeniye</option>
                    </select>
                </div>

                {/* Clear Filters Button */}
                {(currentFilters.year || currentFilters.month) && (
                    <button
                        onClick={onClear}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl transition-colors w-full sm:w-auto justify-center"
                    >
                        <X className="w-4 h-4" />
                        Filtreleri Temizle
                    </button>
                )}
            </div>
        </div>
    );
};
