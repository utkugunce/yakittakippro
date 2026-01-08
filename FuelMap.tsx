import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DailyLog } from './types';
import { Fuel, Calendar, Gauge } from 'lucide-react';

// Fix Leaflet Default Icon Issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface FuelMapProps {
    logs: DailyLog[];
}

export const FuelMap: React.FC<FuelMapProps> = ({ logs }) => {
    // Filter logs with valid location data
    const pins = useMemo(() => logs.filter(l => l.latitude && l.longitude), [logs]);

    // Calculate center based on recent logs or default to Turkey center
    const defaultCenter: [number, number] = [39.9334, 32.8597]; // Ankara
    const center: [number, number] = pins.length > 0
        ? [pins[0].latitude!, pins[0].longitude!]
        : defaultCenter;

    // Station statistics
    const stationStats = useMemo(() => {
        const stats: Record<string, { count: number, totalSpent: number, avgPrice: number }> = {};

        logs.forEach(log => {
            if (log.fuelStation) {
                if (!stats[log.fuelStation]) {
                    stats[log.fuelStation] = { count: 0, totalSpent: 0, avgPrice: 0 };
                }
                stats[log.fuelStation].count++;
                stats[log.fuelStation].totalSpent += log.dailyCost;
                stats[log.fuelStation].avgPrice = log.fuelPrice;
            }
        });

        return Object.entries(stats)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3); // Top 3 stations
    }, [logs]);

    if (pins.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
                <div className="bg-primary-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Fuel className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Henüz Konum Verisi Yok</h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Yakıt girişi yaparken "Konum Ekle" seçeneğini işaretleyerek harita üzerinde yakıt aldığınız yerleri görebilirsiniz.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Station Statistics Summary */}
            {stationStats.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {stationStats.map((station, i) => (
                        <div key={station.name} className={`p-3 rounded-xl border ${i === 0 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <Fuel className={`w-4 h-4 ${i === 0 ? 'text-amber-500' : 'text-gray-400'}`} />
                                <span className="font-bold text-sm text-gray-800 dark:text-white truncate">{station.name}</span>
                                {i === 0 && <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-200 px-1 rounded">FAVORİ</span>}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>{station.count} ziyaret</span>
                                <span>₺{station.totalSpent.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Map */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-[400px] z-0">
                <MapContainer
                    center={center}
                    zoom={6}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {pins.map(log => (
                        <Marker
                            key={log.id}
                            position={[log.latitude!, log.longitude!]}
                        >
                            <Popup>
                                <div className="p-1">
                                    <div className="flex items-center gap-2 mb-2 font-bold text-gray-800 border-b pb-1">
                                        <Calendar className="w-4 h-4 text-primary-500" />
                                        {new Date(log.date).toLocaleDateString('tr-TR')}
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center justify-between gap-4">
                                            <span>Tutar:</span>
                                            <span className="font-bold text-gray-800">₺{log.dailyCost.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <span>Yakıt:</span>
                                            <span className="font-bold text-gray-800">{(log.dailyFuelConsumed).toFixed(1)} L</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <span>Birim:</span>
                                            <span className="font-bold text-gray-800">₺{log.fuelPrice}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                            <Gauge className="w-3 h-3" />
                                            {log.currentOdometer} km
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};
