import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Loader2, Check, AlertTriangle, RefreshCcw, Receipt, Gauge, ArrowLeft, Plus, Fuel, Car } from 'lucide-react';
import { analyzeDashboardPhoto, analyzeReceiptPhoto } from './utils/geminiVision';

type ScanType = 'receipt' | 'dashboard' | null;
type DashboardStep = 'consumption' | 'distance' | 'done';

interface PhotoScannerProps {
    onDashboardData?: (data: { odometer?: number, consumption?: number, distance?: number }) => void;
    onReceiptData?: (data: { fuelPrice?: number, total?: number, liters?: number, date?: string }) => void;
    onClose: () => void;
}

interface DashboardResults {
    consumption?: number;
    distance?: number;
    odometer?: number;
}

export const PhotoScanner: React.FC<PhotoScannerProps> = ({ onDashboardData, onReceiptData, onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scan type selection
    const [scanType, setScanType] = useState<ScanType>(null);

    // Dashboard multi-photo flow
    const [dashboardStep, setDashboardStep] = useState<DashboardStep>('consumption');
    const [consumptionImage, setConsumptionImage] = useState<string | null>(null);
    const [distanceImage, setDistanceImage] = useState<string | null>(null);
    const [dashboardResults, setDashboardResults] = useState<DashboardResults>({});

    // Receipt flow
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [receiptResults, setReceiptResults] = useState<{ pricePerLiter?: number; totalAmount?: number; liters?: number } | null>(null);

    // Common state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                processSelectedImage(dataUrl);
            };
            reader.readAsDataURL(file);
        }
        // Reset input for re-selection
        if (e.target) e.target.value = '';
    };

    const processSelectedImage = async (dataUrl: string) => {
        setLoading(true);
        setError(null);

        try {
            if (scanType === 'dashboard') {
                if (dashboardStep === 'consumption') {
                    setConsumptionImage(dataUrl);
                    const result = await analyzeDashboardPhoto(dataUrl, 'consumption');
                    setDashboardResults(prev => ({
                        ...prev,
                        consumption: result.consumption ?? undefined,
                        odometer: result.odometer ?? prev.odometer ?? undefined
                    }));
                    setDashboardStep('distance');
                } else if (dashboardStep === 'distance') {
                    setDistanceImage(dataUrl);
                    const result = await analyzeDashboardPhoto(dataUrl, 'distance');
                    setDashboardResults(prev => ({
                        ...prev,
                        distance: result.distance ?? undefined,
                        odometer: result.odometer ?? prev.odometer ?? undefined
                    }));
                    setDashboardStep('done');
                }
            } else if (scanType === 'receipt') {
                setReceiptImage(dataUrl);
                const result = await analyzeReceiptPhoto(dataUrl);
                setReceiptResults({
                    pricePerLiter: result.pricePerLiter ?? undefined,
                    totalAmount: result.totalAmount ?? undefined,
                    liters: result.liters ?? undefined
                });
            }
        } catch (err: any) {
            console.error('Scan error:', err);
            setError(err.message || 'Görüntü analiz edilemedi. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleConfirmDashboard = () => {
        if (onDashboardData) {
            onDashboardData({
                odometer: dashboardResults.odometer,
                consumption: dashboardResults.consumption,
                distance: dashboardResults.distance
            });
        }
        onClose();
    };

    const handleConfirmReceipt = () => {
        if (onReceiptData && receiptResults) {
            onReceiptData({
                fuelPrice: receiptResults.pricePerLiter,
                total: receiptResults.totalAmount,
                liters: receiptResults.liters
            });
        }
        onClose();
    };

    const resetAll = () => {
        setScanType(null);
        setDashboardStep('consumption');
        setConsumptionImage(null);
        setDistanceImage(null);
        setDashboardResults({});
        setReceiptImage(null);
        setReceiptResults(null);
        setError(null);
    };

    const resetDashboardStep = () => {
        if (dashboardStep === 'distance') {
            setDashboardStep('consumption');
            setConsumptionImage(null);
            setDashboardResults({});
        } else if (dashboardStep === 'done') {
            setDashboardStep('distance');
            setDistanceImage(null);
            setDashboardResults(prev => ({ ...prev, distance: undefined }));
        }
    };

    // Hidden file input
    const FileInput = (
        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
        />
    );

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
            {FileInput}

            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10 text-white">
                <div className="flex items-center">
                    {scanType && (
                        <button onClick={resetAll} className="p-2 mr-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <h3 className="font-bold flex items-center text-lg">
                        {scanType === 'receipt' && <Receipt className="w-5 h-5 mr-2 text-orange-400" />}
                        {scanType === 'dashboard' && <Gauge className="w-5 h-5 mr-2 text-blue-400" />}
                        {!scanType && <Camera className="w-5 h-5 mr-2" />}
                        {scanType === 'receipt' ? 'Yakıt Fişi' : scanType === 'dashboard' ? 'Gösterge Paneli' : 'Fotoğraftan Veri Al'}
                    </h3>
                </div>
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-6 overflow-auto">

                {/* Error Display */}
                {error && (
                    <div className="absolute top-20 left-4 right-4 z-20 bg-red-500/90 text-white p-4 rounded-xl text-center shadow-lg backdrop-blur-sm">
                        <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="mt-3 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30"
                        >
                            Tamam
                        </button>
                    </div>
                )}

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
                        <p className="text-white font-bold text-xl animate-pulse">AI Analiz Ediyor...</p>
                        <p className="text-gray-400 text-sm mt-2">Groq Vision işliyor</p>
                    </div>
                )}

                {/* Step 1: Scan Type Selection */}
                {!scanType && (
                    <div className="w-full max-w-sm">
                        <p className="text-gray-400 text-center mb-8 text-lg">Ne taramak istiyorsunuz?</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => setScanType('dashboard')}
                                className="w-full flex items-center p-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                                    <Gauge className="w-8 h-8" />
                                </div>
                                <div className="text-left">
                                    <p className="text-lg">Gösterge Paneli</p>
                                    <p className="text-sm font-normal opacity-80">2 fotoğraf: Tüketim + Mesafe</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setScanType('receipt')}
                                className="w-full flex items-center p-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                                    <Receipt className="w-8 h-8" />
                                </div>
                                <div className="text-left">
                                    <p className="text-lg">Yakıt Fişi</p>
                                    <p className="text-sm font-normal opacity-80">Fiyat, litre, tutar</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Dashboard Flow */}
                {scanType === 'dashboard' && (
                    <div className="w-full max-w-sm">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-center mb-8">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${dashboardStep === 'consumption' ? 'bg-blue-600 text-white' :
                                    consumptionImage ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                                }`}>
                                {consumptionImage ? <Check className="w-5 h-5" /> : '1'}
                            </div>
                            <div className={`w-16 h-1 mx-2 rounded ${consumptionImage ? 'bg-green-500' : 'bg-gray-700'}`} />
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${dashboardStep === 'distance' ? 'bg-blue-600 text-white' :
                                    distanceImage ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                                }`}>
                                {distanceImage ? <Check className="w-5 h-5" /> : '2'}
                            </div>
                        </div>

                        {/* Consumption Photo Step */}
                        {dashboardStep === 'consumption' && (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Fuel className="w-10 h-10 text-blue-400" />
                                </div>
                                <h4 className="text-white font-bold text-xl mb-2">1. Tüketim Ekranı</h4>
                                <p className="text-gray-400 mb-6">
                                    Araç göstergesinde <span className="text-blue-400 font-semibold">L/100km</span> gösterilen ekranın fotoğrafını çekin
                                </p>

                                <button
                                    onClick={triggerFileSelect}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all"
                                >
                                    <Camera className="w-5 h-5 mr-2" />
                                    Fotoğraf Çek / Yükle
                                </button>
                            </div>
                        )}

                        {/* Distance Photo Step */}
                        {dashboardStep === 'distance' && (
                            <div className="text-center">
                                {/* Show previous result */}
                                {dashboardResults.consumption && (
                                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-6 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Check className="w-5 h-5 text-green-400 mr-2" />
                                            <span className="text-green-400 text-sm">Tüketim algılandı</span>
                                        </div>
                                        <span className="text-white font-bold">{dashboardResults.consumption} L/100</span>
                                    </div>
                                )}

                                <div className="w-20 h-20 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Car className="w-10 h-10 text-purple-400" />
                                </div>
                                <h4 className="text-white font-bold text-xl mb-2">2. Mesafe Ekranı</h4>
                                <p className="text-gray-400 mb-6">
                                    Araç göstergesinde <span className="text-purple-400 font-semibold">günlük/trip km</span> gösterilen ekranın fotoğrafını çekin
                                </p>

                                <button
                                    onClick={triggerFileSelect}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all"
                                >
                                    <Camera className="w-5 h-5 mr-2" />
                                    Fotoğraf Çek / Yükle
                                </button>

                                <button
                                    onClick={resetDashboardStep}
                                    className="w-full mt-3 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl flex items-center justify-center transition-all"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                    İlk Fotoğrafı Tekrarla
                                </button>
                            </div>
                        )}

                        {/* Dashboard Results */}
                        {dashboardStep === 'done' && (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-400" />
                                </div>
                                <h4 className="text-white font-bold text-xl mb-6">Tespit Edilen Veriler</h4>

                                <div className="space-y-3 mb-6">
                                    <div className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                                        <span className="text-gray-400">Tüketim</span>
                                        <span className="text-white font-bold text-lg">
                                            {dashboardResults.consumption ? `${dashboardResults.consumption} L/100km` : '-'}
                                        </span>
                                    </div>
                                    <div className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                                        <span className="text-gray-400">Günlük Mesafe</span>
                                        <span className="text-white font-bold text-lg">
                                            {dashboardResults.distance ? `${dashboardResults.distance} km` : '-'}
                                        </span>
                                    </div>
                                    {dashboardResults.odometer && (
                                        <div className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                                            <span className="text-gray-400">Kilometre</span>
                                            <span className="text-white font-bold text-lg">
                                                {dashboardResults.odometer.toLocaleString('tr-TR')} km
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={resetDashboardStep}
                                        className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center"
                                    >
                                        <RefreshCcw className="w-4 h-4 mr-2" />
                                        Tekrarla
                                    </button>
                                    <button
                                        onClick={handleConfirmDashboard}
                                        className="flex-[2] py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30"
                                    >
                                        Onayla ve Kullan
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Receipt Flow */}
                {scanType === 'receipt' && !receiptResults && (
                    <div className="w-full max-w-sm text-center">
                        <div className="w-20 h-20 bg-orange-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Receipt className="w-10 h-10 text-orange-400" />
                        </div>
                        <h4 className="text-white font-bold text-xl mb-2">Yakıt Fişi</h4>
                        <p className="text-gray-400 mb-6">
                            Benzin istasyonundan aldığınız fişin fotoğrafını çekin
                        </p>

                        <button
                            onClick={triggerFileSelect}
                            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center transition-all"
                        >
                            <Camera className="w-5 h-5 mr-2" />
                            Fotoğraf Çek / Yükle
                        </button>
                    </div>
                )}

                {/* Receipt Results */}
                {scanType === 'receipt' && receiptResults && (
                    <div className="w-full max-w-sm text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-400" />
                        </div>
                        <h4 className="text-white font-bold text-xl mb-6">Tespit Edilen Veriler</h4>

                        <div className="space-y-3 mb-6">
                            <div className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-gray-400">Birim Fiyat</span>
                                <span className="text-white font-bold text-lg">
                                    {receiptResults.pricePerLiter ? `₺${receiptResults.pricePerLiter}` : '-'}
                                </span>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-gray-400">Toplam Tutar</span>
                                <span className="text-white font-bold text-lg">
                                    {receiptResults.totalAmount ? `₺${receiptResults.totalAmount}` : '-'}
                                </span>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-gray-400">Litre</span>
                                <span className="text-white font-bold text-lg">
                                    {receiptResults.liters ? `${receiptResults.liters} L` : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setReceiptResults(null)}
                                className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center"
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Tekrarla
                            </button>
                            <button
                                onClick={handleConfirmReceipt}
                                className="flex-[2] py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30"
                            >
                                Onayla ve Kullan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
