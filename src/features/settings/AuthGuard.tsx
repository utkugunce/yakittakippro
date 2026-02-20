import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../../lib/supabase';
import { AuthPage } from './AuthPage';
import { Cloud, CheckCircle, RefreshCw } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    };

    useEffect(() => {
        checkUser();

        // Listen for auth changes could be added here for a completely reactive flow
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Bulut bağlantısı kontrol ediliyor...</p>
            </div>
        );
    }

    if (!user) {
        return <AuthPage onSuccess={checkUser} />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Sync Header Status */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Bulut Senkronizasyonu Aktif</h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">{user.email}</p>
                    </div>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>

            {/* Render protected child content */}
            {children}
        </div>
    );
};
