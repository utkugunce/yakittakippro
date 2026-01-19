import React from 'react';
import { Coins, Droplets, Calendar, Award } from 'lucide-react';
import { FuelPurchase } from '@/types';

interface FuelPurchaseStatsBarProps {
  purchases: FuelPurchase[];
}

export const FuelPurchaseStatsBar: React.FC<FuelPurchaseStatsBarProps> = ({ purchases }) => {
  if (!purchases.length) return null;

  const totalLiters = purchases.reduce((sum, p) => sum + p.liters, 0);
  const totalAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const avgPrice = purchases.length > 0 ? purchases.reduce((sum, p) => sum + p.pricePerLiter, 0) / purchases.length : 0;
  const bestPrice = purchases.reduce((min, p) => p.pricePerLiter < min ? p.pricePerLiter : min, purchases[0].pricePerLiter);

  const stats = [
    {
      icon: Droplets,
      label: 'Toplam Yakıt',
      value: `${totalLiters.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} L`,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Coins,
      label: 'Toplam Tutar',
      value: `₺${totalAmount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: Calendar,
      label: 'Ortalama Fiyat',
      value: `₺${avgPrice.toFixed(2)}/L`,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Award,
      label: 'En İyi Fiyat',
      value: `₺${bestPrice.toFixed(2)}/L`,
      gradient: 'from-pink-500 to-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-4 text-white shadow-lg`}
          style={{ animation: `slideUp 0.5s ease-out ${i * 0.08}s both` }}
        >
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-4 h-10 w-10 rounded-full bg-white/5" />
          <div className="relative">
            <div className="inline-flex p-2 rounded-xl bg-white/20 mb-2">
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-white/80 mb-1">{stat.label}</p>
            <p className="text-lg font-bold">{stat.value}</p>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
