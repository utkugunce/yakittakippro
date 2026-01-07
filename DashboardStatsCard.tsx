import React from 'react';
import { DashboardStats, MaintenanceItem } from './types';
import { TrendingUp, Droplets, Wallet, Navigation, AlertCircle, AlertTriangle, Fuel } from 'lucide-react';

interface Props {
  stats: DashboardStats;
  alerts?: MaintenanceItem[];
  currentOdometer?: number;
}

export const DashboardStatsCard: React.FC<Props> = ({ stats, alerts, currentOdometer }) => {
  return (
    <div className="space-y-6">
      {alerts && alerts.length > 0 && currentOdometer && (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map(alert => {
            const remaining = alert.nextDueKm - currentOdometer;
            const isCritical = remaining < 0;
            return (
              <div key={alert.id} className={`p-4 rounded-xl border flex items-center justify-between ${isCritical ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'}`}>
                <div className="flex items-center space-x-3">
                  {isCritical ? <AlertCircle className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                  <div>
                    <h4 className="font-bold text-sm uppercase">{alert.title} Bakımı</h4>
                    <p className="text-sm">
                      {isCritical
                        ? `${Math.abs(remaining).toLocaleString()} km gecikti!`
                        : `${remaining.toLocaleString()} km kaldı.`}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-bold px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full">
                  Hedef: {alert.nextDueKm.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Distance */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 mb-2">
            <Navigation className="w-4 h-4" />
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Toplam Yol</h3>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalDistance.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">km</span></p>
        </div>

        {/* Total Cost */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 mb-2">
            <Wallet className="w-4 h-4" />
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Toplam Harcama</h3>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">₺{stats.totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>

        {/* Average Consumption */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 mb-2">
            <Fuel className="w-4 h-4" />
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ort. Tüketim</h3>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.avgConsumption.toFixed(1)} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">L/100km</span></p>
        </div>

        {/* Avg Cost Per KM */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Km Başına</h3>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">₺{stats.avgCostPerKm.toFixed(2)}</p>
        </div>

        {/* Last Fuel Price */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-500 mb-2">
            <Droplets className="w-4 h-4" />
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Son Benzin</h3>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">₺{stats.lastFuelPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};