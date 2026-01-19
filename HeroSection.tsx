import React, { useMemo } from 'react';
import { Fuel, Plus, Sun, Moon, CloudSun } from 'lucide-react';
import { Button } from './src/components/ui/Button';
import { DailyLog, FuelPurchase, Vehicle } from './types';

interface HeroSectionProps {
    logs: DailyLog[];
    fuelPurchases: FuelPurchase[];
    vehicle?: Vehicle;
    onAddFuel: () => void;
    onAddEntry: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    logs,
    fuelPurchases,
    onAddFuel,
    onAddEntry,
}) => {
    // Get greeting based on time
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 6) return { text: 'İyi Geceler', icon: Moon };
        if (hour < 12) return { text: 'Günaydın', icon: Sun };
        if (hour < 18) return { text: 'İyi Günler', icon: CloudSun };
        return { text: 'İyi Akşamlar', icon: Moon };
    }, []);

    // Calculate stats
    const stats = useMemo(() => {
        const thisWeekLogs = logs.filter(l => {
            const logDate = new Date(l.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return logDate >= weekAgo;
        });

        const weeklyKm = thisWeekLogs.reduce((sum, l) => sum + l.distance, 0);
        const weeklyAvgConsumption = thisWeekLogs.length > 0
            ? thisWeekLogs.reduce((sum, l) => sum + l.avgConsumption, 0) / thisWeekLogs.length
            : 0;

        return { weeklyKm, weeklyAvgConsumption };
    }, [logs]);

    const GreetingIcon = greeting.icon;

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

            <div className="relative z-10">
                {/* Greeting */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <GreetingIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{greeting.text}!</h2>
                        <p className="text-sm text-white/70">Bugün nasıl gidiyor?</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 my-5">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="text-xs text-white/60 uppercase font-medium mb-1">Bu Hafta</div>
                        <div className="text-xl font-bold">
                            {stats.weeklyKm > 0 ? `${stats.weeklyKm.toFixed(0)} km` : '-'}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="text-xs text-white/60 uppercase font-medium mb-1">Ort. Tüketim</div>
                        <div className="text-xl font-bold">
                            {stats.weeklyAvgConsumption > 0 ? `${stats.weeklyAvgConsumption.toFixed(1)} L/100` : '-'}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button onClick={onAddFuel} variant="secondary" size="md" leftIcon={Fuel} className="flex-1 bg-white/20 hover:bg-white/30 border-0 text-white">
                        Yakıt Ekle
                    </Button>
                    <Button onClick={onAddEntry} variant="secondary" size="md" leftIcon={Plus} className="flex-1 bg-white/20 hover:bg-white/30 border-0 text-white">
                        Kayıt Ekle
                    </Button>
                </div>
            </div>
        </div>
    );
};
