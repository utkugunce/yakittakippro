import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, Volume2, AlertCircle } from 'lucide-react';

interface VoiceEntryProps {
    onData: (data: { distance?: number, consumption?: number, fuelPrice?: number }) => void;
    onClose: () => void;
}

// Web Speech API types
interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResult {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: {
        [index: number]: SpeechRecognitionResult;
        isFinal: boolean;
    };
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: { error: string }) => void;
    onend: () => void;
}

export const VoiceEntry: React.FC<VoiceEntryProps> = ({ onData, onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [parsedData, setParsedData] = useState<{ distance?: number, consumption?: number, fuelPrice?: number }>({});
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            setError('Tarayıcınız ses tanımayı desteklemiyor. Chrome veya Edge kullanın.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'tr-TR';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(finalTranscript);
                parseTranscript(finalTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setError('Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından mikrofon iznini açın.');
            } else if (event.error === 'no-speech') {
                setError('Ses algılanamadı. Tekrar deneyin.');
            } else {
                setError(`Ses tanıma hatası: ${event.error}`);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const parseTranscript = (text: string) => {
        const lowerText = text.toLowerCase()
            .replace(/virgül/g, ',')
            .replace(/nokta/g, '.')
            .replace(/buçuk/g, '.5');

        const data: { distance?: number, consumption?: number, fuelPrice?: number } = {};

        // Parse patterns like "50 km yaptım", "50 kilometre"
        const distancePatterns = [
            /(\d+[.,]?\d*)\s*(?:km|kilometre)/i,
            /(\d+[.,]?\d*)\s*(?:yol|mesafe)/i,
            /yaptım?\s*(\d+[.,]?\d*)/i
        ];

        for (const pattern of distancePatterns) {
            const match = lowerText.match(pattern);
            if (match) {
                data.distance = parseFloat(match[1].replace(',', '.'));
                break;
            }
        }

        // Parse patterns like "6.5 tüketim", "6 buçuk litre"
        const consumptionPatterns = [
            /(\d+[.,]?\d*)\s*(?:tüketim|litre|l\/100)/i,
            /tüketim\s*(\d+[.,]?\d*)/i,
            /(?:ortalama|ort)\s*(\d+[.,]?\d*)/i
        ];

        for (const pattern of consumptionPatterns) {
            const match = lowerText.match(pattern);
            if (match) {
                const val = parseFloat(match[1].replace(',', '.'));
                if (val > 0 && val < 30) { // Reasonable consumption range
                    data.consumption = val;
                    break;
                }
            }
        }

        // Parse patterns like "45 lira", "45.50 TL"
        const pricePatterns = [
            /(\d+[.,]?\d*)\s*(?:lira|tl|₺)/i,
            /fiyat\s*(\d+[.,]?\d*)/i,
            /litresi\s*(\d+[.,]?\d*)/i
        ];

        for (const pattern of pricePatterns) {
            const match = lowerText.match(pattern);
            if (match) {
                const val = parseFloat(match[1].replace(',', '.'));
                if (val > 10 && val < 100) { // Reasonable fuel price range
                    data.fuelPrice = val;
                    break;
                }
            }
        }

        setParsedData(data);
    };

    const startListening = () => {
        if (!recognitionRef.current) return;

        setError(null);
        setTranscript('');
        setParsedData({});

        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (err) {
            console.error('Failed to start recognition:', err);
            setError('Ses tanıma başlatılamadı');
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    const handleConfirm = () => {
        if (Object.keys(parsedData).length > 0) {
            onData(parsedData);
            onClose();
        }
    };

    const hasData = Object.keys(parsedData).length > 0;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="max-w-md w-full text-center space-y-8">
                {/* Title */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Ses ile Kayıt</h2>
                    <p className="text-gray-400 text-sm">
                        "50 km yaptım, 6.5 tüketim" gibi konuşun
                    </p>
                </div>

                {/* Microphone Button */}
                <div className="relative">
                    {isListening && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full bg-blue-500/20 animate-ping" />
                        </div>
                    )}
                    <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={!isSupported}
                        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening
                                ? 'bg-red-500 hover:bg-red-600 scale-110'
                                : 'bg-blue-600 hover:bg-blue-700'
                            } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isListening ? (
                            <MicOff className="w-10 h-10 text-white" />
                        ) : (
                            <Mic className="w-10 h-10 text-white" />
                        )}
                    </button>
                </div>

                {/* Status */}
                <p className={`text-sm font-medium ${isListening ? 'text-blue-400 animate-pulse' : 'text-gray-500'}`}>
                    {isListening ? 'Dinleniyor...' : 'Mikrofona tıklayın'}
                </p>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-300 text-sm text-left">{error}</p>
                    </div>
                )}

                {/* Transcript */}
                {transcript && (
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Volume2 className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-400 uppercase font-bold">Algılanan</span>
                        </div>
                        <p className="text-white text-lg">"{transcript}"</p>
                    </div>
                )}

                {/* Parsed Data */}
                {hasData && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 justify-center">
                            <Check className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-bold">Tespit Edilen Veriler</span>
                        </div>
                        <div className="flex justify-center gap-6">
                            {parsedData.distance && (
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{parsedData.distance}</p>
                                    <p className="text-xs text-gray-400">km</p>
                                </div>
                            )}
                            {parsedData.consumption && (
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{parsedData.consumption}</p>
                                    <p className="text-xs text-gray-400">L/100km</p>
                                </div>
                            )}
                            {parsedData.fuelPrice && (
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">₺{parsedData.fuelPrice}</p>
                                    <p className="text-xs text-gray-400">fiyat</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Confirm Button */}
                {hasData && (
                    <button
                        onClick={handleConfirm}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <Check className="w-5 h-5" />
                        Verileri Kullan
                    </button>
                )}

                {/* Examples */}
                <div className="text-xs text-gray-500 space-y-1">
                    <p>Örnek komutlar:</p>
                    <p>"50 kilometre yaptım"</p>
                    <p>"Tüketim 6.5"</p>
                    <p>"45 lira benzin fiyatı"</p>
                </div>
            </div>
        </div>
    );
};
