'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Plug, ArrowRight, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const step1Schema = z.object({
    name: z.string().min(2, 'Mağaza adı en az 2 karakter olmalıdır.').max(60, 'Mağaza adı çok uzun.'),
});

type Step1Data = z.infer<typeof step1Schema>;

const steps = ['Mağaza Adı', 'Pazaryeri'];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [storeName, setStoreName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
    });

    const saveStoreName = async (data: Step1Data) => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }

        await supabase.from('stores').update({ name: data.name }).eq('owner_id', user.id);
        setStoreName(data.name);
        setLoading(false);
        setCurrentStep(1);
    };

    const finishOnboarding = () => router.push('/dashboard');

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
            {/* Logo */}
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-white mb-10"
            >
                My<span className="text-indigo-400">Tienda</span>
            </motion.h1>

            {/* Step progress */}
            <div className="flex items-center gap-3 mb-10">
                {steps.map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${i < currentStep ? 'bg-indigo-600 text-white' :
                                i === currentStep ? 'bg-indigo-500 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950' :
                                    'bg-white/10 text-slate-500'
                            }`}>
                            {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={`text-sm ${i === currentStep ? 'text-white' : 'text-slate-500'}`}>{step}</span>
                        {i < steps.length - 1 && <div className="w-8 h-px bg-white/10" />}
                    </div>
                ))}
            </div>

            {/* Step card */}
            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <Store className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Mağazanıza isim verin</h2>
                                    <p className="text-slate-400 text-sm">İstediğiniz zaman değiştirebilirsiniz</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(saveStoreName)} className="space-y-5">
                                <div>
                                    <input
                                        {...register('name')}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                        placeholder="Örn: Moda House, Teknoloji Dünyası..."
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                                </div>

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
                                        <>Devam Et <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}

                    {currentStep === 1 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-violet-500/20 rounded-lg">
                                    <Plug className="w-5 h-5 text-violet-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Pazaryeri bağlayın</h2>
                                    <p className="text-slate-400 text-sm">Daha sonra da yapabilirsiniz</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {[
                                    { name: 'Trendyol', color: 'bg-orange-500/20 border-orange-500/30 text-orange-300' },
                                    { name: 'Hepsiburada', color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' },
                                    { name: 'N11', color: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
                                ].map((p) => (
                                    <motion.button
                                        key={p.name}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${p.color}`}
                                        onClick={() => {/* Future: open API key modal */ }}
                                    >
                                        {p.name} — Bağlan
                                    </motion.button>
                                ))}
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={finishOnboarding}
                                className="w-full text-center text-slate-400 hover:text-white text-sm py-2 transition-colors"
                            >
                                Şimdilik atla, panele git →
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
