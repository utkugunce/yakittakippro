import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DailyLog } from '@/types';

interface ComparisonModeProps {
  logs: DailyLog[];
}

type ComparisonPeriod = 'week' | 'month';

export const ComparisonMode: React.FC<ComparisonModeProps> = ({ logs }) => {
  const [period, setPeriod] = useState<ComparisonPeriod>('month');

  const comparison = useMemo(() => {
    const now = new Date();
    let currentStart: Date;
    let previousStart: Date;
    let previousEnd: Date;

    if (period === 'week') {
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 7);
      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousEnd.getDate() - 6);
    } else {
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 30);
      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousEnd.getDate() - 29);
    }

    const currentLogs = logs.filter(l => new Date(l.date) >= currentStart);
    const previousLogs = logs.filter(l => {
      const date = new Date(l.date);
      return date >= previousStart && date <= previousEnd;
    });

    const calculate = (subset: DailyLog[]) => ({
      totalCost: subset.reduce((sum, l) => sum + l.dailyCost, 0),
      totalKm: subset.reduce((sum, l) => sum + l.dailyDistance, 0),
      totalFuel: subset.reduce((sum, l) => sum + l.dailyFuelConsumed, 0),
      avgConsumption: subset.length > 0 
        ? subset.reduce((sum, l) => sum + l.avgConsumption, 0) / subset.length 
        : 0,
      entries: subset.length,
    });

    const current = calculate(currentLogs);
    const previous = calculate(previousLogs);

    const percentChange = (curr: number, prev: number) => 
      prev > 0 ? ((curr - prev) / prev) * 100 : 0;

    return {
      current,
      previous,
      changes: {
        cost: percentChange(current.totalCost, previous.totalCost),
        km: percentChange(current.totalKm, previous.totalKm),
        fuel: percentChange(current.totalFuel, previous.totalFuel),
        consumption: percentChange(current.avgConsumption, previous.avgConsumption),
      }
    };
  }, [logs, period]);

  const getChangeIndicator = (change: number, invertColors = false) => {
    if (Math.abs(change) < 0.5) {
      return { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' };
    }
    const isPositive = change > 0;
    const goodDirection = invertColors ? !isPositive : isPositive;
    
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: goodDirection ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
      bg: goodDirection ? 'bg-red-50 dark:bg-red-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30',
    };
  };

  const metrics = [
    {
      label: 'Harcama',
      current: `₺${comparison.current.totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
      previous: `₺${comparison.previous.totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
      change: comparison.changes.cost,
      invertColors: true, // Lower cost is better
    },
    {
      label: 'Mesafe',
      current: `${comparison.current.totalKm.toLocaleString()} km`,
      previous: `${comparison.previous.totalKm.toLocaleString()} km`,
      change: comparison.changes.km,
      invertColors: false,
    },
    {
      label: 'Yakıt',
      current: `${comparison.current.totalFuel.toFixed(1)} L`,
      previous: `${comparison.previous.totalFuel.toFixed(1)} L`,
      change: comparison.changes.fuel,
      invertColors: true,
    },
    {
      label: 'Ort. Tüketim',
      current: `${comparison.current.avgConsumption.toFixed(1)} L/100km`,
      previous: `${comparison.previous.avgConsumption.toFixed(1)} L/100km`,
      change: comparison.changes.consumption,
      invertColors: true, // Lower consumption is better
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
            <ArrowLeftRight className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Karşılaştırma</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dönemsel performans analizi</p>
          </div>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              period === 'week' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Haftalık
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              period === 'month' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Aylık
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const indicator = getChangeIndicator(metric.change, metric.invertColors);
          const Icon = indicator.icon;
          
          return (
            <div 
              key={metric.label}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              style={{
                animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
              }}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{metric.label}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Önceki</p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{metric.previous}</p>
                </div>
                <div className="px-2">
                  <ArrowLeftRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Şimdi</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{metric.current}</p>
                </div>
              </div>
              
              <div className={`flex items-center justify-center gap-1 p-2 rounded-lg ${indicator.bg}`}>
                <Icon className={`w-4 h-4 ${indicator.color}`} />
                <span className={`text-sm font-semibold ${indicator.color}`}>
                  {Math.abs(metric.change).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
