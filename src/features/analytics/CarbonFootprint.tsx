import React, { useMemo } from 'react';
import { Leaf, TreeDeciduous, Car, TrendingDown, Info } from 'lucide-react';

interface CarbonFootprintProps {
    fuelPurchases: { date: string; liters: number }[];
    logs: { date: string; km: number }[];
}

// CO2 emission factor: 2.31 kg CO2 per liter of gasoline
const CO2_PER_LITER = 2.31;

// Average tree absorbs ~22 kg CO2 per year
const TREE_CO2_ABSORPTION = 22;

export const CarbonFootprint: React.FC<CarbonFootprintProps> = ({ fuelPurchases, logs }) => {
    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        // Total liters
        const totalLiters = fuelPurchases.reduce((sum, fp) => sum + Number(fp.liters), 0);

        // This month's liters
        const monthlyLiters = fuelPurchases
            .filter(fp => {
                const d = new Date(fp.date);
                return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            })
            .reduce((sum, fp) => sum + Number(fp.liters), 0);

        // This year's liters
        const yearlyLiters = fuelPurchases
            .filter(fp => new Date(fp.date).getFullYear() === thisYear)
            .reduce((sum, fp) => sum + Number(fp.liters), 0);

        // Total km from logs
        const totalKm = logs.reduce((sum, log) => sum + Number(log.dailyDistance || log.km || 0), 0); // Handle varying log structure if any

        // CO2 calculations
        const totalCO2 = totalLiters * CO2_PER_LITER;
        const monthlyCO2 = monthlyLiters * CO2_PER_LITER;
        const yearlyCO2 = yearlyLiters * CO2_PER_LITER;

        // Trees needed to offset
        const treesNeeded = Math.ceil(yearlyCO2 / TREE_CO2_ABSORPTION);

        // CO2 per km (if we have km data)
        const co2PerKm = totalKm > 0 ? (totalCO2 / totalKm) * 100 : 0; // per 100km

        return {
            totalLiters,
            totalCO2,
            monthlyCO2,
            yearlyCO2,
            treesNeeded,
            co2PerKm,
            totalKm
        };
    }, [fuelPurchases, logs]);

    const getEmissionLevel = (co2PerKm: number): { label: string; color: string; icon: string } => {
        if (co2PerKm === 0) return { label: 'KM Verisi Bekleniyor', color: 'gray', icon: '⏳' };
        if (co2PerKm < 15) return { label: 'Düşük', color: 'green', icon: '🌱' };
        if (co2PerKm < 20) return { label: 'Orta', color: 'yellow', icon: '🌿' };
        if (co2PerKm < 25) return { label: 'Yüksek', color: 'orange', icon: '🍂' };
        return { label: 'Çok Yüksek', color: 'red', icon: '🔥' };
    };

    const emissionLevel = getEmissionLevel(stats.co2PerKm);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Leaf className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold">Karbon Ayak İzi</h3>
                        <p className="text-xs text-white/70">Çevresel etkinizi takip edin</p>
                    </div>
                </div>
            </div>

            {/* Main Stats */}
            <div className="p-4">
                {/* Total CO2 */}
                <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-gray-800 dark:text-white">
                        {stats.yearlyCO2.toFixed(0)}
                        <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-1">kg</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date().getFullYear()} yılı CO₂ emisyonu
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {stats.monthlyCO2.toFixed(0)} kg
                        </p>
                        <p className="text-xs text-gray-500">Bu ay</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {stats.co2PerKm.toFixed(1)} kg
                        </p>
                        <p className="text-xs text-gray-500">100 km başına</p>
                    </div>
                </div>

                {/* Emission Level */}
                <div className={`flex items-center justify-between p-3 rounded-lg ${emissionLevel.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                    emissionLevel.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                        emissionLevel.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                            emissionLevel.color === 'red' ? 'bg-red-50 dark:bg-red-900/20' :
                                'bg-gray-50 dark:bg-gray-700/50'
                    }`}>
                    <div className="flex items-center space-x-2">
                        <span className="text-xl">{emissionLevel.icon}</span>
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">Emisyon Seviyesi</p>
                            <p className={`text-xs font-bold ${emissionLevel.color === 'green' ? 'text-green-600' :
                                emissionLevel.color === 'yellow' ? 'text-yellow-600' :
                                    emissionLevel.color === 'orange' ? 'text-orange-600' :
                                        emissionLevel.color === 'red' ? 'text-red-600' :
                                            'text-gray-600'
                                }`}>
                                {emissionLevel.label}
                            </p>
                        </div>
                    </div>
                    <Car className="w-5 h-5 text-gray-400" />
                </div>

                {/* Trees Needed */}
                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                            <TreeDeciduous className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                                Dengelemek için <strong className="text-emerald-600">{stats.treesNeeded}</strong> ağaç gerekli
                            </p>
                            <p className="text-xs text-gray-500">Yıllık emisyonunuzu sıfırlamak için</p>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-4 flex items-start space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                        Benzin başına 2.31 kg CO₂ hesaplanır. Ekonomik sürüş ve düzenli bakım ile emisyonu %15'e kadar azaltabilirsiniz.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CarbonFootprint;
