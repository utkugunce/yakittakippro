import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { MapPin, Crosshair, X, Check, Loader2, Search } from 'lucide-react';

interface LocationPickerProps {
    onSelect: (lat: number, lng: number) => void;
    onClose: () => void;
    initialPosition?: { lat: number; lng: number } | null;
}

const containerStyle = {
    width: '100%',
    height: '100%'
};

// Default center: Turkey
const defaultCenter = { lat: 39.9334, lng: 32.8597 };

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

// Libraries array must be constant to avoid re-loads
const libraries: ("places")[] = ["places"];

export const LocationPicker: React.FC<LocationPickerProps> = ({ onSelect, onClose, initialPosition }) => {
    const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(
        initialPosition || null
    );
    const [gpsLoading, setGpsLoading] = useState(false);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        language: 'tr',
        libraries
    });

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            setSelectedPosition({
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            });
        }
    }, []);

    const handleAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const handlePlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                setSelectedPosition({ lat, lng });

                if (map) {
                    map.panTo({ lat, lng });
                    map.setZoom(17);
                }
            } else {
                console.log("Returned place contains no geometry");
            }
        }
    };

    const handleGetCurrentLocation = () => {
        if ('geolocation' in navigator) {
            setGpsLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setSelectedPosition(pos);

                    if (map) {
                        map.panTo(pos);
                        map.setZoom(15);
                    }

                    setGpsLoading(false);
                },
                (err) => {
                    console.error('GPS error:', err);
                    alert('Konum alınamadı. Lütfen izinleri kontrol edin.');
                    setGpsLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            alert('Tarayıcınız GPS desteklemiyor.');
        }
    };

    const handleConfirm = () => {
        if (selectedPosition) {
            onSelect(selectedPosition.lat, selectedPosition.lng);
        }
    };

    if (loadError) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 text-center max-w-sm">
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                        <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Harita Yüklenemedi</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Google Maps API anahtarı geçersiz veya internet bağlantısı yok.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[600px] md:h-auto max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 shrink-0">
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Konum Seç</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Kapat"
                        aria-label="Kapat"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Map Container */}
                <div className="relative flex-1 min-h-0">
                    {!isLoaded ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Harita yükleniyor...</p>
                            </div>
                        </div>
                    ) : (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={selectedPosition || defaultCenter}
                            zoom={selectedPosition ? 15 : 6}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            onClick={handleMapClick}
                            options={{
                                disableDefaultUI: false,
                                zoomControl: true,
                                streetViewControl: false,
                                mapTypeControl: false,
                                fullscreenControl: false,
                            }}
                        >
                            {/* Search Box */}
                            <div className="absolute top-4 left-4 right-16 z-10">
                                <Autocomplete
                                    onLoad={handleAutocompleteLoad}
                                    onPlaceChanged={handlePlaceChanged}
                                >
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="İstasyon veya adres ara..."
                                            className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-white sm:text-sm shadow-lg"
                                        />
                                    </div>
                                </Autocomplete>
                            </div>

                            {selectedPosition && (
                                <Marker
                                    position={selectedPosition}
                                    animation={google.maps.Animation.DROP}
                                />
                            )}
                        </GoogleMap>
                    )}

                    {/* GPS Button - Floating on map */}
                    <button
                        onClick={handleGetCurrentLocation}
                        disabled={gpsLoading}
                        className="absolute bottom-6 right-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 border border-gray-100 dark:border-gray-700 group"
                        title="Şu anki konumumu bul"
                    >
                        {gpsLoading ? (
                            <Loader2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin" />
                        ) : (
                            <Crosshair className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        )}
                    </button>

                    {/* Instructions overlay */}
                    {!selectedPosition && isLoaded && (
                        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm pointer-events-none whitespace-nowrap">
                            Haritadan seçin veya arama yapın 📍
                        </div>
                    )}
                </div>

                {/* Footer with coordinates and confirm */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                    {selectedPosition ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 py-2 px-3 rounded-lg border border-gray-100 dark:border-gray-700 w-full sm:w-auto text-center sm:text-left">
                                <span className="font-medium text-gray-500 dark:text-gray-500 block sm:inline mb-1 sm:mb-0">Seçilen Konum:</span>
                                <span className="sm:ml-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                    {selectedPosition.lat.toFixed(5)}, {selectedPosition.lng.toFixed(5)}
                                </span>
                            </div>
                            <div className="flex space-x-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setSelectedPosition(null)}
                                    className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    Sıfırla
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 transition-all transform active:scale-95"
                                >
                                    <Check className="w-5 h-5" />
                                    <span>Konumu Onayla</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
                            Haritada tıklayın, GPS kullanın veya arama yapın
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
