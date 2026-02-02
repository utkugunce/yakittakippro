import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Hide after 3 seconds of being online
            setTimeout(() => setIsVisible(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setIsVisible(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline && !isVisible) return null;

    return (
        <div
            className={`
                fixed top-0 left-0 right-0 z-[100] transition-all duration-300 transform
                ${isVisible ? 'translate-y-0' : '-translate-y-full'}
            `}
        >
            <div className={`
                flex items-center justify-center gap-2 p-2 text-sm font-medium text-white shadow-md
                ${isOnline ? 'bg-green-500' : 'bg-gray-800'}
            `}>
                {isOnline ? (
                    <span>Bağlantı sağlandı ✅</span>
                ) : (
                    <>
                        <WifiOff className="w-4 h-4" />
                        <span>İnternet bağlantısı yok. Çevrimdışı moddasınız.</span>
                    </>
                )}
            </div>
        </div>
    );
};
