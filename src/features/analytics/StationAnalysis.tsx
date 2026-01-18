import React, { useMemo, useState } from 'react';
import { Fuel, TrendingDown, TrendingUp, MapPin, Award, ChevronDown, ChevronUp, Calendar, Hash, PieChart } from 'lucide-react';

interface FuelPurchase {
    station?: string;
    pricePerLiter: number;
    totalAmount: number;
    liters: number;
    liters: number;
    date: string;
    city?: string;
}

interface StationAnalysisProps {
    fuelPurchases: FuelPurchase[];
}

interface StationStats {
    name: string;
    visitCount: number;
    totalSpent: number;
    totalLiters: number;
    avgPrice: number;
}

export const StationAnalysis: React.FC<StationAnalysisProps> = ({ fuelPurchases }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const stationStats = useMemo(() => {
        const stats: Record<string, StationStats> = {};

        fuelPurchases.forEach(fp => {
            const name = fp.station || 'Bilinmeyen';
            if (!stats[name]) {
                stats[name] = {
                    name,
                    visitCount: 0,
                    totalSpent: 0,
                    totalLiters: 0,
                    avgPrice: 0
                };
            }
            // Ensure numeric values even if legacy data has strings
            const amount = Number(fp.totalAmount);
            const liters = Number(fp.liters);

            if (!isNaN(amount)) stats[name].totalSpent += amount;
            if (!isNaN(liters)) stats[name].totalLiters += liters;
            stats[name].visitCount++;
        });

        // Calculate weighted averages (Total Spent / Total Liters)
        Object.values(stats).forEach(s => {
            s.avgPrice = s.totalLiters > 0 ? s.totalSpent / s.totalLiters : 0;
        });

        return Object.values(stats).sort((a, b) => b.visitCount - a.visitCount);
    }, [fuelPurchases]);

    // Fun Facts Calculations
    const funFacts = useMemo(() => {
        if (fuelPurchases.length === 0) return null;

        // 1. Most Frequent Day
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const dayCounts: Record<number, number> = {};
        fuelPurchases.forEach(fp => {
            const d = new Date(fp.date).getDay();
            dayCounts[d] = (dayCounts[d] || 0) + 1;
        });
        const bestDayIndex = Object.keys(dayCounts).reduce((a, b) => dayCounts[Number(a)] > dayCounts[Number(b)] ? a : b, '0');
        const bestDay = days[Number(bestDayIndex)];

        // 2. Monthly Refuel Count
        const currentMonth = new Date().getMonth();
        const refuelsThisMonth = fuelPurchases.filter(fp => new Date(fp.date).getMonth() === currentMonth).length;

        // 3. Most Frequent City or Top Brand
        const cityCounts: Record<string, number> = {};
        fuelPurchases.forEach(fp => {
            if (fp.city) {
                cityCounts[fp.city] = (cityCounts[fp.city] || 0) + 1;
            }
        });

        let mostFrequentCity = '';
        if (Object.keys(cityCounts).length > 0) {
            mostFrequentCity = Object.keys(cityCounts).reduce((a, b) => cityCounts[a] > cityCounts[b] ? a : b);
        }

        const topBrand = stationStats[0];
        const loyaltyScore = topBrand ? Math.round((topBrand.visitCount / fuelPurchases.length) * 100) : 0;

        return {
            bestDay,
            refuelsThisMonth,
            loyaltyScore,
            topBrandName: topBrand?.name,
            mostFrequentCity
        };

    }, [fuelPurchases, stationStats]);

    const cheapest = useMemo(() => {
        const validStations = stationStats.filter(s => s.avgPrice > 0);
        if (validStations.length === 0) return null;
        return validStations.reduce((min, s) => s.avgPrice < min.avgPrice ? s : min);
    }, [stationStats]);

    const mostExpensive = useMemo(() => {
        const validStations = stationStats.filter(s => s.avgPrice > 0);
        if (validStations.length === 0) return null;
        return validStations.reduce((max, s) => s.avgPrice > max.avgPrice ? s : max);
    }, [stationStats]);

    const mostVisited = stationStats[0];

    if (fuelPurchases.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="text-center text-gray-500">
                    <Fuel className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Henüz yakıt alımı verisi yok</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
            {/* Header */}
            <div
                className="p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <Fuel className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Yakıt Analizi</h3>
                            <p className="text-xs text-gray-500">{stationStats.length} farklı istasyon • {fuelPurchases.length} alım</p>
                        </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    {/* Fun Facts Section */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        {/* Best Day */}
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                <span className="text-xs font-bold text-gray-500 uppercase">Favori Gün</span>
                            </div>
                            <p className="font-bold text-gray-800 dark:text-white">{funFacts?.bestDay}</p>
                            <p className="text-[10px] text-gray-400">En çok yakıt aldığın gün</p>
                        </div>

                        {/* Monthly Count */}
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                                <Hash className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-bold text-gray-500 uppercase">Bu Ay</span>
                            </div>
                            <p className="font-bold text-gray-800 dark:text-white">{funFacts?.refuelsThisMonth} Kez</p>
                            <p className="text-[10px] text-gray-400">Toplam yakıt dolumu</p>
                        </div>

                        {/* Loyalty */}
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                                <PieChart className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold text-gray-500 uppercase">Sadakat</span>
                            </div>
                            <p className="font-bold text-gray-800 dark:text-white">%{funFacts?.loyaltyScore}</p>
                            <p className="text-[10px] text-gray-400">{funFacts?.topBrandName || 'Marka'} tercihi</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
                        {cheapest && (
                            <div className="p-3 text-center">
                                <div className="flex items-center justify-center space-x-1 text-green-600 dark:text-green-400 mb-1">
                                    <TrendingDown className="w-4 h-4" />
                                    <span className="text-xs font-medium">En Ucuz</span>
                                </div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white truncate">{cheapest.name}</p>
                                <p className="text-xs text-green-600">₺{cheapest.avgPrice.toFixed(2)}/L</p>
                            </div>
                        )}
                        {mostExpensive && (
                            <div className="p-3 text-center">
                                <div className="flex items-center justify-center space-x-1 text-red-600 dark:text-red-400 mb-1">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-xs font-medium">En Pahalı</span>
                                </div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white truncate">{mostExpensive.name}</p>
                                <p className="text-xs text-red-600">₺{mostExpensive.avgPrice.toFixed(2)}/L</p>
                            </div>
                        )}
                        {mostVisited && (
                            <div className="p-3 text-center">
                                <div className="flex items-center justify-center space-x-1 text-blue-600 dark:text-blue-400 mb-1">
                                    <Award className="w-4 h-4" />
                                    <span className="text-xs font-medium">Favorin</span>
                                </div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white truncate">{mostVisited.name}</p>
                                <p className="text-xs text-blue-600">{mostVisited.visitCount} ziyaret</p>
                            </div>
                        )}
                    </div>

                    {/* Station List */}
                    <div className="max-h-64 overflow-y-auto">
                        {stationStats.map((station, index) => (
                            <div
                                key={station.name}
                                className="flex items-center justify-between p-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-200 text-gray-600' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-800 dark:text-white">{station.name}</p>
                                        <p className="text-xs text-gray-500">{station.visitCount} ziyaret · {station.totalLiters.toFixed(0)} L</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm ${station === cheapest ? 'text-green-600' :
                                        station === mostExpensive ? 'text-red-600' :
                                            'text-gray-800 dark:text-white'
                                        }`}>
                                        ₺{station.avgPrice.toFixed(2)}/L
                                    </p>
                                    <p className="text-xs text-gray-500">₺{station.totalSpent.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Savings Tip */}
                    {cheapest && mostExpensive && cheapest !== mostExpensive && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border-t border-green-100 dark:border-green-800">
                            <p className="text-xs text-green-700 dark:text-green-300 text-center">
                                💡 <strong>{cheapest.name}</strong> tercih ederek litre başına <strong>₺{(mostExpensive.avgPrice - cheapest.avgPrice).toFixed(2)}</strong> tasarruf edebilirsin!
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Collapsed Preview (if not expanded) */}
            {!isExpanded && (
                <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center text-xs text-gray-500">
                    <span>En sık: {mostVisited?.name}</span>
                    <span>En ucuz: {cheapest?.name} (₺{cheapest?.avgPrice.toFixed(2)})</span>
                </div>
            )}
        </div>
    );
};

export default StationAnalysis;


