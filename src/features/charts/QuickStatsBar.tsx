import React from 'react';
import { TrendingUp, TrendingDown, Fuel, Car, Wallet, Zap } from 'lucide-react';
import { DailyLog, FuelPurchase } from '@/types';

interface QuickStatsBarProps {
  logs: DailyLog[];
  purchases: FuelPurchase[];
}

export const QuickStatsBar: React.FC<QuickStatsBarProps> = ({ logs, purchases }) => {
  // Calculate stats
  const last30Days = logs.filter(l => {
    const logDate = new Date(l.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return logDate >= thirtyDaysAgo;
  });

  const totalCost = last30Days.reduce((sum, l) => sum + l.dailyCost, 0);
  const totalKm = last30Days.reduce((sum, l) => sum + l.dailyDistance, 0);
  const totalFuel = last30Days.reduce((sum, l) => sum + l.dailyFuelConsumed, 0);
  const avgConsumption = totalKm > 0 ? (totalFuel / totalKm) * 100 : 0;

  // Previous 30 days for comparison
  const prev30Days = logs.filter(l => {
    const logDate = new Date(l.date);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return logDate >= sixtyDaysAgo && logDate < thirtyDaysAgo;
  });

  const prevTotalCost = prev30Days.reduce((sum, l) => sum + l.dailyCost, 0);
  const prevAvgConsumption = prev30Days.length > 0 
    ? (prev30Days.reduce((sum, l) => sum + l.dailyFuelConsumed, 0) / prev30Days.reduce((sum, l) => sum + l.dailyDistance, 0)) * 100 
    : 0;

  const costChange = prevTotalCost > 0 ? ((totalCost - prevTotalCost) / prevTotalCost) * 100 : 0;
  const consumptionChange = prevAvgConsumption > 0 ? ((avgConsumption - prevAvgConsumption) / prevAvgConsumption) * 100 : 0;

  const stats = [
    {
      icon: Wallet,
      label: 'Toplam Harcama',
      value: `₺${totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
      change: costChange,
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-400/20',
    },
    {
      icon: Car,
      label: 'Toplam Mesafe',
      value: `${totalKm.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} km`,
      change: null,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-400/20',
    },
    {
      icon: Fuel,
      label: 'Toplam Yakıt',
      value: `${totalFuel.toFixed(1)} L`,
      change: null,
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-400/20',
    },
    {
      icon: Zap,
      label: 'Ort. Tüketim',
      value: `${avgConsumption.toFixed(1)} L/100km`,
      change: consumptionChange,
      invertChange: true, // Lower is better
      gradient: 'from-purple-500 to-violet-600',
      iconBg: 'bg-purple-400/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-4 text-white shadow-lg`}
          style={{
            animation: `slideUp 0.5s ease-out ${index * 0.1}s both`,
          }}
        >
          {/* Background decoration */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-6 h-16 w-16 rounded-full bg-white/5" />
          
          <div className="relative">
            <div className={`inline-flex p-2 rounded-xl ${stat.iconBg} mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            
            <p className="text-xs text-white/80 mb-1">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
            
            {stat.change !== null && (
              <div className="flex items-center mt-2 text-xs">
                {(stat.invertChange ? -stat.change : stat.change) < 0 ? (
                  <>
                    <TrendingDown className="w-3 h-3 mr-1 text-emerald-300" />
                    <span className="text-emerald-300">
                      {Math.abs(stat.change).toFixed(1)}% ↓
                    </span>
                  </>
                ) : stat.change > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 mr-1 text-rose-300" />
                    <span className="text-rose-300">
                      {Math.abs(stat.change).toFixed(1)}% ↑
                    </span>
                  </>
                ) : (
                  <span className="text-white/60">Değişim yok</span>
                )}
                <span className="text-white/50 ml-1">vs önceki 30 gün</span>
              </div>
            )}
          </div>
        </div>
      ))}
      
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
