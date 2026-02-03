import React, { useState, useMemo } from 'react';
import { DailyLog } from '../../types';
import { LogHistoryStatsBar } from '../../components/LogHistoryStatsBar';
import { LogHistoryTips } from '../../components/LogHistoryTips';
import { LogHistoryStreakBadge } from '../../components/LogHistoryStreakBadge';
import { LogCard } from './components/LogCard';
import { HistoryFilters } from './components/HistoryFilters';
import { FileText } from 'lucide-react';

interface LogHistoryProps {
  logs: DailyLog[];
  onDelete: (id: string) => void;
  onEdit: (log: DailyLog) => void;
}

export const LogHistory: React.FC<LogHistoryProps> = ({ logs, onDelete, onEdit }) => {
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        const date = new Date(log.date);
        const matchYear = yearFilter === 'all' || date.getFullYear().toString() === yearFilter;
        const matchMonth = monthFilter === 'all' || date.getMonth().toString() === monthFilter;
        const matchSearch = searchTerm === '' ||
          (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (log.fuelStation && log.fuelStation.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchYear && matchMonth && matchSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [logs, yearFilter, monthFilter, searchTerm, sortOrder]);

  const clearFilters = () => {
    setYearFilter('all');
    setMonthFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = yearFilter !== 'all' || monthFilter !== 'all' || searchTerm !== '';

  return (
    <div className="space-y-6">
      {/* Stats & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <LogHistoryStatsBar logs={logs} />
          <div className="mt-4">
            <LogHistoryStreakBadge logs={logs} />
          </div>
        </div>
        <div>
          <LogHistoryTips />
        </div>
      </div>

      {/* Filters */}
      <HistoryFilters
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        currentFilters={{ year: yearFilter !== 'all', month: monthFilter !== 'all' }}
        onClear={clearFilters}
      />

      {/* Log List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Kayıt Bulunamadı</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {hasActiveFilters
                ? 'Seçilen filtrelere uygun kayıt bulunmuyor.'
                : 'Henüz hiç sürüş kaydı eklenmemiş.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLogs.map(log => (
              <LogCard
                key={log.id}
                log={log}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};