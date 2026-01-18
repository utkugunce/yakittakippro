import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export type DateRangePreset = 'week' | 'month' | '3months' | 'year' | 'all' | 'custom';

interface DateRange {
    start: Date;
    end: Date;
}

interface ReportsFiltersProps {
    selectedPreset: DateRangePreset;
    onPresetChange: (preset: DateRangePreset) => void;
    dateRange: DateRange | null;
    onDateRangeChange?: (range: DateRange) => void;
}

export const ReportsFilters: React.FC<ReportsFiltersProps> = ({
    selectedPreset,
    onPresetChange,
    dateRange
}) => {
    const presets: Array<{ key: DateRangePreset; label: string }> = [
        { key: 'week', label: 'Bu Hafta' },
        { key: 'month', label: 'Bu Ay' },
        { key: '3months', label: 'Son 3 Ay' },
        { key: 'year', label: 'Bu Yıl' },
        { key: 'all', label: 'Tümü' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dönem:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                        <button
                            key={preset.key}
                            onClick={() => onPresetChange(preset.key)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${selectedPreset === preset.key
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {dateRange && selectedPreset !== 'all' && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        {dateRange.start.toLocaleDateString('tr-TR')} - {dateRange.end.toLocaleDateString('tr-TR')}
                    </p>
                </div>
            )}
        </div>
    );
};

// Helper to calculate date range from preset
export const getDateRangeFromPreset = (preset: DateRangePreset): { start: Date; end: Date } | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (preset) {
        case 'week': {
            const dayOfWeek = now.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() + mondayOffset);
            weekStart.setHours(0, 0, 0, 0);
            return { start: weekStart, end: today };
        }
        case 'month': {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            return { start: monthStart, end: today };
        }
        case '3months': {
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0);
            return { start: threeMonthsAgo, end: today };
        }
        case 'year': {
            const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
            return { start: yearStart, end: today };
        }
        case 'all':
        default:
            return null;
    }
};
