import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Cloud, CloudOff, LogIn, LogOut, Download, Upload, Loader2, Check, AlertCircle, Mail } from 'lucide-react';
import {
    supabase,
    isSupabaseConfigured,
    getCurrentUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    saveToCloud,
    loadFromCloud
} from './lib/supabase';
import { DailyLog, MaintenanceItem, Vehicle } from './types';

interface CloudSyncProps {
    logs: DailyLog[];
    maintenanceItems: MaintenanceItem[];
    vehicles: Vehicle[];
    onImportLogs: (logs: DailyLog[]) => void;
    onImportMaintenance: (items: MaintenanceItem[]) => void;
    onImportVehicles: (vehicles: Vehicle[]) => void;
}

export const CloudSync: React.FC<CloudSyncProps> = ({
    logs,
    maintenanceItems,
    vehicles,
    onImportLogs,
    onImportMaintenance,
    onImportVehicles
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        checkUser();

        if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        } else {
            setLoading(false);
        }
    }, []);

    const checkUser = async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setMessage(null);
        const { error } = await signInWithGoogle();
        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = isSignUp
            ? await signUpWithEmail(email, password)
            : await signInWithEmail(email, password);

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else if (isSignUp) {
            setMessage({ type: 'success', text: 'Kayıt başarılı! Email onayı gerekebilir.' });
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await signOut();
        setUser(null);
        setMessage({ type: 'success', text: 'Çıkış yapıldı' });
    };

    const handleSaveToCloud = async () => {
        setSyncing(true);
        setMessage(null);

        const monthlyBudget = parseFloat(localStorage.getItem('monthly_budget') || '0');

        const result = await saveToCloud({
            logs,
            maintenanceItems,
            vehicles,
            monthlyBudget
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Veriler buluta yüklendi!' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Yükleme başarısız' });
        }

        setSyncing(false);
    };

    const handleLoadFromCloud = async () => {
        setSyncing(true);
        setMessage(null);

        const result = await loadFromCloud();

        if (result.success && result.data) {
            if (result.data.logs.length > 0) {
                onImportLogs(result.data.logs);
            }
            if (result.data.maintenanceItems.length > 0) {
                onImportMaintenance(result.data.maintenanceItems);
            }
            if (result.data.vehicles.length > 0) {
                onImportVehicles(result.data.vehicles);
            }
            if (result.data.monthlyBudget > 0) {
                localStorage.setItem('monthly_budget', result.data.monthlyBudget.toString());
            }
            setMessage({ type: 'success', text: 'Veriler buluttan indirildi!' });
        } else {
            setMessage({ type: 'error', text: result.error || 'İndirme başarısız' });
        }

        setSyncing(false);
    };

    // Not configured
    if (!isSupabaseConfigured()) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                    <CloudOff className="w-6 h-6 text-gray-400" />
                    <h3 className="font-bold text-gray-600 dark:text-gray-300">Cloud Sync Yapılandırılmamış</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Cloud sync için Supabase yapılandırması gerekli. Vercel ortam değişkenlerini ayarlayın:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-600 dark:text-gray-400">
                    <p>VITE_SUPABASE_URL=your-project-url</p>
                    <p>VITE_SUPABASE_ANON_KEY=your-anon-key</p>
                </div>
            </div>
        );
    }

    // Loading
    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <Cloud className="w-5 h-5 mr-2 text-blue-600" />
                    Cloud Yedekleme
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Verilerinizi bulutta yedekleyin ve cihazlar arası senkronize edin.
                </p>

                {!showEmailForm ? (
                    <div className="space-y-3">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Google ile Giriş</span>
                        </button>

                        <button
                            onClick={() => setShowEmailForm(true)}
                            className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                        >
                            <Mail className="w-5 h-5" />
                            <span>Email ile Giriş</span>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleEmailAuth} className="space-y-3">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            {isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
                        </button>
                        <div className="flex justify-between text-sm">
                            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600 hover:underline">
                                {isSignUp ? 'Hesabım var' : 'Yeni hesap oluştur'}
                            </button>
                            <button type="button" onClick={() => setShowEmailForm(false)} className="text-gray-500 hover:underline">
                                Geri
                            </button>
                        </div>
                    </form>
                )}

                {message && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                        {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span className="text-sm">{message.text}</span>
                    </div>
                )}
            </div>
        );
    }

    // Logged in
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
                    <Cloud className="w-5 h-5 mr-2 text-green-600" />
                    Cloud Yedekleme
                </h3>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                    onClick={handleSaveToCloud}
                    disabled={syncing}
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50"
                >
                    {syncing ? <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" /> : <Upload className="w-6 h-6 text-blue-500 mb-2" />}
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Yükle</span>
                </button>
                <button
                    onClick={handleLoadFromCloud}
                    disabled={syncing}
                    className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 border-2 border-dashed border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all disabled:opacity-50"
                >
                    {syncing ? <Loader2 className="w-6 h-6 text-green-500 animate-spin mb-2" /> : <Download className="w-6 h-6 text-green-500 mb-2" />}
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">İndir</span>
                </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {logs.length} kayıt, {maintenanceItems.length} bakım, {vehicles.length} araç
            </p>

            {message && (
                <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                    {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="text-sm">{message.text}</span>
                </div>
            )}
        </div>
    );
};
