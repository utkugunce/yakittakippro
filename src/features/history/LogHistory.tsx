import React, { useState, useMemo } from 'react';
import { DailyLog } from '../../types';
import { Trash2, Fuel, Filter, X, Calendar, Pencil } from 'lucide-react';
import { LogHistoryStatsBar } from '../../components/LogHistoryStatsBar';
import { LogHistoryTips } from '../../components/LogHistoryTips';
import { LogHistoryStreakBadge } from '../../components/LogHistoryStreakBadge';

interface LogHistoryProps {
  logs: DailyLog[];
  onDelete: (id: string) => void;
  onEdit: (log: DailyLog) => void;
}

export const LogHistory: React.FC<LogHistoryProps> = ({ logs, onDelete, onEdit }) => {
  const [minKm, setMinKm] = useState<string>('');
  const [maxKm, setMaxKm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        // KM Filter
        const min = minKm ? parseFloat(minKm) : 0;
        const max = maxKm ? parseFloat(maxKm) : Infinity;
        const kmMatch = log.currentOdometer >= min && log.currentOdometer <= max;

        // Date Filter
        let dateMatch = true;
        if (startDate) {
          dateMatch = dateMatch && new Date(log.date) >= new Date(startDate);
        }
        if (endDate) {
          dateMatch = dateMatch && new Date(log.date) <= new Date(endDate);
        }

        return kmMatch && dateMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
  }, [logs, minKm, maxKm, startDate, endDate]);

  // Calculate streak for badge
  const streak = React.useMemo(() => {
    if (!logs.length) return 0;
    const dates = Array.from(new Set(logs.map(l => l.date))).sort();
    let maxStreak = 0, currentStreak = 0;
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) currentStreak = 1;
      else {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) currentStreak++;
        else currentStreak = 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }
    return maxStreak;
  }, [logs]);
  const clearFilters = () => {
    setMinKm('');
    setMaxKm('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = minKm || maxKm || startDate || endDate;

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700 animate-fadeIn">
        <p className="text-gray-500 dark:text-gray-400">Henüz kayıt bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Gamification/Stats Section */}
      <LogHistoryStatsBar logs={logs} />
      <LogHistoryStreakBadge streak={streak} />
      <LogHistoryTips />
      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-4 text-gray-700 dark:text-gray-300">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-semibold">Filtrele</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-600 underline ml-auto flex items-center"
            >
              <X className="w-3 h-3 mr-1" /> Filtreleri Temizle
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* KM Range */}
          <div className="space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Kilometre Aralığı</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                placeholder="Min KM"
                value={minKm}
                onChange={(e) => setMinKm(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max KM"
                value={maxKm}
                onChange={(e) => setMaxKm(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Tarih Aralığı</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Geçmiş Kayıtlar</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{filteredLogs.length} / {logs.length} kayıt</span>
        </div>
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-3 font-semibold whitespace-nowrap">Tarih</th>
                <th className="p-3 font-semibold text-right whitespace-nowrap">Sayaç</th>
                <th className="p-3 font-semibold text-right whitespace-nowrap">Yapılan</th>
                <th className="p-3 font-semibold text-right whitespace-nowrap">Tüketim</th>
                <th className="p-3 font-semibold text-right whitespace-nowrap">Maliyet</th>
                <th className="p-3 font-semibold text-center whitespace-nowrap">Yakıt</th>
                <th className="p-3 font-semibold text-left">Not</th>
                <th className="p-3 font-semibold text-center whitespace-nowrap">İşlem</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-300">
                    <td className="p-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {new Date(log.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {log.currentOdometer.toLocaleString('tr-TR')}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {log.dailyDistance.toLocaleString('tr-TR')}
                    </td>
                    <td className="p-3 text-right">
                      {log.avgConsumption.toFixed(1)}
                    </td>
                    <td className="p-3 text-right font-bold text-gray-900 dark:text-white">
                      ₺{log.dailyCost.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      {log.isRefuelDay ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          <Fuel className="w-3 h-3 mr-1" />
                          Yakıt
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">-</span>
                      )}
                    </td>
                    <td className="p-3 max-w-[100px] truncate text-gray-500 dark:text-gray-400" title={log.notes}>
                      {log.notes || "-"}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onEdit(log)}
                          className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                          title="Düzenle"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(log.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Bu aralıkta kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};