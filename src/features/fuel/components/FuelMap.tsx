import React, { useMemo, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer, Polyline, HeatmapLayer } from '@react-google-maps/api';
import { Fuel, Calendar, Gauge, Droplets, Coins, Map as MapIcon, AlertTriangle, Layers, Filter, Navigation, Building2, Flame } from 'lucide-react';
import { useAppStore } from '../../../stores/appStore';
import { Button } from '../../../components/ui/Button';

interface MapItem {
    id: string;
    date: string;
    lat: number;
    lng: number;
    title: string;
    details: React.ReactNode;
    type: 'log' | 'purchase';
    price?: number; // For heatmap weight
}

const containerStyle = {
    width: '100%',
    height: '500px'
};

const defaultCenter = { lat: 39.9334, lng: 32.8597 }; // Ankara

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

// Map Options
const mapOptions = {
    styles: [
        {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]
        }
    ],
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
};

export const FuelMap: React.FC = () => {
    const { logs, fuelPurchases: purchases } = useAppStore();
    const [showMap, setShowMap] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);

    // Filters & Layers State
    const [dateRange, setDateRange] = useState<'all' | '30' | '90'>('all');
    const [showRoutes, setShowRoutes] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [showCityStats, setShowCityStats] = useState(false);

    // Libraries must be constant
    const libraries: ("places" | "visualization" | "geometry")[] = useMemo(() => ["places", "visualization"], []);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Filter Logic
    const filteredData = useMemo(() => {
        const now = new Date();
        const cutoff = new Date();
        if (dateRange === '30') cutoff.setDate(now.getDate() - 30);
        if (dateRange === '90') cutoff.setDate(now.getDate() - 90);
        if (dateRange === 'all') cutoff.setFullYear(2000);

        const filteredLogs = logs.filter(l => new Date(l.date) >= cutoff);
        const filteredPurchases = purchases.filter(p => new Date(p.date) >= cutoff);

        return { filteredLogs, filteredPurchases };
    }, [logs, purchases, dateRange]);

    // Merge logs and purchases into map items
    const items: MapItem[] = useMemo(() => {
        const mapItems: MapItem[] = [];

        // Add Logs
        filteredData.filteredLogs.forEach(log => {
            if (log.latitude && log.longitude) {
                mapItems.push({
                    id: log.id,
                    date: log.date,
                    lat: log.latitude,
                    lng: log.longitude,
                    title: 'Günlük Kayıt',
                    type: 'log',
                    price: log.dailyCost,
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
        filteredData.filteredPurchases.forEach(p => {
            if (p.latitude && p.longitude) {
                mapItems.push({
                    id: p.id,
                    date: p.date,
                    lat: p.latitude,
                    lng: p.longitude,
                    title: p.station || 'Yakıt Alımı',
                    type: 'purchase',
                    price: p.totalAmount, // Used for heatmap weight
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

        return mapItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredData]);

    // Calculate center based on recent items
    const center = items.length > 0
        ? { lat: items[items.length - 1].lat, lng: items[items.length - 1].lng }
        : defaultCenter;

    // Heatmap Data
    const heatmapData = useMemo(() => {
        if (!window.google) return [];
        return items.map(item => ({
            location: new google.maps.LatLng(item.lat, item.lng),
            weight: item.price ? item.price / 100 : 1 // Normalize weight
        }));
    }, [items]);

    // Route Path
    const routePath = useMemo(() => {
        return items.map(i => ({ lat: i.lat, lng: i.lng }));
    }, [items]);

    // City Statistics
    const cityStats = useMemo(() => {
        const stats: Record<string, { count: number, totalAmount: number }> = {};

        filteredData.filteredPurchases.forEach(p => {
            // City extraction could be improved with geocoding, here relying on user input or approximation
            const city = p.city || 'Bilinmiyor';
            if (!stats[city]) stats[city] = { count: 0, totalAmount: 0 };
            stats[city].count++;
            stats[city].totalAmount += p.totalAmount;
        });

        // Also check logs if they have city data (assuming updated log type in future, currently mainly purchases have strict city field)
        // For now, focusing on purchases for city stats as they are more location-significant for spending

        return Object.entries(stats)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .filter(s => s.name !== 'Bilinmiyor');
    }, [filteredData]);

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

    if (items.length === 0 && showMap) {
        // Show map but with empty state overlay if desired, or just the map centered on default
    }

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300">
                {!showMap ? (
                    <div
                        className="h-32 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group p-6"
                        onClick={() => setShowMap(true)}
                    >
                        <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <MapIcon className="w-6 h-6 text-primary-500" />
                        </div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">Google Haritayı Görüntüle</span>
                    </div>
                ) : isLoaded ? (
                    <div className="relative animate-in fade-in duration-500">
                        {/* Map Controls Toolbar */}
                        <div className="absolute top-4 left-4 right-14 z-10 flex flex-wrap gap-2 pointer-events-none">
                            <div className="pointer-events-auto bg-white dark:bg-gray-800 p-1 rounded-lg shadow-md flex gap-1">
                                <button
                                    onClick={() => setDateRange('30')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${dateRange === '30' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    30 Gün
                                </button>
                                <button
                                    onClick={() => setDateRange('90')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${dateRange === '90' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    90 Gün
                                </button>
                                <button
                                    onClick={() => setDateRange('all')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${dateRange === 'all' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    Tümü
                                </button>
                            </div>

                            <div className="pointer-events-auto bg-white dark:bg-gray-800 p-1 rounded-lg shadow-md flex gap-1">
                                <button
                                    onClick={() => setShowRoutes(!showRoutes)}
                                    className={`p-1.5 rounded-md transition-colors ${showRoutes ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    title="Rota Göster"
                                >
                                    <Navigation className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setShowHeatmap(!showHeatmap)}
                                    className={`p-1.5 rounded-md transition-colors ${showHeatmap ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    title="Isı Haritası"
                                >
                                    <Flame className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setShowCityStats(!showCityStats)}
                                    className={`p-1.5 rounded-md transition-colors ${showCityStats ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    title="Şehir İstatistikleri"
                                >
                                    <Building2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={6}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            options={mapOptions}
                        >
                            {/* Heatmap Layer */}
                            {showHeatmap && window.google && (
                                <HeatmapLayer
                                    data={heatmapData}
                                    options={{
                                        radius: 30,
                                        opacity: 0.6
                                    }}
                                />
                            )}

                            {/* Route Polyline */}
                            {showRoutes && (
                                <Polyline
                                    path={routePath}
                                    options={{
                                        strokeColor: '#3B82F6',
                                        strokeOpacity: 0.8,
                                        strokeWeight: 4,
                                        geodesic: true,
                                        icons: [{
                                            icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2 },
                                            offset: '100%'
                                        }]
                                    }}
                                />
                            )}

                            {/* Nav Markers (Only show if not Heatmap mode or show both) */}
                            {!showHeatmap && (
                                <MarkerClusterer minimumClusterSize={3}>
                                    {(clusterer) => (
                                        <>
                                            {items.map(item => (
                                                <Marker
                                                    key={item.id}
                                                    position={{ lat: item.lat, lng: item.lng }}
                                                    onClick={() => setSelectedItem(item)}
                                                    clusterer={clusterer}
                                                    icon={{
                                                        url: item.type === 'purchase'
                                                            ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                                            : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                                                        scaledSize: new google.maps.Size(32, 32)
                                                    }}
                                                />
                                            ))}
                                        </>
                                    )}
                                </MarkerClusterer>
                            )}

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
                            <MapIcon className="w-5 h-5 opacity-50" />
                        </button>

                        {/* City Stats Overlay */}
                        {showCityStats && cityStats.length > 0 && (
                            <div className="absolute bottom-4 left-4 z-10 w-64 max-h-48 overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-3 animate-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center">
                                        <Building2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                        Şehir Bazlı Harcama
                                    </h4>
                                    <button onClick={() => setShowCityStats(false)} className="text-gray-400 hover:text-gray-600">
                                        <Filter className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {cityStats.map((city, idx) => (
                                        <div key={city.name} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center">
                                                <span className="w-4 text-gray-400 font-mono">{idx + 1}</span>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">{city.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">{city.count} kez</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">₺{city.totalAmount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

