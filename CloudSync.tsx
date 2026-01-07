import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Cloud, CloudOff, LogOut, Download, Upload, Loader2, Check, AlertCircle, Phone } from 'lucide-react';
import {
    supabase,
    isSupabaseConfigured,
    getCurrentUser,
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

    // Phone auth states
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

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

    const formatPhoneNumber = (input: string) => {
        // Remove non-digits
        let digits = input.replace(/\D/g, '');
        // Add Turkey country code if not present
        if (digits.startsWith('0')) {
            digits = '90' + digits.substring(1);
        } else if (!digits.startsWith('90')) {
            digits = '90' + digits;
        }
        return '+' + digits;
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !phone) return;

        setSendingOtp(true);
        setMessage(null);

        const formattedPhone = formatPhoneNumber(phone);

        const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setOtpSent(true);
            setMessage({ type: 'success', text: 'SMS kodu gönderildi!' });
        }

        setSendingOtp(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !phone || !otp) return;

        setLoading(true);
        setMessage(null);

        const formattedPhone = formatPhoneNumber(phone);

        const { error } = await supabase.auth.verifyOtp({
            phone: formattedPhone,
            token: otp,
            type: 'sms'
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        setUser(null);
        setOtpSent(false);
        setPhone('');
        setOtp('');
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
                    Telefon numaranızla giriş yapın ve verilerinizi bulutta yedekleyin.
                </p>

                {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-3">
                        <div className="flex">
                            <span className="inline-flex items-center px-3 text-sm text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border-r-0 border border-gray-300 dark:border-gray-600 rounded-l-lg">
                                +90
                            </span>
                            <input
                                type="tel"
                                placeholder="5XX XXX XX XX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="flex-1 p-2 rounded-r-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={sendingOtp || !phone}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {sendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                            <span>{sendingOtp ? 'Gönderiliyor...' : 'SMS Kodu Gönder'}</span>
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                        <p className="text-sm text-green-600 dark:text-green-400">
                            ✓ Kod gönderildi: +90{phone.replace(/\D/g, '').replace(/^0/, '')}
                        </p>
                        <input
                            type="text"
                            placeholder="6 haneli kod"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full p-3 text-center text-2xl tracking-widest rounded-lg bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                            maxLength={6}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtp(''); }}
                            className="w-full text-sm text-gray-500 hover:underline"
                        >
                            Farklı numara kullan
                        </button>
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
                    <span className="text-xs text-gray-500 dark:text-gray-400">{user.phone}</span>
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
