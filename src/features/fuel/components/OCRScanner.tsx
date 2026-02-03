import React, { useState, useRef } from 'react';
import { Camera, RefreshCw, Check, X, Loader2, Upload } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { parseReceiptText, ExtractedReceiptData } from '../utils/receiptParser';

interface OCRScannerProps {
    onScanComplete: (data: ExtractedReceiptData) => void;
    onClose: () => void;
}

export const OCRScanner: React.FC<OCRScannerProps> = ({ onScanComplete, onClose }) => {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processImage = async (imageUrl: string) => {
        setStatus('scanning');
        try {
            const worker = await createWorker('tur', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.floor(m.progress * 100));
                    }
                }
            });

            const { data: { text } } = await worker.recognize(imageUrl);
            await worker.terminate();

            console.log('OCR Result:', text);
            const extracted = parseReceiptText(text);

            if (!extracted.totalAmount && !extracted.liters) {
                // If parsing completely failed
                setStatus('error');
            } else {
                onScanComplete(extracted);
                setStatus('success');
            }
        } catch (error) {
            console.error('OCR Error:', error);
            setStatus('error');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            processImage(url);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-600" />
                        Fiş Tara (OCR)
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 text-center space-y-6">
                    {status === 'idle' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-800/50">
                                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                    <Upload className="w-8 h-8 text-blue-600" />
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Fişinizin fotoğrafını yükleyin veya çekin.
                                </p>
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Camera className="w-5 h-5" />
                                Fotoğraf Çek / Yükle
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    )}

                    {status === 'scanning' && (
                        <div className="py-8">
                            {previewUrl && (
                                <img src={previewUrl} className="h-48 mx-auto rounded-lg mb-6 object-cover shadow-lg opacity-50" alt="Scanning" />
                            )}
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <p className="text-gray-900 dark:text-white font-medium">Fiş taranıyor... %{progress}</p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-4">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="w-8 h-8 text-red-600" />
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Okunamadı</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                Fişteki verileri okuyamadık. Lütfen daha net bir fotoğraf çekmeyi deneyin.
                            </p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 rounded-xl"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-4">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Başarılı!</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Veriler forma aktarılıyor...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
