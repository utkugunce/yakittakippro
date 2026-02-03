import React, { useState } from 'react';
import { FileText, TrendingUp, Calendar, Award, BarChart3, Fuel, Route, Coins, TrendingDown, ArrowUpRight, ArrowDownRight, Download, FileSpreadsheet, Table } from 'lucide-react';

// New Architecture Imports
import { useReportData } from '../reports/hooks/useReportData';
import { generateSalesReport } from './utils/pdfExport';
import { exportToExcel, exportToCSV } from './utils/excelExport';
import { StatCard } from '../reports/components/StatCard';

// Report Components
import {
  DayOfWeekAnalysis,
  SeasonalAnalysis,
  StationPriceComparison,
  AnomalyDetection,
  SpeedEfficiencyAnalysis,
  SavingsInsights,
  YearEndProjection,
  ReportsFilters,
  MonthlyDrilldown,
  ShareableSummary,
  ReportHeader,
  QuickSummaryCards,
  DrivingScore,
  MonthlyGoalProgress,
  ReportTips
} from '../reports';

import { useAppStore } from '../../stores/appStore';

export const Reports: React.FC = () => {
  const { logs, fuelPurchases: purchases, maintenanceItems, vehicleParts } = useAppStore();

  // Use the new hook for all data logic
  const {
    dateRange: datePreset,
    setDateRange: setDatePreset,
    filteredLogs,
    filteredPurchases,
    stats,
    advancedStats,
    rangeLabel
  } = useReportData(logs, purchases);

  // Drilldown state
  const [drilldownMonth, setDrilldownMonth] = useState<string | null>(null);

  if (!advancedStats) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-500">
        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Henüz Rapor Yok</h3>
        <p className="text-gray-500 dark:text-gray-400">Raporları görmek için yakıt kaydı eklemeye başlayın.</p>
      </div>
    );
  }

  const { bestLog, worstLog, monthlyData, comparison } = advancedStats;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Enhanced Header */}
      <ReportHeader
        totalLogs={logs.length}
        totalPurchases={purchases.length}
        dateRange={rangeLabel}
      />

      {/* Date Filters */}
      <ReportsFilters
        selectedPreset={datePreset}
        onPresetChange={setDatePreset}
        // Passing undefined for custom range for now as hook handles standard ranges well
        dateRange={undefined}
      />

      {/* Quick Summary Cards (using filtered data) */}
      <QuickSummaryCards logs={filteredLogs} purchases={filteredPurchases} />

      {/* Driving Score & Monthly Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DrivingScore logs={logs} purchases={purchases} />
        <MonthlyGoalProgress logs={logs} purchases={purchases} />
      </div>

      {/* Report Tips */}
      <ReportTips logs={logs} purchases={purchases} />

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SavingsInsights logs={logs} purchases={purchases} />
        <YearEndProjection logs={logs} purchases={purchases} />
      </div>

      {/* Anomaly Detection */}
      <AnomalyDetection logs={logs} purchases={purchases} />

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DayOfWeekAnalysis logs={filteredLogs} purchases={filteredPurchases} />
        <StationPriceComparison logs={filteredLogs} purchases={filteredPurchases} />
        <SpeedEfficiencyAnalysis logs={filteredLogs} purchases={filteredPurchases} />
      </div>

      {/* Seasonal Analysis */}
      <SeasonalAnalysis logs={logs} purchases={purchases} />

      {/* Best/Worst Cards */}
      {bestLog && worstLog && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-5 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-bold text-green-800 dark:text-green-300">En İyi Tüketim</h4>
                <p className="text-xs text-green-600 dark:text-green-400">{new Date(bestLog.date).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold text-green-900 dark:text-white">{bestLog.avgConsumption.toFixed(1)}</span>
                <span className="text-sm font-medium text-green-700 dark:text-green-300 ml-1">L/100km</span>
              </div>
              <div className="text-right text-xs font-bold text-green-700 dark:text-green-300">
                {bestLog.dailyDistance} km yol
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 p-5 rounded-xl border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-bold text-red-800 dark:text-red-300">En Yüksek Tüketim</h4>
                <p className="text-xs text-red-600 dark:text-red-400">{new Date(worstLog.date).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold text-red-900 dark:text-white">{worstLog.avgConsumption.toFixed(1)}</span>
                <span className="text-sm font-medium text-red-700 dark:text-red-300 ml-1">L/100km</span>
              </div>
              <div className="text-right text-xs font-bold text-red-700 dark:text-red-300">
                {worstLog.dailyDistance} km yol
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Month-over-Month Comparison */}
      {(comparison.thisMonth.totalCost > 0 || comparison.lastMonth.totalCost > 0) && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-primary-200 dark:border-primary-900">
          <h3 className="font-bold text-primary-900 dark:text-primary-300 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            <div>
              Bu Ay vs Geçen Ay <span className="text-xs font-normal opacity-70 ml-1">(İlk {new Date().getDate()} gün)</span>
            </div>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Cost Comparison */}
            <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl">
              <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">Toplam Harcama</p>
              <p className="text-lg font-bold text-primary-900 dark:text-white">
                ₺{comparison.thisMonth.totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </p>
              <div className={`flex items-center justify-center text-xs font-bold mt-1 ${comparison.costChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {comparison.costChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(comparison.costChange).toFixed(0)}%
              </div>
            </div>

            {/* Distance Comparison */}
            <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl">
              <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">Toplam Mesafe</p>
              <p className="text-lg font-bold text-primary-900 dark:text-white">
                {comparison.thisMonth.totalDistance.toLocaleString('tr-TR')} <span className="text-xs">km</span>
              </p>
              <div className={`flex items-center justify-center text-xs font-bold mt-1 ${comparison.distanceChange > 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                {comparison.distanceChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(comparison.distanceChange).toFixed(0)}%
              </div>
            </div>

            {/* Fuel Comparison */}
            <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl">
              <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">Toplam Yakıt</p>
              <p className="text-lg font-bold text-primary-900 dark:text-white">
                {comparison.thisMonth.totalFuel.toFixed(0)} <span className="text-xs">L</span>
              </p>
              <div className={`flex items-center justify-center text-xs font-bold mt-1 ${comparison.fuelChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {comparison.fuelChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(comparison.fuelChange).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Statistics */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
          Detaylı İstatistikler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Günlük Mesafe"
            icon={<Route className="w-4 h-4 text-blue-600" />}
            stat={advancedStats.dailyDistance}
            unit="km"
            decimals={1}
          />
          <StatCard
            title="Yakıt Tüketimi (L/100km)"
            icon={<Fuel className="w-4 h-4 text-amber-600" />}
            stat={advancedStats.avgConsumptionStat}
            unit="L/100km"
            decimals={2}
          />
          <StatCard
            title="Günlük Yakıt"
            icon={<Fuel className="w-4 h-4 text-green-600" />}
            stat={advancedStats.dailyFuel}
            unit="L"
            decimals={2}
          />
          <StatCard
            title="Benzin Fiyatı"
            icon={<Coins className="w-4 h-4 text-yellow-600" />}
            stat={advancedStats.fuelPrice}
            unit="₺/L"
            decimals={2}
          />
          <StatCard
            title="Günlük Harcama"
            icon={<Coins className="w-4 h-4 text-red-600" />}
            stat={advancedStats.dailyCost}
            unit="₺"
            decimals={2}
          />
          <StatCard
            title="Km Başına Maliyet"
            icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
            stat={advancedStats.costPerKm}
            unit="₺/km"
            decimals={3}
          />
        </div>
      </div>

      {/* Monthly Breakdown & Exports */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
            Aylık Özet
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => exportToExcel({ logs: filteredLogs, purchases: filteredPurchases })}
              className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => exportToCSV({ logs: filteredLogs, purchases: filteredPurchases })}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              <Table className="w-3 h-3" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => generateSalesReport({ logs: filteredLogs, purchases: filteredPurchases })}
              className="flex items-center space-x-1.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              <Download className="w-3 h-3" />
              <span>PDF Rapor</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3">Ay</th>
                <th className="px-4 py-3 text-right">Mesafe</th>
                <th className="px-4 py-3 text-right">Yakıt</th>
                <th className="px-4 py-3 text-right">Harcama</th>
                <th className="px-4 py-3 text-right">Ort. Tüketim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {monthlyData.map((month) => (
                <tr
                  key={month.month}
                  onClick={() => setDrilldownMonth(month.month)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  title="Detayları görmek için tıklayın"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {new Date(month.month + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {month.totalDistance.toLocaleString()} km
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {month.totalFuel.toFixed(1)} L
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-white">
                    ₺{month.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${(month.totalFuel / month.totalDistance * 100) < 6.0
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : (month.totalFuel / month.totalDistance * 100) < 8.0
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                      {(month.totalFuel / month.totalDistance * 100).toFixed(1)} L
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-4 pb-3 text-xs text-gray-400 dark:text-gray-500 text-center">Detay için aya tıklayın</p>
      </div>

      {/* Shareable Summary */}
      <ShareableSummary logs={logs} purchases={purchases} />

      {/* Monthly Drilldown Modal */}
      {drilldownMonth && (
        <MonthlyDrilldown
          isOpen={!!drilldownMonth}
          onClose={() => setDrilldownMonth(null)}
          monthKey={drilldownMonth}
          logs={logs}
          purchases={purchases}
        />
      )}
    </div>
  );
};