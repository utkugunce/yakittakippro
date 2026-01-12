import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DailyLog } from './types';
import { FuelPurchase } from './FuelPurchaseForm';
import { Fuel, Calendar, Gauge, Droplets, Coins } from 'lucide-react';

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
    purchases?: FuelPurchase[];
}

interface MapItem {
    id: string;
    date: string;
    lat: number;
    lng: number;
    title: string;
    details: React.ReactNode;
    type: 'log' | 'purchase';
}

export const FuelMap: React.FC<FuelMapProps> = ({ logs, purchases = [] }) => {
    // Merge logs and purchases into map items
    const items: MapItem[] = useMemo(() => {
        const mapItems: MapItem[] = [];

        // Add Logs
        logs.forEach(log => {
            if (log.latitude && log.longitude) {
                mapItems.push({
                    id: log.id,
                    date: log.date,
                    lat: log.latitude,
                    lng: log.longitude,
                    title: 'Günlük Kayıt',
                    type: 'log',
                    details: (
                        <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                                <Gauge className="w-3 h-3 text-gray-400" />
                                <span>{log.dailyDistance} km</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Coins className="w-3 h-3 text-gray-400" />
                                <span>₺{log.dailyCost.toFixed(2)}</span>
                            </div>
                        </div>
                    )
                });
            }
        });

        // Add Fuel Purchases
        purchases.forEach(p => {
            if (p.latitude && p.longitude) {
                mapItems.push({
                    id: p.id,
                    date: p.date,
                    lat: p.latitude,
                    lng: p.longitude,
                    title: p.station || 'Yakıt Alımı',
                    type: 'purchase',
                    details: (
                        <div className="space-y-1">
                            {p.station && (
                                <div className="font-bold text-emerald-600">{p.station}</div>
                            )}
                            <div className="flex items-center space-x-1">
                                <Droplets className="w-3 h-3 text-blue-500" />
                                <span>{p.liters} L</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Coins className="w-3 h-3 text-amber-500" />
                                <span>₺{p.totalAmount}</span>
                            </div>
                        </div>
                    )
                });
            }
        });

        return mapItems;
    }, [logs, purchases]);

    // Calculate center based on recent items
    const defaultCenter: [number, number] = [39.9334, 32.8597]; // Ankara
    const center: [number, number] = items.length > 0
        ? [items[0].lat, items[0].lng]
        : defaultCenter;

    // Station statistics
    const stationStats = useMemo(() => {
        const stats: Record<string, { count: number, totalSpent: number, avgPrice: number, totalLiters: number }> = {};

        // Process Logs
        logs.forEach(log => {
            if (log.fuelStation) {
                if (!stats[log.fuelStation]) {
                    stats[log.fuelStation] = { count: 0, totalSpent: 0, avgPrice: 0, totalLiters: 0 };
                }
                stats[log.fuelStation].count++;
                stats[log.fuelStation].totalSpent += log.dailyCost;
                stats[log.fuelStation].avgPrice = log.fuelPrice;
                // Note: logs doesn't strictly have liters per entry easily available correctly without calc, assuming just count/spent for now for logs
            }
        });

        // Process Purchases
        purchases.forEach(p => {
            if (p.station) {
                if (!stats[p.station]) {
                    stats[p.station] = { count: 0, totalSpent: 0, avgPrice: 0, totalLiters: 0 };
                }
                stats[p.station].count++;
                stats[p.station].totalSpent += p.totalAmount;
                stats[p.station].totalLiters += p.liters;
                // Running average for price
                const currentTotal = stats[p.station].avgPrice * (stats[p.station].count - 1);
                stats[p.station].avgPrice = (currentTotal + p.pricePerLiter) / stats[p.station].count;
            }
        });

        return Object.entries(stats)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3); // Top 3 stations
    }, [logs, purchases]);

    if (items.length === 0) {
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
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="h-[400px] w-full z-0 relative">
                    <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {items.map(item => (
                            <Marker key={item.id} position={[item.lat, item.lng]}>
                                <Popup>
                                    <div className="p-1">
                                        <div className="flex items-center space-x-2 mb-2 border-b border-gray-100 pb-2">
                                            {item.type === 'purchase' ? (
                                                <Fuel className={`w-4 h-4 ${item.title !== 'Yakıt Alımı' ? 'text-emerald-500' : 'text-blue-500'}`} />
                                            ) : (
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                            )}
                                            <span className="font-bold text-gray-800">{item.title}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">
                                            {new Date(item.date).toLocaleDateString('tr-TR')}
                                        </div>
                                        {item.details}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Station Stats Cards */}
            {stationStats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stationStats.map((stat, index) => (
                        <div key={stat.name} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-amber-100 text-amber-600' :
                                            index === 1 ? 'bg-gray-100 text-gray-600' :
                                                'bg-orange-100 text-orange-600'
                                        }`}>
                                        <span className="font-bold">{index + 1}</span>
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white">{stat.name}</span>
                                </div>
                                <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                    {stat.count} Ziyaret
                                </span>
                            </div>
                            <div className="flex justify-between items-end mt-3">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Ort. Fiyat</div>
                                    <div className="font-bold text-gray-800 dark:text-white">₺{stat.avgPrice.toFixed(2)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Toplam</div>
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400">₺{stat.totalSpent.toFixed(0)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
