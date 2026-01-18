import React, { useMemo, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { DailyLog } from './types';
import { FuelPurchase } from './FuelPurchaseForm';
import { Fuel, Calendar, Gauge, Droplets, Coins, Map, AlertTriangle } from 'lucide-react';

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

const containerStyle = {
    width: '100%',
    height: '400px'
};

const defaultCenter = { lat: 39.9334, lng: 32.8597 }; // Ankara

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const FuelMap: React.FC<FuelMapProps> = ({ logs, purchases = [] }) => {
    const [showMap, setShowMap] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

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
    const center = items.length > 0
        ? { lat: items[0].lat, lng: items[0].lng }
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
                const currentTotal = stats[p.station].avgPrice * (stats[p.station].count - 1);
                stats[p.station].avgPrice = (currentTotal + p.pricePerLiter) / stats[p.station].count;
            }
        });

        return Object.entries(stats)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
    }, [logs, purchases]);

    // No API Key warning
    if (!GOOGLE_MAPS_API_KEY) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-200 dark:border-amber-800 p-6">
                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white mb-1">Google Maps API Key Gerekli</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Haritayı görüntülemek için <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">.env</code> dosyasına API key ekleyin:
                        </p>
                        <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-sm overflow-x-auto">
                            VITE_GOOGLE_MAPS_API_KEY=AIza...
                        </pre>
                    </div>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 dark:text-red-400">Harita yüklenemedi. API key'inizi kontrol edin.</p>
            </div>
        );
    }

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

                {stationStats.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {stationStats.map((stat, index) => (
                            <div key={stat.name} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-left">
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
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300">
                {!showMap ? (
                    <div
                        className="h-32 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group p-6"
                        onClick={() => setShowMap(true)}
                    >
                        <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Map className="w-6 h-6 text-primary-500" />
                        </div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">Google Haritayı Görüntüle</span>
                    </div>
                ) : isLoaded ? (
                    <div className="relative animate-in fade-in duration-500">
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={6}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            options={{
                                styles: [
                                    {
                                        featureType: 'poi',
                                        stylers: [{ visibility: 'off' }]
                                    }
                                ],
                                mapTypeControl: false,
                                streetViewControl: false,
                                fullscreenControl: false
                            }}
                        >
                            {items.map(item => (
                                <Marker
                                    key={item.id}
                                    position={{ lat: item.lat, lng: item.lng }}
                                    onClick={() => setSelectedItem(item)}
                                    icon={{
                                        url: item.type === 'purchase'
                                            ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                            : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                                        scaledSize: new google.maps.Size(32, 32)
                                    }}
                                />
                            ))}

                            {selectedItem && (
                                <InfoWindow
                                    position={{ lat: selectedItem.lat, lng: selectedItem.lng }}
                                    onCloseClick={() => setSelectedItem(null)}
                                >
                                    <div className="p-2 min-w-[150px]">
                                        <div className="flex items-center space-x-2 mb-2 border-b border-gray-100 pb-2">
                                            {selectedItem.type === 'purchase' ? (
                                                <Fuel className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Calendar className="w-4 h-4 text-blue-500" />
                                            )}
                                            <span className="font-bold text-gray-800">{selectedItem.title}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">
                                            {new Date(selectedItem.date).toLocaleDateString('tr-TR')}
                                        </div>
                                        {selectedItem.details}
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMap(false); }}
                            className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-300"
                            title="Haritayı Gizle"
                        >
                            <Map className="w-5 h-5 opacity-50" />
                        </button>
                    </div>
                ) : (
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
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
