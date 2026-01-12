import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Crosshair, X, Check } from 'lucide-react';

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

interface LocationPickerProps {
    onSelect: (lat: number, lng: number) => void;
    onClose: () => void;
    initialPosition?: { lat: number; lng: number } | null;
}

// Component to handle map clicks
const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Component to fly to user's location
const FlyToLocation: React.FC<{ position: [number, number] | null }> = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 15, { duration: 1 });
        }
    }, [position, map]);

    return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ onSelect, onClose, initialPosition }) => {
    const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
        initialPosition ? [initialPosition.lat, initialPosition.lng] : null
    );
    const [gpsLoading, setGpsLoading] = useState(false);

    // Default center: Turkey
    const defaultCenter: [number, number] = [39.9334, 32.8597];
    const mapCenter = selectedPosition || defaultCenter;

    const handleMapClick = (lat: number, lng: number) => {
        setSelectedPosition([lat, lng]);
    };

    const handleGetCurrentLocation = () => {
        if ('geolocation' in navigator) {
            setGpsLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setSelectedPosition(pos);
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
            onSelect(selectedPosition[0], selectedPosition[1]);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Konum Seç</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Map Container */}
                <div className="h-[400px] relative">
                    <MapContainer
                        center={mapCenter}
                        zoom={selectedPosition ? 15 : 6}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler onMapClick={handleMapClick} />
                        <FlyToLocation position={selectedPosition} />

                        {selectedPosition && (
                            <Marker position={selectedPosition} />
                        )}
                    </MapContainer>

                    {/* GPS Button - Floating on map */}
                    <button
                        onClick={handleGetCurrentLocation}
                        disabled={gpsLoading}
                        className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                        title="Şu anki konumumu bul"
                    >
                        {gpsLoading ? (
                            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Crosshair className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        )}
                    </button>

                    {/* Instructions overlay */}
                    {!selectedPosition && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                            Haritada bir noktaya tıklayın 📍
                        </div>
                    )}
                </div>

                {/* Footer with coordinates and confirm */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    {selectedPosition ? (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Seçilen Konum:</span>
                                <span className="ml-2 font-mono text-emerald-600 dark:text-emerald-400">
                                    {selectedPosition[0].toFixed(5)}, {selectedPosition[1].toFixed(5)}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setSelectedPosition(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                >
                                    Sıfırla
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md flex items-center space-x-2 transition-all"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Onayla</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                            Haritada tıklayarak veya GPS butonunu kullanarak konum seçin
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
