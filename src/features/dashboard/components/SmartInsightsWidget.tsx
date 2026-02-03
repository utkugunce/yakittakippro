import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, CalendarClock, Droplet, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../../stores/appStore';
import { formatCurrency, formatDate } from '../../../utils/dateUtils';

export const SmartInsightsWidget: React.FC = () => {
    const { logs, fuelPurchases, vehicles, selectedVehicleId } = useAppStore();

    // Calculate Insights based on data
    const insights = useMemo(() => {
        if (logs.length < 5 && fuelPurchases.length < 3) return null;

        const vehicleLogs = logs.filter(l => l.vehicleId === selectedVehicleId || !selectedVehicleId);
        const vehiclePurchases = fuelPurchases.filter(p => true); // Filtering by vehicle ID in purchases if supported? Assuming single vehicle or filtering logic needed.

        // 1. Predict Next Refuel Date
        // Logic: Calculate average days between refuels
        const refuelDates = vehiclePurchases
            .map(p => new Date(p.date).getTime())
            .sort((a, b) => a - b);

        let avgDaysBetween = 14; // Default fallback
        if (refuelDates.length >= 2) {
            let totalDiff = 0;
            for (let i = 1; i < refuelDates.length; i++) {
                totalDiff += (refuelDates[i] - refuelDates[i - 1]);
            }
            avgDaysBetween = (totalDiff / (refuelDates.length - 1)) / (1000 * 60 * 60 * 24);
        }

        const lastRefuelDate = refuelDates.length > 0 ? refuelDates[refuelDates.length - 1] : Date.now();
        const nextRefuelTime = lastRefuelDate + (avgDaysBetween * 24 * 60 * 60 * 1000);
        const daysUntilRefuel = Math.ceil((nextRefuelTime - Date.now()) / (1000 * 60 * 60 * 24));


        // 2. Monthly Forecast
        // Logic: Avg monthly cost over last 3 months
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        const recentPurchases = vehiclePurchases.filter(p => new Date(p.date) > threeMonthsAgo);
        const totalRecentCost = recentPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const monthlyForecast = totalRecentCost / 3;

        // 3. Efficiency Alert
        // Check if last 2 logs consumption > avg consumption * 1.2
        const recentLogs = [...vehicleLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
        const avgConsumption = vehicleLogs.reduce((sum, l) => sum + l.avgConsumption, 0) / (vehicleLogs.length || 1);

        let efficiencyStatus = 'normal'; // normal, high, low
        if (recentLogs.length > 0) {
            const recentAvg = recentLogs.slice(0, 2).reduce((sum, l) => sum + l.avgConsumption, 0) / Math.min(2, recentLogs.length);
            if (recentAvg > avgConsumption * 1.15) efficiencyStatus = 'high'; // 15% higher usage
            if (recentAvg < avgConsumption * 0.85) efficiencyStatus = 'good'; // 15% lower usage
        }

        return {
            daysUntilRefuel,
            nextRefuelDate: new Date(nextRefuelTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
            monthlyForecast,
            efficiencyStatus,
            avgConsumption: avgConsumption.toFixed(1)
        };
    }, [logs, fuelPurchases, selectedVehicleId]);

    if (!insights) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden mb-6">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24" />
            </div>

            <h3 className="flex items-center gap-2 font-bold text-lg mb-4 relative z-10">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                Yapay Zeka Öngörüleri
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {/* Prediction 1: Refuel */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1 text-indigo-100 text-sm font-medium">
                        <CalendarClock className="w-4 h-4" />
                        Sonraki Yakıt
                    </div>
                    <p className="text-2xl font-bold">
                        {insights.daysUntilRefuel > 0 ? `${insights.daysUntilRefuel} Gün` : 'Bugün'}
                    </p>
                    <p className="text-xs text-indigo-200 mt-1">
                        Tahmini: {insights.nextRefuelDate}
                    </p>
                </div>

                {/* Prediction 2: Budget */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1 text-indigo-100 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        Gelecek Ay Tahmini
                    </div>
                    <p className="text-2xl font-bold">
                        {formatCurrency(insights.monthlyForecast)}
                    </p>
                    <p className="text-xs text-indigo-200 mt-1">
                        Ortalama harcamanıza göre
                    </p>
                </div>

                {/* Prediction 3: Efficiency */}
                <div className={`backdrop-blur-md rounded-xl p-3 border ${insights.efficiencyStatus === 'high' ? 'bg-red-500/20 border-red-400/30' :
                        insights.efficiencyStatus === 'good' ? 'bg-green-500/20 border-green-400/30' :
                            'bg-white/10 border-white/10'
                    }`}>
                    <div className="flex items-center gap-2 mb-1 text-indigo-100 text-sm font-medium">
                        <Droplet className="w-4 h-4" />
                        Verimlilik Durumu
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">
                            {insights.efficiencyStatus === 'high' ? 'Dikkat!' :
                                insights.efficiencyStatus === 'good' ? 'Harika!' : 'Normal'}
                        </span>
                        {insights.efficiencyStatus === 'high' && <AlertTriangle className="w-5 h-5 text-red-300" />}
                    </div>
                    <p className="text-xs text-indigo-200 mt-1">
                        Ort: {insights.avgConsumption} L/100km
                    </p>
                </div>
            </div>
        </div>
    );
};
