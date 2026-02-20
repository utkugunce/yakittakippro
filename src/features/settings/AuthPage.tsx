import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '../../lib/supabase';

interface AuthPageProps {
    onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error: signInError } = await signInWithEmail(email, password);
                if (signInError) throw signInError;
            } else {
                const { error: signUpError } = await signUpWithEmail(email, password);
                if (signUpError) throw signUpError;
                // Auto login after signup might require checking session, but let's assume success
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-in fade-in zoom-in duration-300">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">
                        {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isLogin ? 'Verilerinizi bulutla eşitlemek için giriş yapın.' : 'Araç masraflarınızı güvenle bulutta saklayın.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-shadow outline-none"
                                placeholder="ornek@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Şifre</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-shadow outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors focus:ring-4 focus:ring-primary-500/20 disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : isLogin ? (
                            <>
                                <LogIn className="w-5 h-5" />
                                Giriş Yap
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Kayıt Ol
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                        {isLogin ? "Hesabınız yok mu? Yeni hesap oluşturun." : "Zaten hesabınız var mı? Giriş yapın."}
                    </button>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Güvenli bulut senkronizasyonu Supabase altyapısı ile sağlanmaktadır. Verileriniz şifrelenerek saklanır.
            </div>
        </div>
    );
};
