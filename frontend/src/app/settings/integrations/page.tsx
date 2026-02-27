'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/api';
import { useState } from 'react';
import { CheckCircle, Plug, AlertCircle } from 'lucide-react';

const schema = z.object({
    sellerId: z.string().min(1, 'Satıcı ID zorunludur.'),
    apiKey: z.string().min(1, 'API Key zorunludur.'),
    apiSecret: z.string().min(1, 'API Secret zorunludur.'),
});

type FormData = z.infer<typeof schema>;

export default function IntegrationsPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errMsg, setErrMsg] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setStatus('loading');
        try {
            await apiRequest('/integrations/trendyol/connect', { method: 'POST', body: data });
            setStatus('success');
        } catch (err: unknown) {
            setErrMsg(err instanceof Error ? err.message : 'Bir hata oluştu.');
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-2">Entegrasyon Ayarları</h1>
                <p className="text-slate-400 text-sm mb-8">Trendyol API bilgilerinizi bağlayın.</p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-orange-400 font-bold text-sm">TY</span>
                            </div>
                            <div>
                                <h2 className="text-white font-semibold">Trendyol</h2>
                                <p className="text-slate-500 text-xs">Pazaryeri Entegrasyonu</p>
                            </div>
                        </div>
                        {status === 'success' && (
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1 rounded-full border border-green-500/30"
                            >
                                <CheckCircle className="w-3.5 h-3.5" /> Bağlandı
                            </motion.div>
                        )}
                    </div>

                    {status === 'success' ? (
                        <p className="text-slate-400 text-sm text-center py-4">
                            API anahtarlarınız şifrelenerek kayıt edildi. Ürün senkronizasyonuna başlayabilirsiniz.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {[
                                { name: 'sellerId' as const, label: 'Satıcı ID', placeholder: '123456' },
                                { name: 'apiKey' as const, label: 'API Key', placeholder: 'xxxx-xxxx-xxxx' },
                                { name: 'apiSecret' as const, label: 'API Secret', placeholder: 'xxxx-xxxx-xxxx' },
                            ].map(({ name, label, placeholder }) => (
                                <div key={name}>
                                    <label className="block text-sm text-slate-300 mb-1.5">{label}</label>
                                    <input
                                        {...register(name)}
                                        placeholder={placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                    />
                                    {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]?.message}</p>}
                                </div>
                            ))}

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <AlertCircle className="w-4 h-4" /> {errMsg}
                                </div>
                            )}

                            <motion.button
                                type="submit" disabled={status === 'loading'} whileTap={{ scale: 0.97 }}
                                className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg py-2.5 font-medium text-sm transition-colors"
                            >
                                {status === 'loading' ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    <><Plug className="w-4 h-4" /> Bağlantıyı Test Et ve Kaydet</>
                                )}
                            </motion.button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
