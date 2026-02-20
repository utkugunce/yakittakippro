import React, { useState, useMemo, useEffect } from 'react';
import { useJsApiLoader, DirectionsService, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { Map, MapPin, Navigation, Loader2, Coins, Droplets, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

// We extract the key from env
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const LIBRARIES: ("places")[] = ["places"];

export const RoutePlannerPage: React.FC = () => {
    const { logs, vehicles, selectedVehicleId } = useAppStore();

    // Default map center (Ankara, Turkey)
    const [center] = useState({ lat: 39.92077, lng: 32.85411 });

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
        language: 'tr'
    });

    const [originRef, setOriginRef] = useState<google.maps.places.Autocomplete | null>(null);
    const [destinationRef, setDestinationRef] = useState<google.maps.places.Autocomplete | null>(null);

    // UI state
    const [originText, setOriginText] = useState('');
    const [destinationText, setDestinationText] = useState('');
    const [userFuelPrice, setUserFuelPrice] = useState<number>(0);

    const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [duration, setDuration] = useState<string>('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Calculate Average Consumption and Latest Fuel Price from AppStore
    const { avgConsumption, latestFuelPrice } = useMemo(() => {
        let avgCons = 8.0; // Fallback
        let latestPrice = 40.0; // Fallback

        // Find relevant logs depending on selected vehicle
        const relevantLogs = selectedVehicleId && selectedVehicleId !== 'all'
            ? logs.filter(l => l.vehicleId === selectedVehicleId)
            : logs;

        if (relevantLogs.length > 0) {
            // Price: from the most recent entry
            latestPrice = relevantLogs.reduce((prev, curr) => new Date(prev.date) > new Date(curr.date) ? prev : curr).fuelPrice;

            // Avg Consumption:
            let totalFuel = 0;
            let totalDist = 0;
            relevantLogs.forEach(log => {
                totalFuel += log.dailyFuelConsumed;
                totalDist += log.dailyDistance;
            });
            if (totalDist > 0) {
                avgCons = (totalFuel / totalDist) * 100;
            }
        }

        return { avgConsumption: avgCons, latestFuelPrice: latestPrice };
    }, [logs, selectedVehicleId]);

    // Initialize the user fuel price input when latest price is loaded
    useEffect(() => {
        if (latestFuelPrice > 0 && userFuelPrice === 0) {
            setUserFuelPrice(latestFuelPrice);
        }
    }, [latestFuelPrice]);

    const calculateRoute = async () => {
        setErrorMsg(null);
        if (!originText || !destinationText) {
            setErrorMsg("Lütfen başlangıç ve varış noktalarını girin.");
            return;
        }

        setIsCalculating(true);
        try {
            // eslint-disable-next-line no-undef
            const directionsService = new google.maps.DirectionsService();
            const results = await directionsService.route({
                origin: originText,
                destination: destinationText,
                // eslint-disable-next-line no-undef
                travelMode: google.maps.TravelMode.DRIVING,
            });

            setDirectionsResponse(results);
            if (results.routes[0]?.legs[0]) {
                const routeInfo = results.routes[0].legs[0];
                const distInKm = (routeInfo.distance?.value || 0) / 1000;
                setDistance(distInKm);
                setDuration(routeInfo.duration?.text || '');
            }
        } catch (error: any) {
            console.error("Directions error", error);
            setErrorMsg("Rota hesaplanamadı. Lütfen geçerli adresler girin.");
            setDirectionsResponse(null);
            setDistance(null);
            setDuration('');
        } finally {
            setIsCalculating(false);
        }
    };

    const clearRoute = () => {
        setDirectionsResponse(null);
        setDistance(null);
        setDuration('');
        setOriginText('');
        setDestinationText('');
        setErrorMsg(null);
    };

    // Calculate Cost Result
    const estimatedCost = useMemo(() => {
        if (!distance) return null;
        const totalFuelUsed = (distance / 100) * avgConsumption;
        return (totalFuelUsed * userFuelPrice);
    }, [distance, avgConsumption, userFuelPrice]);

    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-100 dark:border-red-900 mx-auto max-w-2xl mt-10">
                <MapPin className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Harita Yüklenemedi</h2>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                    Google Maps API yüklenirken bir sorun oluştu. API anahtarınızı kontrol edin.
                </p>
                <p className="text-xs text-red-400 mt-4">{loadError.message}</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mr-2 text-primary-500" />
                <span>Harita Yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
            <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-md">
                    <Map className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Akıllı Rota Hesaplayıcı</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sürüş verilerinize dayalı gerçekçi seyahat maliyeti tahmini</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Form Section */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Nereden</label>
                                <Autocomplete
                                    onLoad={setOriginRef}
                                    onPlaceChanged={() => {
                                        if (originRef !== null) {
                                            const place = originRef.getPlace();
                                            if (place.formatted_address) setOriginText(place.formatted_address);
                                            else if (place.name) setOriginText(place.name);
                                        }
                                    }}
                                >
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Başlangıç noktası..."
                                            value={originText}
                                            onChange={(e) => setOriginText(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                </Autocomplete>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Varış Noktası</label>
                                <Autocomplete
                                    onLoad={setDestinationRef}
                                    onPlaceChanged={() => {
                                        if (destinationRef !== null) {
                                            const place = destinationRef.getPlace();
                                            if (place.formatted_address) setDestinationText(place.formatted_address);
                                            else if (place.name) setDestinationText(place.name);
                                        }
                                    }}
                                >
                                    <div className="relative">
                                        <Navigation className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Varış noktası..."
                                            value={destinationText}
                                            onChange={(e) => setDestinationText(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                </Autocomplete>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Yakıt Fiyatı (TL/L)</label>
                                <div className="relative">
                                    <Coins className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Güncel yakıt fiyatı..."
                                        value={userFuelPrice}
                                        onChange={(e) => setUserFuelPrice(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {errorMsg && (
                                <p className="text-xs text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">{errorMsg}</p>
                            )}

                            <div className="flex space-x-2 pt-2">
                                <button
                                    onClick={calculateRoute}
                                    disabled={isCalculating || !originText || !destinationText}
                                    className="flex-1 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md disabled:opacity-50 flex justify-center items-center transition-all"
                                >
                                    {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Hesapla</span>}
                                </button>
                                {directionsResponse && (
                                    <button
                                        onClick={clearRoute}
                                        className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-4 py-3 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                                    >
                                        Temizle
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Card */}
                    {directionsResponse && distance !== null && estimatedCost !== null && (
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 p-5 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-800 animate-in slide-in-from-bottom-5">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                                <ArrowRight className="w-5 h-5 text-indigo-500 mr-2" />
                                Yolculuk Özeti
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                    <div className="flex items-center">
                                        <Map className="w-5 h-5 text-blue-500 mr-2" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Tahmini Mesafe</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{distance.toFixed(1)} km</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                    <div className="flex items-center">
                                        <Navigation className="w-5 h-5 text-indigo-500 mr-2" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Süre</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{duration}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                    <div className="flex items-center">
                                        <Droplets className="w-5 h-5 text-emerald-500 mr-2" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Verimlilik</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{avgConsumption.toFixed(1)} L/100km</span>
                                </div>

                                <div className="mt-6 p-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-indigo-200 dark:border-indigo-700 text-center">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">Tahmini Yakıt Maliyeti</p>
                                    <div className="flex items-center justify-center">
                                        <Coins className="w-6 h-6 text-indigo-500 mr-2" />
                                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₺{estimatedCost.toFixed(2)}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2">* {userFuelPrice.toFixed(2)} TL/L güncel yakıt fiyatı baz alınmıştır.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Map Details Section */}
                <div className="lg:col-span-2 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 relative min-h-[400px]">
                    {/* 
                         We won't render an actual google map component canvas here since that uses extensive credits/API rendering if not needed,
                         but doing so makes directions much better. Let's render the map if directions exist, else a placeholder.
                     */}
                    {directionsResponse ? (
                        <div className="w-full h-full min-h-[400px]">
                            {/* @react-google-maps/api provides GoogleMap component but actually since we just need the map, we need to import it. Let's add it. */}
                            {/* Wait, the prompt says "Calculate the route distance using Google Maps Directions Service". Visualizing the map adds great UX. */}
                            {/* In order to use GoogleMap, I need to import it: `import { GoogleMap } from '@react-google-maps/api';` */}
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500">
                            <Map className="w-16 h-16 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Haritada Göster</h3>
                            <p className="text-sm max-w-sm mt-2">Başlangıç ve varış noktalarını girerek rota detaylarını ve gerçekçi yakıt maliyetinizi görüntüleyin.</p>
                        </div>
                    )}

                    {/* Complete Google Map renderer */}
                    <div className={`w-full h-full min-h-[400px] absolute inset-0 transition-opacity duration-300 ${directionsResponse ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
                        {/* We use a conditional render for React component import to prevent error if missing */}
                        <GoogleMapReact
                            center={center}
                            zoom={6}
                            directionsResponse={directionsResponse}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

// Extracted GoogleMap component handling to avoid top-level load errors
import { GoogleMap } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const GoogleMapReact = ({ center, zoom, directionsResponse }: any) => {
    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
            }}
        >
            {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} />
            )}
        </GoogleMap>
    );
};
