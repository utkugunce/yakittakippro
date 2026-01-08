import React, { useRef, useState } from 'react';
import { Camera, X, Upload, Loader2, Check, AlertTriangle, RefreshCcw, Receipt, Gauge, ArrowLeft } from 'lucide-react';
import { scanReceipt, scanDashboard, ScanResult, DashboardScanResult } from './utils/ocrUtils';

type ScanType = 'receipt' | 'dashboard';

interface PhotoScannerProps {
    onDashboardData?: (data: { odometer?: number, consumption?: number, distance?: number }) => void;
    onReceiptData?: (data: { fuelPrice?: number, total?: number, liters?: number, date?: string }) => void;
    onClose: () => void;
}

export const PhotoScanner: React.FC<PhotoScannerProps> = ({ onDashboardData, onReceiptData, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [dashboardResult, setDashboardResult] = useState<DashboardScanResult | null>(null);
    const [scanType, setScanType] = useState<ScanType | null>(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Kameraya erişilemedi. Lütfen izinleri kontrol edin veya dosya yükleyin.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setImage(dataUrl);
                stopCamera();
                processImage(dataUrl);
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setImage(dataUrl);
                processImage(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = async (dataUrl: string) => {
        setLoading(true);
        setError(null);
        try {
            // Convert DataURL to File
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], "scan.jpg", { type: "image/jpeg" });

            if (scanType === 'receipt') {
                const result = await scanReceipt(file);
                setScanResult(result);

                // Auto-apply confident results
                if (result.unitPrice || result.totalAmount) {
                    if (onReceiptData) {
                        onReceiptData({
                            fuelPrice: result.unitPrice,
                            total: result.totalAmount,
                            liters: result.liters,
                            date: result.date
                        });
                    }
                }
            } else if (scanType === 'dashboard') {
                const result = await scanDashboard(file);
                setDashboardResult(result);

                // Auto-apply confident results
                if (result.odometer || result.consumption || result.distance) {
                    if (onDashboardData) {
                        onDashboardData({
                            odometer: result.odometer,
                            consumption: result.consumption,
                            distance: result.distance
                        });
                    }
                }
            }

        } catch (err) {
            console.error(err);
            setError("Görüntü işlenirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setImage(null);
        setScanResult(null);
        setDashboardResult(null);
        setError(null);
    };

    const resetAll = () => {
        reset();
        setScanType(null);
        stopCamera();
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-black/50 backdrop-blur-sm absolute top-0 w-full z-10 text-white">
                <div className="flex items-center">
                    {scanType && (
                        <button
                            onClick={resetAll}
                            className="p-2 mr-2 bg-white/10 rounded-full hover:bg-white/20"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <h3 className="font-bold flex items-center">
                        {scanType === 'receipt' && <Receipt className="w-5 h-5 mr-2" />}
                        {scanType === 'dashboard' && <Gauge className="w-5 h-5 mr-2" />}
                        {!scanType && <Camera className="w-5 h-5 mr-2" />}
                        {scanType === 'receipt' ? 'Yakıt Fişi Tara' : scanType === 'dashboard' ? 'Gösterge Paneli Tara' : 'Fotoğraftan Veri Al'}
                    </h3>
                </div>
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                {error && (
                    <div className="absolute top-20 left-4 right-4 z-20 bg-red-500/90 text-white p-4 rounded-xl text-center shadow-lg backdrop-blur-sm">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Step 1: Scan Type Selection */}
                {!scanType ? (
                    <div className="text-center p-8">
                        <p className="text-gray-400 mb-8 text-lg">Ne taramak istiyorsunuz?</p>

                        <div className="flex flex-col gap-4 max-w-xs mx-auto">
                            <button
                                onClick={() => setScanType('receipt')}
                                className="flex items-center p-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:scale-105 transition-all"
                            >
                                <Receipt className="w-10 h-10 mr-4" />
                                <div className="text-left">
                                    <p className="text-lg">Yakıt Fişi</p>
                                    <p className="text-sm font-normal opacity-80">Fiyat, litre, tutar</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setScanType('dashboard')}
                                className="flex items-center p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-white font-bold shadow-lg shadow-blue-500/30 hover:scale-105 transition-all"
                            >
                                <Gauge className="w-10 h-10 mr-4" />
                                <div className="text-left">
                                    <p className="text-lg">Gösterge Paneli</p>
                                    <p className="text-sm font-normal opacity-80">KM, tüketim, mesafe</p>
                                </div>
                            </button>
                        </div>
                    </div>
                ) : !image ? (
                    <>
                        {/* Camera Preview or Upload Options */}
                        {stream ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center p-8">
                                <p className="text-gray-400 mb-6">
                                    {scanType === 'receipt'
                                        ? 'Yakıt fişinizin net bir fotoğrafını çekin veya yükleyin.'
                                        : 'Araç gösterge panelinin net bir fotoğrafını çekin veya yükleyin.'
                                    }
                                </p>
                                <button
                                    onClick={startCamera}
                                    className={`px-6 py-3 rounded-full text-white font-bold flex items-center mx-auto mb-4 ${scanType === 'receipt'
                                            ? 'bg-orange-600 hover:bg-orange-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    <Camera className="w-5 h-5 mr-2" />
                                    Kamerayı Aç
                                </button>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <button className="px-6 py-3 bg-gray-700 rounded-full text-white font-bold flex items-center mx-auto">
                                        <Upload className="w-5 h-5 mr-2" />
                                        Dosya Yükle
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Capture Button */}
                        {stream && (
                            <button
                                onClick={capturePhoto}
                                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full border-4 border-gray-300 shadow-xl flex items-center justify-center active:scale-95 transition-all"
                            >
                                <div className="w-16 h-16 bg-white rounded-full border-2 border-black" />
                            </button>
                        )}
                    </>
                ) : (
                    // Result View
                    <div className="w-full h-full flex flex-col bg-gray-900">
                        <div className="flex-1 relative">
                            <img src={image} alt="Scan" className="w-full h-full object-contain" />
                            {loading && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                    <p className="text-white font-bold text-lg animate-pulse">Analiz ediliyor...</p>
                                    <p className="text-gray-400 text-sm mt-2">Tesseract OCR çalışıyor</p>
                                </div>
                            )}
                        </div>

                        {/* Receipt Results */}
                        {!loading && scanResult && scanType === 'receipt' && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-t-3xl animate-in slide-in-from-bottom-full transition-all duration-500">
                                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />

                                <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center">
                                    <Check className="w-5 h-5 text-green-500 mr-2" />
                                    Tespit Edilen Veriler (Fiş)
                                </h4>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Tarih</p>
                                        <p className="font-bold text-lg text-gray-800 dark:text-white">
                                            {scanResult.date || <span className="text-gray-400 text-sm">-</span>}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Toplam Tutar</p>
                                        <p className="font-bold text-lg text-gray-800 dark:text-white">
                                            {scanResult.totalAmount ? `₺${scanResult.totalAmount}` : <span className="text-gray-400 text-sm">-</span>}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Birim Fiyat</p>
                                        <p className="font-bold text-lg text-gray-800 dark:text-white">
                                            {scanResult.unitPrice ? `₺${scanResult.unitPrice}` : <span className="text-gray-400 text-sm">-</span>}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Litre</p>
                                        <p className="font-bold text-lg text-gray-800 dark:text-white">
                                            {scanResult.liters ? `${scanResult.liters} L` : <span className="text-gray-400 text-sm">-</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={reset}
                                        className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-bold flex items-center justify-center"
                                    >
                                        <RefreshCcw className="w-4 h-4 mr-2" />
                                        Tekrar Tara
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-[2] py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30"
                                    >
                                        Onayla ve Kullan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Dashboard Results */}
                        {!loading && dashboardResult && scanType === 'dashboard' && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-t-3xl animate-in slide-in-from-bottom-full transition-all duration-500">
                                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />

                                <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center">
                                    <Check className="w-5 h-5 text-green-500 mr-2" />
                                    Tespit Edilen Veriler (Gösterge)
                                </h4>

                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Kilometre</p>
                                        <p className="font-bold text-lg text-gray-800 dark:text-white">
                                            {dashboardResult.odometer ? `${dashboardResult.odometer.toLocaleString('tr-TR')} km` : <span className="text-gray-400 text-sm">-</span>}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Tüketim</p>
                                        <p className="font-bold text-lg text-gray-800 dark:text-white">
                                            {dashboardResult.consumption ? `${dashboardResult.consumption} L/100` : <span className="text-gray-400 text-sm">-</span>}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Günlük KM</p>
                                        <p className="font-bold text-lg text-gray-800 dark:text-white">
                                            {dashboardResult.distance ? `${dashboardResult.distance} km` : <span className="text-gray-400 text-sm">-</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={reset}
                                        className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-bold flex items-center justify-center"
                                    >
                                        <RefreshCcw className="w-4 h-4 mr-2" />
                                        Tekrar Tara
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30"
                                    >
                                        Onayla ve Kullan
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
