'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const registerSchema = z.object({
    email: z.string().email('Geçerli bir e-posta giriniz.'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor.',
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: { emailRedirectTo: `${window.location.origin}/onboarding` },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left: Vision Panel */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden"
            >
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute top-1/3 left-1/3 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-30"
                />
                <motion.div
                    animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 9, repeat: Infinity }}
                    className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-700 rounded-full blur-3xl opacity-20"
                />

                <div className="relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                            My<span className="text-violet-400">Tienda</span>
                        </h1>
                        <p className="text-slate-300 text-lg max-w-sm leading-relaxed">
                            30 saniyede mağazanızı oluşturun. İlk entegrasyonunuzu yapın. Satışa başlayın.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-10 text-slate-400 text-sm"
                    >
                        ✦ Ücretsiz başlayın &nbsp;·&nbsp; Kredi kartı gerekmez
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
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-white mb-2">Neredeyse tamam!</h2>
                                <p className="text-slate-400 text-sm">
                                    E-posta adresinize bir doğrulama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin.
                                </p>
                            </motion.div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-1">Hesap oluşturun</h2>
                                    <p className="text-slate-400 text-sm">Ücretsiz başlayın, istediğiniz zaman yükseltin</p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1.5">E-posta</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="email"
                                                {...register('email')}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                                                placeholder="siz@ornek.com"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1.5">Şifre</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="password"
                                                {...register('password')}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-300 mb-1.5">Şifre (Tekrar)</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="password"
                                                {...register('confirmPassword')}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                                    </div>

                                    {error && (
                                        <motion.div
                                            animate={{ x: [0, -5, 5, -5, 0] }}
                                            transition={{ duration: 0.4 }}
                                            className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                                        >
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {error}
                                        </motion.div>
                                    )}

                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg py-2.5 font-medium text-sm transition-colors"
                                    >
                                        {loading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4" />
                                                Hesap Oluştur
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                <p className="text-center text-sm text-slate-500 mt-6">
                                    Zaten hesabınız var mı?{' '}
                                    <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
                                        Giriş yapın
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
