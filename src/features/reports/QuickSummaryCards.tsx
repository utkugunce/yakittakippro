import React, { useMemo } from 'react';
import { Wallet, Car, Fuel, Zap, TrendingUp, TrendingDown, Gauge } from 'lucide-react';
import { DailyLog, FuelPurchase } from '@/types';

interface QuickSummaryCardsProps {
  logs: DailyLog[];
  purchases: FuelPurchase[];
}

export const QuickSummaryCards: React.FC<QuickSummaryCardsProps> = ({ logs, purchases }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthLogs = logs.filter(l => new Date(l.date) >= thisMonth);
    const lastMonthLogs = logs.filter(l => {
      const d = new Date(l.date);
      return d >= lastMonth && d <= lastMonthEnd;
    });

    const thisMonthPurchases = purchases.filter(p => new Date(p.date) >= thisMonth);
    const lastMonthPurchases = purchases.filter(p => {
      const d = new Date(p.date);
      return d >= lastMonth && d <= lastMonthEnd;
    });

    const totalCost = thisMonthLogs.reduce((s, l) => s + l.dailyCost, 0) +
      thisMonthPurchases.reduce((s, p) => s + p.totalAmount, 0);
    const lastTotalCost = lastMonthLogs.reduce((s, l) => s + l.dailyCost, 0) +
      lastMonthPurchases.reduce((s, p) => s + p.totalAmount, 0);

    const totalKm = thisMonthLogs.reduce((s, l) => s + l.dailyDistance, 0);
    const lastTotalKm = lastMonthLogs.reduce((s, l) => s + l.dailyDistance, 0);

    const totalFuel = thisMonthLogs.reduce((s, l) => s + l.dailyFuelConsumed, 0) +
      thisMonthPurchases.reduce((s, p) => s + p.liters, 0);
    const lastTotalFuel = lastMonthLogs.reduce((s, l) => s + l.dailyFuelConsumed, 0) +
      lastMonthPurchases.reduce((s, p) => s + p.liters, 0);

    const avgConsumption = totalKm > 0 ? (totalFuel / totalKm) * 100 : 0;
    const lastAvgConsumption = lastTotalKm > 0 ? (lastTotalFuel / lastTotalKm) * 100 : 0;

    // Average Speed Calculation
    const thisMonthSpeedLogs = thisMonthLogs.filter(l => l.avgSpeed && l.avgSpeed > 0);
    const thisMonthAvgSpeed = thisMonthSpeedLogs.length > 0
      ? thisMonthSpeedLogs.reduce((s, l) => s + (l.avgSpeed || 0), 0) / thisMonthSpeedLogs.length
      : 0;

    const lastMonthSpeedLogs = lastMonthLogs.filter(l => l.avgSpeed && l.avgSpeed > 0);
    const lastMonthAvgSpeed = lastMonthSpeedLogs.length > 0
      ? lastMonthSpeedLogs.reduce((s, l) => s + (l.avgSpeed || 0), 0) / lastMonthSpeedLogs.length
      : 0;

    const getChange = (curr: number, prev: number) =>
      prev > 0 ? ((curr - prev) / prev) * 100 : 0;

    return {
      cost: { value: totalCost, change: getChange(totalCost, lastTotalCost) },
      km: { value: totalKm, change: getChange(totalKm, lastTotalKm) },
      fuel: { value: totalFuel, change: getChange(totalFuel, lastTotalFuel) },
      consumption: { value: avgConsumption, change: getChange(avgConsumption, lastAvgConsumption) },
      speed: { value: thisMonthAvgSpeed, change: getChange(thisMonthAvgSpeed, lastMonthAvgSpeed) },
    };
  }, [logs, purchases]);

  const cards = [
    {
      icon: Wallet,
      label: 'Bu Ay Harcama',
      value: `₺${stats.cost.value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
      change: stats.cost.change,
      invertChange: true,
      gradient: 'from-rose-500 to-pink-600',
      iconBg: 'bg-rose-400/20',
    },
    {
      icon: Car,
      label: 'Bu Ay Mesafe',
      value: `${stats.km.value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} km`,
      change: stats.km.change,
      invertChange: false,
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-400/20',
    },
    {
      icon: Fuel,
      label: 'Bu Ay Yakıt',
      value: `${stats.fuel.value.toFixed(1)} L`,
      change: stats.fuel.change,
      invertChange: true,
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-400/20',
    },
    {
      icon: Zap,
      label: 'Ort. Tüketim',
      value: `${stats.consumption.value.toFixed(1)} L/100`,
      change: stats.consumption.change,
      invertChange: true,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-400/20',
    },
    {
      icon: Gauge,
      label: 'Ort. Hız',
      value: `${stats.speed.value.toFixed(0)} km/h`,
      change: stats.speed.change,
      invertChange: false,
      gradient: 'from-violet-500 to-purple-600',
      iconBg: 'bg-violet-400/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((card, index) => {
        const isGood = card.invertChange ? card.change < 0 : card.change > 0;

        return (

          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-4 text-white shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-slide-up delay-[${Math.round(index * 100)}ms]`}
          >
            {/* Background decoration */}
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-4 h-14 w-14 rounded-full bg-white/5" />

            <div className="relative">
              <div className={`inline-flex p-2 rounded-xl ${card.iconBg} mb-2`}>
                <card.icon className="w-4 h-4" />
              </div>

              <p className="text-[10px] uppercase tracking-wide text-white/70 mb-0.5">{card.label}</p>
              <p className="text-lg font-bold">{card.value}</p>

              {Math.abs(card.change) > 0.5 && (
                <div className="flex items-center mt-1.5 text-[10px]">
                  {isGood ? (
                    <TrendingDown className="w-3 h-3 mr-0.5 text-emerald-200" />
                  ) : (
                    <TrendingUp className="w-3 h-3 mr-0.5 text-rose-200" />
                  )}
                  <span className={isGood ? 'text-emerald-200' : 'text-rose-200'}>
                    {Math.abs(card.change).toFixed(0)}%
                  </span>
                  <span className="text-white/50 ml-1">vs geçen ay</span>
                </div>
              )}
            </div>
          </div>
        );
      })}


    </div>
  );
};
