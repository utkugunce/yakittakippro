import React, { useState, useRef } from 'react';
import { Camera, Loader2, CheckCircle, AlertCircle, X, Gauge, Receipt, Upload, Fuel, Route } from 'lucide-react';
import { analyzeDashboardPhoto, analyzeReceiptPhoto } from './utils/geminiVision';

interface PhotoScannerProps {
    onDashboardData: (data: { odometer?: number; consumption?: number; distance?: number }) => void;
    onReceiptData: (data: { fuelPrice?: number }) => void;
    onClose: () => void;
}

type ScanType = 'consumption' | 'distance' | 'receipt' | null;
type ScanStatus = 'idle' | 'selectType' | 'selectSource' | 'scanning' | 'success' | 'error' | 'done';

interface CollectedData {
    consumption?: number;
    distance?: number;
    odometer?: number;
    fuelPrice?: number;
}

export const PhotoScanner: React.FC<PhotoScannerProps> = ({ onDashboardData, onReceiptData, onClose }) => {
    const [status, setStatus] = useState<ScanStatus>('selectType');
    const [currentScanType, setCurrentScanType] = useState<ScanType>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [collectedData, setCollectedData] = useState<CollectedData>({});
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentScanType) return;

        setStatus('scanning');
        setErrorMessage('');

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = event.target?.result as string;
                setPreviewUrl(base64);

                try {
                    if (currentScanType === 'consumption') {
                        const result = await analyzeDashboardPhoto(base64, 'consumption');
                        if (result.consumption) {
                            setCollectedData(prev => ({ ...prev, consumption: result.consumption ?? undefined, odometer: result.odometer ?? prev.odometer }));
                            // After consumption, ask for distance
                            setCurrentScanType(null);
                            setStatus('selectType');
                            setPreviewUrl('');
                        } else {
                            setStatus('error');
                            setErrorMessage('Tüketim değeri okunamadı. Tekrar deneyin.');
                        }
                    } else if (currentScanType === 'distance') {
                        const result = await analyzeDashboardPhoto(base64, 'distance');
                        if (result.distance) {
                            const finalData = { ...collectedData, distance: result.distance ?? undefined, odometer: result.odometer ?? collectedData.odometer };
                            setCollectedData(finalData);
                            onDashboardData(finalData);
                            setStatus('done');
                            setTimeout(() => onClose(), 1500);
                        } else {
                            setStatus('error');
                            setErrorMessage('Yapılan mesafe okunamadı. Tekrar deneyin.');
                        }
                    } else if (currentScanType === 'receipt') {
                        const result = await analyzeReceiptPhoto(base64);
                        if (result.pricePerLiter) {
                            onReceiptData({ fuelPrice: result.pricePerLiter ?? undefined });
                            setStatus('done');
                            setTimeout(() => onClose(), 1500);
                        } else {
                            setStatus('error');
                            setErrorMessage('Fiş üzerinden fiyat okunamadı. Tekrar deneyin.');
                        }
                    }
                } catch (err: any) {
                    setStatus('error');
                    setErrorMessage(err.message || 'Analiz sırasında hata oluştu.');
                }
            };
            reader.readAsDataURL(file);
        } catch (err: any) {
            setStatus('error');
            setErrorMessage('Dosya okunamadı.');
        }

        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
    };

    const selectType = (type: ScanType) => {
        setCurrentScanType(type);
        setStatus('selectSource');
    };

    const triggerCamera = () => cameraInputRef.current?.click();
    const triggerGallery = () => galleryInputRef.current?.click();

    const goBack = () => {
        if (status === 'selectSource') {
            setStatus('selectType');
            setCurrentScanType(null);
        } else if (status === 'error') {
            setStatus('selectSource');
        }
    };

    const hasConsumption = collectedData.consumption !== undefined;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex items-center space-x-2">
                        <Camera className="w-5 h-5" />
                        <h2 className="font-bold">Fotoğraftan Oku</h2>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress indicator for dashboard */}
                {(status === 'selectType' || status === 'selectSource') && !currentScanType?.includes('receipt') && (
                    <div className="px-4 pt-4">
                        <div className="flex items-center space-x-2 text-xs">
                            <div className={`flex items-center px-2 py-1 rounded-full ${hasConsumption ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                <Fuel className="w-3 h-3 mr-1" />
                                {hasConsumption ? `✓ ${collectedData.consumption} L/100km` : '1. Tüketim'}
                            </div>
                            <span className="text-gray-300">→</span>
                            <div className={`flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400`}>
                                <Route className="w-3 h-3 mr-1" />
                                2. Mesafe
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Hidden file inputs */}
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
                    <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

                    {/* Scanning */}
                    {status === 'scanning' && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-300 font-medium">Fotoğraf analiz ediliyor...</p>
                            {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-4 opacity-50" />}
                        </div>
                    )}

                    {/* Done */}
                    {status === 'done' && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <p className="text-green-600 dark:text-green-400 font-bold">Veriler başarıyla okundu!</p>
                            {collectedData.consumption && <p className="text-sm text-gray-500">Tüketim: {collectedData.consumption} L/100km</p>}
                            {collectedData.distance && <p className="text-sm text-gray-500">Mesafe: {collectedData.distance} km</p>}
                        </div>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <div className="text-center py-6">
                            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                            <p className="text-red-600 dark:text-red-400 font-medium mb-4">{errorMessage}</p>
                            <button onClick={goBack} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
                                Tekrar Dene
                            </button>
                        </div>
                    )}

                    {/* Select Type */}
                    {status === 'selectType' && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                                {hasConsumption ? 'Şimdi mesafe ekranını okutun' : 'Ne okutmak istiyorsunuz?'}
                            </p>

                            {/* Consumption button - show if not collected yet */}
                            {!hasConsumption && (
                                <button onClick={() => selectType('consumption')} className="w-full flex items-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border-2 border-orange-200 dark:border-orange-700 rounded-xl hover:border-orange-400 transition-all group">
                                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <Fuel className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="font-bold text-gray-800 dark:text-white">1. Tüketim Ekranı</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Ortalama yakıt tüketimi (L/100km)</p>
                                    </div>
                                </button>
                            )}

                            {/* Distance button - show if consumption collected */}
                            {hasConsumption && (
                                <button onClick={() => selectType('distance')} className="w-full flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl hover:border-blue-400 transition-all group">
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <Route className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="font-bold text-gray-800 dark:text-white">2. Yol Bilgisi Ekranı</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Yapılan mesafe (km)</p>
                                    </div>
                                </button>
                            )}

                            {/* Divider */}
                            {!hasConsumption && (
                                <>
                                    <div className="flex items-center my-2">
                                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                                        <span className="px-3 text-xs text-gray-400">veya</span>
                                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                                    </div>

                                    {/* Receipt button */}
                                    <button onClick={() => selectType('receipt')} className="w-full flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl hover:border-green-400 transition-all group">
                                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                            <Receipt className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <h3 className="font-bold text-gray-800 dark:text-white">Benzin Fişi</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Litre fiyatı</p>
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Select Source */}
                    {status === 'selectSource' && (
                        <div className="space-y-3">
                            <button onClick={goBack} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center">
                                ← Geri
                            </button>

                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                                {currentScanType === 'consumption' && '📊 Tüketim ekranı'}
                                {currentScanType === 'distance' && '🛣️ Yol bilgisi ekranı'}
                                {currentScanType === 'receipt' && '🧾 Benzin fişi'}
                                {' için fotoğraf kaynağı seçin'}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={triggerCamera} className="flex flex-col items-center p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-xl hover:border-purple-400 transition-all group">
                                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Camera className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">Kamera</h3>
                                </button>

                                <button onClick={triggerGallery} className="flex flex-col items-center p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-200 dark:border-amber-700 rounded-xl hover:border-amber-400 transition-all group">
                                    <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">Galeri</h3>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
