import React from 'react';
// @ts-ignore
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, DownloadCloud } from 'lucide-react';

export const PwaReloadPrompt: React.FC = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: any) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error)
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shadow-sm ${offlineReady ? 'bg-green-100/50 dark:bg-green-900/30' : 'bg-blue-100/50 dark:bg-blue-900/30'}`}>
                        {offlineReady ? (
                            <DownloadCloud className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                            <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin-slow" />
                        )}
                    </div>

                    <div className="flex-1 pt-0.5">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                            {offlineReady ? 'Çevrimdışı Hazır' : 'Güncelleme Mevcut'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                            {offlineReady
                                ? 'Uygulama artık internet olmadan da çalışabilir.'
                                : 'Yeni özellikler ve iyileştirmeler için uygulamanın yeniden başlatılması gerekiyor.'}
                        </p>

                        <div className="flex gap-2">
                            {needRefresh && (
                                <button
                                    onClick={() => updateServiceWorker(true)}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-md hover:shadow-lg active:scale-95 transform"
                                >
                                    Yenile ve Başlat
                                </button>
                            )}
                            <button
                                onClick={close}
                                className={`px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg transition-colors ${!needRefresh ? 'flex-1' : ''}`}
                            >
                                Kapat
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={close}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors -mt-1 -mr-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
