import React from 'react';
// @ts-ignore
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

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
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-sm">
            <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                        {offlineReady ? 'Uygulama Hazır' : 'Yeni Sürüm Mevcut'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {offlineReady
                            ? 'Uygulama çevrimdışı kullanım için hazır.'
                            : 'Yeni içerik mevcut, güncellemek için yenileyin.'}
                    </p>
                    <div className="flex gap-2">
                        {needRefresh && (
                            <button
                                onClick={() => updateServiceWorker(true)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Yenile
                            </button>
                        )}
                        <button
                            onClick={close}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
                <button
                    onClick={close}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
