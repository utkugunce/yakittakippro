import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { DailyLog } from './types';

interface ChartsProps {
  logs: DailyLog[];
}

export const Charts: React.FC<ChartsProps> = ({ logs }) => {
  const [visibleSeries, setVisibleSeries] = useState({
    daily: true,
    weekly: true,
    price: false
  });

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (logs.length < 2) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px] transition-colors">
        <div className="bg-primary-50 dark:bg-gray-800 p-4 rounded-full mb-4">
          <Activity className="w-8 h-8 text-primary-400 dark:text-primary-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Yetersiz Veri</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Grafiklerin oluşturulması için en az 2 gün veri girişi yapmanız gerekmektedir.
        </p>
      </div>
    );
  }

  // Sort by date and take last 15 days chronologically
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Oldest first

  const data = sortedLogs.map((log, index, array) => {
    // Calculate simple moving average for last 7 entries including current
    const startIdx = Math.max(0, index - 6);
    const subset = array.slice(startIdx, index + 1);
    const sum = subset.reduce((acc, curr) => acc + curr.avgConsumption, 0);
    const movingAvg = sum / subset.length;

    return {
      name: new Date(log.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
      maliyet: log.dailyCost,
      tuketim: log.dailyFuelConsumed,
      ortalamaTuketim: log.avgConsumption,
      haftalikOrtalama: movingAvg,
      benzinFiyati: log.fuelPrice,
      kmMaliyeti: log.costPerKm
    };
  }).slice(-15); // Show last 15 days (most recent)

  // Calculate monthly data for trend chart
  const monthlyData = useMemo(() => {
    const monthlyGroups: Record<string, { month: string; monthLabel: string; totalCost: number; totalDistance: number; totalFuel: number; avgConsumption: number; count: number }> = {};

    logs.forEach(log => {
      const date = new Date(log.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });

      if (!monthlyGroups[key]) {
        monthlyGroups[key] = { month: key, monthLabel, totalCost: 0, totalDistance: 0, totalFuel: 0, avgConsumption: 0, count: 0 };
      }
      monthlyGroups[key].totalCost += log.dailyCost;
      monthlyGroups[key].totalDistance += log.dailyDistance;
      monthlyGroups[key].totalFuel += log.dailyFuelConsumed;
      monthlyGroups[key].avgConsumption += log.avgConsumption;
      monthlyGroups[key].count += 1;
    });

    return Object.values(monthlyGroups)
      .map(m => ({
        name: m.monthLabel,
        maliyet: Math.round(m.totalCost),
        mesafe: Math.round(m.totalDistance),
        yakit: Math.round(m.totalFuel * 10) / 10,
        ortTuketim: m.count > 0 ? Math.round((m.avgConsumption / m.count) * 10) / 10 : 0
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-6); // Last 6 months
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Cost Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Son 15 Günlük Maliyet (TL)</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMaliyet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                formatter={(value: number) => [
                  value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
                  'Günlük Maliyet'
                ]}
              />
              <Area
                type="monotone"
                dataKey="maliyet"
                stroke="var(--primary-500)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMaliyet)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consumption Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Tüketim Trendi & Fiyat</h3>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => toggleSeries('daily')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all ${visibleSeries.daily ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'}`}
            >
              {visibleSeries.daily ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>Günlük</span>
            </button>
            <button
              onClick={() => toggleSeries('weekly')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all ${visibleSeries.weekly ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'}`}
            >
              {visibleSeries.weekly ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>Haftalık Ort.</span>
            </button>
            <button
              onClick={() => toggleSeries('price')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all ${visibleSeries.price ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'}`}
            >
              {visibleSeries.price ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>Benzin Fiyatı</span>
            </button>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8b5cf6', fontSize: 12 }}
                domain={['auto', 'auto']}
                unit=" L"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#f59e0b', fontSize: 12 }}
                domain={['auto', 'auto']}
                unit=" ₺"
                hide={!visibleSeries.price}
              />
              <Tooltip
                cursor={{ stroke: '#6b7280', strokeWidth: 1 }}
                contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                formatter={(value: number, name: string) => {
                  if (name.includes('Fiyat') || name.includes('TL')) {
                    return [value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }), name];
                  }
                  return [`${value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L`, name];
                }}
              />

              {visibleSeries.daily && (
                <Line
                  yAxisId="left"
                  name="Günlük (L)"
                  type="monotone"
                  dataKey="ortalamaTuketim"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              )}

              {visibleSeries.weekly && (
                <Line
                  yAxisId="left"
                  name="Haftalık Ort. (L)"
                  type="monotone"
                  dataKey="haftalikOrtalama"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}

              {visibleSeries.price && (
                <Line
                  yAxisId="right"
                  name="Benzin Fiyatı (TL)"
                  type="monotone"
                  dataKey="benzinFiyati"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#f59e0b", strokeWidth: 1, stroke: "#fff" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      {monthlyData.length >= 2 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-primary-50 dark:bg-gray-700 rounded-lg">
              <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Aylık Trend (Son 6 Ay)</h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--primary-500)', fontSize: 11 }}
                  tickFormatter={(v) => `₺${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#10b981', fontSize: 11 }}
                  tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v} km`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Maliyet') return [`₺${value.toLocaleString('tr-TR')}`, name];
                    if (name === 'Mesafe') return [`${value.toLocaleString('tr-TR')} km`, name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="maliyet" name="Maliyet" fill="var(--primary-500)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="mesafe" name="Mesafe" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};