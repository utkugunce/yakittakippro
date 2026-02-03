import React from 'react';
import { DashboardStats, MaintenanceItem } from '../../../types';
import { TrendingUp, Droplets, Wallet, Navigation, AlertCircle, AlertTriangle, Fuel } from 'lucide-react';

interface Props {
  stats: DashboardStats;
  alerts?: MaintenanceItem[];
  currentOdometer?: number;
}

export const DashboardStatsCard: React.FC<Props> = ({ stats, alerts, currentOdometer }) => {
  const statCards = [
    {
      title: 'Toplam Yol',
      value: `${stats.totalDistance.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
      unit: 'km',
      icon: Navigation,
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20'
    },
    {
      title: 'Toplam Harcama',
      value: `₺${stats.totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      unit: '',
      icon: Wallet,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20'
    },
    {
      title: 'Toplam Yakıt',
      value: `${stats.totalLiters.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
      unit: 'L',
      icon: Fuel,
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20'
    },
    {
      title: 'KM Başına',
      value: `₺${stats.avgCostPerKm.toFixed(2)}`,
      unit: '',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-violet-600',
      shadow: 'shadow-purple-500/20'
    },
    {
      title: 'Ort. Tüketim',
      value: `${stats.avgConsumption.toFixed(1)}`,
      unit: 'L/100km',
      icon: Fuel,
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/20'
    },
    {
      title: 'Son Benzin',
      value: `₺${stats.lastFuelPrice.toFixed(2)}`,
      unit: '₺/L',
      subtext: stats.weightedAvgPrice ? `Ort: ₺${stats.weightedAvgPrice.toFixed(2)}` : undefined,
      icon: Droplets,
      gradient: 'from-cyan-500 to-blue-600',
      shadow: 'shadow-cyan-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {alerts && alerts.length > 0 && currentOdometer && (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map(alert => {
            let remainingText = '';
            let isCritical = false;
            let targetText = '';

            // Logic preserved from original
            if (alert.type === 'date' && alert.dueDate) {
              const days = Math.ceil((new Date(alert.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              isCritical = days < 0;
              remainingText = isCritical ? `${Math.abs(days)} gün geçti!` : `${days} gün kaldı.`;
              targetText = `Tarih: ${new Date(alert.dueDate).toLocaleDateString('tr-TR')}`;
            } else if (alert.type === 'both' && alert.dueDate && alert.nextDueKm) {
              const days = Math.ceil((new Date(alert.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const km = alert.nextDueKm - currentOdometer;
              const daysUrgency = days * 100;
              if (days < 0 || (km >= 0 && daysUrgency < km)) {
                isCritical = days < 0;
                remainingText = isCritical ? `${Math.abs(days)} gün geçti!` : `${days} gün kaldı.`;
                targetText = `Tarih: ${new Date(alert.dueDate).toLocaleDateString('tr-TR')}`;
              } else {
                isCritical = km < 0;
                remainingText = isCritical ? `${Math.abs(km).toLocaleString()} km gecikti!` : `${km.toLocaleString()} km kaldı.`;
                targetText = `Hedef: ${alert.nextDueKm.toLocaleString()} km`;
              }
            } else {
              const remaining = (alert.nextDueKm || 0) - currentOdometer;
              isCritical = remaining < 0;
              remainingText = isCritical ? `${Math.abs(remaining).toLocaleString()} km gecikti!` : `${remaining.toLocaleString()} km kaldı.`;
              targetText = `Hedef: ${(alert.nextDueKm || 0).toLocaleString()} km`;
            }

            return (
              <div key={alert.id} className={`relative overflow-hidden rounded-xl p-4 flex items-center justify-between border ${isCritical ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800' : 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800'}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${isCritical ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {isCritical ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm uppercase ${isCritical ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'}`}>{alert.title} Bakımı</h4>
                    <p className={`text-sm ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>{remainingText}</p>
                  </div>
                </div>
                <div className="text-xs font-bold px-3 py-1 bg-white/50 dark:bg-black/20 rounded-lg ml-2 backdrop-blur-sm">
                  {targetText}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="group relative overflow-hidden bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <stat.icon className={`w-16 h-16 text-${stat.gradient.split('-')[1]}-500`} />
            </div>

            <div className="relative z-10">
              <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadow} mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>

              <div className="space-y-0.5">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.title}</h3>
                <div className="flex items-baseline gap-1">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  {stat.unit && <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{stat.unit}</span>}
                </div>
                {stat.subtext && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{stat.subtext}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};