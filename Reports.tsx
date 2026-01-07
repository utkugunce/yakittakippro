import React, { useMemo } from 'react';
import { DailyLog } from './types';
import { FileText, TrendingUp, TrendingDown, Calendar, Award, BarChart3, Fuel, Route, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ReportsProps {
  logs: DailyLog[];
}

interface StatSummary {
  min: number;
  max: number;
  avg: number;
  minDate: string;
  maxDate: string;
}

const StatCard: React.FC<{ title: string; icon: React.ReactNode; stat: StatSummary; unit: string; decimals?: number }> = ({ title, icon, stat, unit, decimals = 1 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center space-x-2 mb-3">
      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">{icon}</div>
      <h4 className="font-bold text-gray-800 dark:text-white text-sm">{title}</h4>
    </div>
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
        <p className="text-[10px] uppercase text-green-600 dark:text-green-400 font-bold">Min</p>
        <p className="text-lg font-bold text-green-700 dark:text-green-300">{stat.min.toFixed(decimals)}</p>
        <p className="text-[9px] text-green-600 dark:text-green-400">{unit}</p>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
        <p className="text-[10px] uppercase text-blue-600 dark:text-blue-400 font-bold">Ort</p>
        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{stat.avg.toFixed(decimals)}</p>
        <p className="text-[9px] text-blue-600 dark:text-blue-400">{unit}</p>
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
        <p className="text-[10px] uppercase text-red-600 dark:text-red-400 font-bold">Max</p>
        <p className="text-lg font-bold text-red-700 dark:text-red-300">{stat.max.toFixed(decimals)}</p>
        <p className="text-[9px] text-red-600 dark:text-red-400">{unit}</p>
      </div>
    </div>
  </div>
);

export const Reports: React.FC<ReportsProps> = ({ logs }) => {
  const stats = useMemo(() => {
    if (logs.length === 0) return null;

    // Helper to calculate min/max/avg
    const calcStat = (arr: DailyLog[], getter: (l: DailyLog) => number): StatSummary => {
      if (arr.length === 0) return { min: 0, max: 0, avg: 0, minDate: '', maxDate: '' };
      const values = arr.map(getter);
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const avgVal = values.reduce((a, b) => a + b, 0) / values.length;
      const minLog = arr.find(l => getter(l) === minVal);
      const maxLog = arr.find(l => getter(l) === maxVal);
      return {
        min: minVal,
        max: maxVal,
        avg: avgVal,
        minDate: minLog?.date || '',
        maxDate: maxLog?.date || ''
      };
    };

    // Best/Worst Consumption
    const validLogs = logs.filter(l => l.avgConsumption > 0);
    const bestLog = validLogs.length > 0 ? validLogs.reduce((prev, curr) => prev.avgConsumption < curr.avgConsumption ? prev : curr) : null;
    const worstLog = validLogs.length > 0 ? validLogs.reduce((prev, curr) => prev.avgConsumption > curr.avgConsumption ? prev : curr) : null;

    // Detailed Stats
    const dailyDistance = calcStat(logs, l => l.dailyDistance);
    const avgConsumption = calcStat(validLogs, l => l.avgConsumption);
    const dailyFuel = calcStat(logs, l => l.dailyFuelConsumed);
    const fuelPrice = calcStat(logs.filter(l => l.fuelPrice > 0), l => l.fuelPrice);
    const dailyCost = calcStat(logs, l => l.dailyCost);
    const costPerKm = calcStat(logs.filter(l => l.costPerKm > 0), l => l.costPerKm);

    // Monthly Breakdown
    const monthlyGroups = logs.reduce((acc, log) => {
      const date = new Date(log.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[key]) {
        acc[key] = {
          month: key,
          totalDistance: 0,
          totalCost: 0,
          totalFuel: 0,
          logCount: 0
        };
      }
      acc[key].totalDistance += log.dailyDistance;
      acc[key].totalCost += log.dailyCost;
      acc[key].totalFuel += log.dailyFuelConsumed;
      acc[key].logCount += 1;
      return acc;
    }, {} as Record<string, { month: string, totalDistance: number, totalCost: number, totalFuel: number, logCount: number }>);

    type MonthData = { month: string, totalDistance: number, totalCost: number, totalFuel: number, logCount: number };
    const monthlyData = Object.values(monthlyGroups) as MonthData[];
    monthlyData.sort((a, b) => b.month.localeCompare(a.month));

    // Month-over-Month Comparison (Partial / Date-to-Date)
    const now = new Date();
    const currentDay = now.getDate();

    // This Month Ranges
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = now; // Now

    // Last Month Ranges (Date-to-Date)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // Handle edge cases where last month has fewer days (e.g. March 30 -> Feb 28)
    const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    const targetDayInLastMonth = Math.min(currentDay, daysInLastMonth);
    const lastMonthSameDay = new Date(now.getFullYear(), now.getMonth() - 1, targetDayInLastMonth, 23, 59, 59);

    // Filter Helper
    const getLogsInPeriod = (start: Date, end: Date) => {
      return logs.filter(l => {
        const d = new Date(l.date);
        return d >= start && d <= end;
      });
    };

    const thisMonthLogs = getLogsInPeriod(thisMonthStart, thisMonthEnd);
    const lastMonthLogs = getLogsInPeriod(lastMonthStart, lastMonthSameDay);

    const sumStats = (arr: DailyLog[]) => ({
      totalCost: arr.reduce((sum, l) => sum + l.dailyCost, 0),
      totalDistance: arr.reduce((sum, l) => sum + l.dailyDistance, 0),
      totalFuel: arr.reduce((sum, l) => sum + l.dailyFuelConsumed, 0),
      logCount: arr.length
    });

    const thisMonthData = sumStats(thisMonthLogs);
    const lastMonthData = sumStats(lastMonthLogs);

    // Calculate changes
    const comparison = {
      thisMonth: thisMonthData,
      lastMonth: lastMonthData,
      costChange: lastMonthData.totalCost > 0 ? ((thisMonthData.totalCost - lastMonthData.totalCost) / lastMonthData.totalCost) * 100 : 0,
      distanceChange: lastMonthData.totalDistance > 0 ? ((thisMonthData.totalDistance - lastMonthData.totalDistance) / lastMonthData.totalDistance) * 100 : 0,
      fuelChange: lastMonthData.totalFuel > 0 ? ((thisMonthData.totalFuel - lastMonthData.totalFuel) / lastMonthData.totalFuel) * 100 : 0,
      // Store date range info for UI
      lastMonthDate: lastMonthSameDay
    };

    return {
      bestLog,
      worstLog,
      monthlyData,
      dailyDistance,
      avgConsumption,
      dailyFuel,
      fuelPrice,
      dailyCost,
      costPerKm,
      comparison
    };
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Henüz Rapor Yok</h3>
        <p className="text-gray-500 dark:text-gray-400">Raporları görmek için yakıt kaydı eklemeye başlayın.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Best/Worst Cards */}
      {stats?.bestLog && stats?.worstLog && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-5 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-bold text-green-800 dark:text-green-300">En İyi Tüketim</h4>
                <p className="text-xs text-green-600 dark:text-green-400">{stats.bestLog.date}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold text-green-900 dark:text-white">{stats.bestLog.avgConsumption.toFixed(1)}</span>
                <span className="text-sm font-medium text-green-700 dark:text-green-300 ml-1">L/100km</span>
              </div>
              <div className="text-right text-xs font-bold text-green-700 dark:text-green-300">
                {stats.bestLog.dailyDistance} km yol
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
                <p className="text-xs text-red-600 dark:text-red-400">{stats.worstLog.date}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold text-red-900 dark:text-white">{stats.worstLog.avgConsumption.toFixed(1)}</span>
                <span className="text-sm font-medium text-red-700 dark:text-red-300 ml-1">L/100km</span>
              </div>
              <div className="text-right text-xs font-bold text-red-700 dark:text-red-300">
                {stats.worstLog.dailyDistance} km yol
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Month-over-Month Comparison */}
      {stats?.comparison && (stats.comparison.lastMonth.totalCost > 0 || stats.comparison.thisMonth.totalCost > 0) && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 rounded-xl p-5 border border-primary-200 dark:border-primary-800">
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
                ₺{stats.comparison.thisMonth.totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </p>
              <div className={`flex items-center justify-center text-xs font-bold mt-1 ${stats.comparison.costChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.comparison.costChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(stats.comparison.costChange).toFixed(0)}%
              </div>
            </div>

            {/* Distance Comparison */}
            <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl">
              <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">Toplam Mesafe</p>
              <p className="text-lg font-bold text-primary-900 dark:text-white">
                {stats.comparison.thisMonth.totalDistance.toLocaleString('tr-TR')} <span className="text-xs">km</span>
              </p>
              <div className={`flex items-center justify-center text-xs font-bold mt-1 ${stats.comparison.distanceChange > 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                {stats.comparison.distanceChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(stats.comparison.distanceChange).toFixed(0)}%
              </div>
            </div>

            {/* Fuel Comparison */}
            <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl">
              <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">Toplam Yakıt</p>
              <p className="text-lg font-bold text-primary-900 dark:text-white">
                {stats.comparison.thisMonth.totalFuel.toFixed(0)} <span className="text-xs">L</span>
              </p>
              <div className={`flex items-center justify-center text-xs font-bold mt-1 ${stats.comparison.fuelChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.comparison.fuelChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(stats.comparison.fuelChange).toFixed(0)}%
              </div>
            </div>

            {/* Avg Consumption Comparison - DERIVED */}
            {(() => {
              const thisMonthAvg = stats.comparison.thisMonth.totalDistance > 0
                ? (stats.comparison.thisMonth.totalFuel / stats.comparison.thisMonth.totalDistance) * 100
                : 0;
              const lastMonthAvg = stats.comparison.lastMonth.totalDistance > 0
                ? (stats.comparison.lastMonth.totalFuel / stats.comparison.lastMonth.totalDistance) * 100
                : 0;
              const avgChange = lastMonthAvg > 0 ? ((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100 : 0;

              return (
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                  <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">Ort. Tüketim</p>
                  <p className="text-lg font-bold text-primary-900 dark:text-white">
                    {thisMonthAvg.toFixed(1)} <span className="text-xs">L/100</span>
                  </p>
                  <div className={`flex items-center justify-center text-xs font-bold mt-1 ${avgChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {avgChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : (avgChange < 0 ? <ArrowDownRight className="w-3 h-3" /> : <span className="text-gray-400">-</span>)}
                    {Math.abs(avgChange).toFixed(1)}%
                  </div>
                </div>
              );
            })()}

            {/* Cost Per KM Comparison - DERIVED */}
            {(() => {
              const thisMonthCPK = stats.comparison.thisMonth.totalDistance > 0
                ? (stats.comparison.thisMonth.totalCost / stats.comparison.thisMonth.totalDistance)
                : 0;
              const lastMonthCPK = stats.comparison.lastMonth.totalDistance > 0
                ? (stats.comparison.lastMonth.totalCost / stats.comparison.lastMonth.totalDistance)
                : 0;
              const cpkChange = lastMonthCPK > 0 ? ((thisMonthCPK - lastMonthCPK) / lastMonthCPK) * 100 : 0;

              return (
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                  <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">KM Başına</p>
                  <p className="text-lg font-bold text-primary-900 dark:text-white">
                    ₺{thisMonthCPK.toFixed(2)}
                  </p>
                  <div className={`flex items-center justify-center text-xs font-bold mt-1 ${cpkChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {cpkChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : (cpkChange < 0 ? <ArrowDownRight className="w-3 h-3" /> : <span className="text-gray-400">-</span>)}
                    {Math.abs(cpkChange).toFixed(1)}%
                  </div>
                </div>
              );
            })()}

            {/* Fuel Price Avg - DERIVED EST. */}
            {(() => {
              const thisMonthPrice = stats.comparison.thisMonth.totalFuel > 0
                ? (stats.comparison.thisMonth.totalCost / stats.comparison.thisMonth.totalFuel)
                : 0;
              const lastMonthPrice = stats.comparison.lastMonth.totalFuel > 0
                ? (stats.comparison.lastMonth.totalCost / stats.comparison.lastMonth.totalFuel)
                : 0;
              const priceChange = lastMonthPrice > 0 ? ((thisMonthPrice - lastMonthPrice) / lastMonthPrice) * 100 : 0;

              return (
                <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                  <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">Yakıt Fiyatı (Ort)</p>
                  <p className="text-lg font-bold text-primary-900 dark:text-white">
                    ₺{thisMonthPrice.toFixed(2)}
                  </p>
                  <div className={`flex items-center justify-center text-xs font-bold mt-1 ${priceChange > 0 ? 'text-orange-500' : 'text-blue-500'}`}>
                    {priceChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : (priceChange < 0 ? <ArrowDownRight className="w-3 h-3" /> : <span className="text-gray-400">-</span>)}
                    {Math.abs(priceChange).toFixed(1)}%
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 text-xs text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/20 p-3 rounded-lg">
            <div className="flex-1">
              <span className="font-bold text-primary-700 dark:text-primary-300 block mb-1">📊 Analiz:</span>
              {(() => {
                const changes = [];
                const thisMonthAvg = stats.comparison.thisMonth.totalDistance > 0 ? (stats.comparison.thisMonth.totalFuel / stats.comparison.thisMonth.totalDistance) * 100 : 0;
                const lastMonthAvg = stats.comparison.lastMonth.totalDistance > 0 ? (stats.comparison.lastMonth.totalFuel / stats.comparison.lastMonth.totalDistance) * 100 : 0;

                if (thisMonthAvg < lastMonthAvg) changes.push("Sürüş verimliliğiniz artmış, araç daha az yakıyor. 👏");
                else if (thisMonthAvg > lastMonthAvg) changes.push("Yakıt tüketiminiz artmış, agresif sürüş veya trafik etkisi olabilir.");

                const thisMonthPrice = stats.comparison.thisMonth.totalFuel > 0 ? (stats.comparison.thisMonth.totalCost / stats.comparison.thisMonth.totalFuel) : 0;
                const lastMonthPrice = stats.comparison.lastMonth.totalFuel > 0 ? (stats.comparison.lastMonth.totalCost / stats.comparison.lastMonth.totalFuel) : 0;

                if (thisMonthPrice > lastMonthPrice) changes.push("Yakıt fiyatlarındaki artış harcamanızı etkiliyor.");

                if (stats.comparison.distanceChange > 20) changes.push("Bu ay geçen aya göre belirgin şekilde daha çok yol yapmışsınız.");

                return changes.length > 0 ? changes.join(" ") : "Veriler geçen ayla benzer seyrediyor.";
              })()}
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
            stat={stats!.dailyDistance}
            unit="km"
            decimals={1}
          />
          <StatCard
            title="Yakıt Tüketimi (L/100km)"
            icon={<Fuel className="w-4 h-4 text-amber-600" />}
            stat={stats!.avgConsumption}
            unit="L/100km"
            decimals={2}
          />
          <StatCard
            title="Günlük Yakıt"
            icon={<Fuel className="w-4 h-4 text-green-600" />}
            stat={stats!.dailyFuel}
            unit="L"
            decimals={2}
          />
          <StatCard
            title="Benzin Fiyatı"
            icon={<Coins className="w-4 h-4 text-yellow-600" />}
            stat={stats!.fuelPrice}
            unit="₺/L"
            decimals={2}
          />
          <StatCard
            title="Günlük Harcama"
            icon={<Coins className="w-4 h-4 text-red-600" />}
            stat={stats!.dailyCost}
            unit="₺"
            decimals={2}
          />
          <StatCard
            title="Km Başına Maliyet"
            icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
            stat={stats!.costPerKm}
            unit="₺/km"
            decimals={3}
          />
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
            Aylık Özet
          </h3>
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
              {stats?.monthlyData.map((month) => (
                <tr key={month.month} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
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
      </div>
    </div>
  );
};