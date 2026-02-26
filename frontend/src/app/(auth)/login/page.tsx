'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const loginSchema = z.object({
    email: z.string().email('Geçerli bir e-posta giriniz.'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (error) {
            setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
            setLoading(false);
            return;
        }

        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left: Vision Panel */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden"
            >
                {/* Animated blobs */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600 rounded-full blur-3xl opacity-30"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-700 rounded-full blur-3xl opacity-20"
                />

                <div className="relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                            My<span className="text-indigo-400">Tienda</span>
                        </h1>
                        <p className="text-slate-300 text-lg max-w-sm leading-relaxed">
                            Tüm pazaryerlerinizi, stoğunuzu ve müşterilerinizi tek bir akıllı platformdan yönetin.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="mt-12 grid grid-cols-2 gap-4 text-left"
                    >
                        {['Tüm Pazaryerleri', 'Stok Otomasyonu', 'Anlık Analiz', 'Gizli Maliyet Takibi'].map((f) => (
                            <div key={f} className="flex items-center gap-2 text-slate-300 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                {f}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Right: Action Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-950 p-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Glassmorphism card */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-1">Tekrar hoş geldiniz</h2>
                            <p className="text-slate-400 text-sm">Mağazanızı yönetmeye devam edin</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm text-slate-300 mb-1.5">E-posta</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                        placeholder="siz@ornek.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm text-slate-300 mb-1.5">Şifre</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="password"
                                        {...register('password')}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Error message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: [1, 0.7, 1, 0.7, 1], x: [0, -5, 5, -5, 0] }}
                                    transition={{ duration: 0.4 }}
                                    className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileTap={{ scale: 0.97 }}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg py-2.5 font-medium text-sm transition-colors"
                            >
                                {loading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        Giriş Yap
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            Hesabınız yok mu?{' '}
                            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                Ücretsiz kayıt olun
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
