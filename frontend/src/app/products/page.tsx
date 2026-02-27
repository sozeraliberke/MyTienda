'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/api';
import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

type Product = {
    id: string;
    name: string;
    barcode: string;
    stock: number;
    price: number;
    status: 'approved' | 'rejected' | 'archived';
};

// Mock data — will be replaced by real API call
const MOCK_PRODUCTS: Product[] = [
    { id: '1', name: 'Siyah Pamuk T-Shirt', barcode: '8683456789012', stock: 45, price: 199.99, status: 'approved' },
    { id: '2', name: 'Beyaz Basic Gömlek', barcode: '8683456789013', stock: 0, price: 349.90, status: 'rejected' },
    { id: '3', name: 'Lacivert Chino Pantolon', barcode: '8683456789014', stock: 12, price: 599.00, status: 'approved' },
];

const STATUS_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    approved: { label: 'Onaylı', className: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle className="w-3 h-3" /> },
    rejected: { label: 'Reddedildi', className: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle className="w-3 h-3" /> },
    archived: { label: 'Arşiv', className: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: <Clock className="w-3 h-3" /> },
};

export default function ProductsPage() {
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState('');

    const triggerSync = async () => {
        setSyncing(true);
        setSyncMsg('');
        try {
            await apiRequest('/integrations/trendyol/sync-products', { method: 'POST' });
            setSyncMsg('✓ Senkronizasyon kuyruğa alındı. Arka planda devam ediyor...');
        } catch (err: unknown) {
            setSyncMsg(err instanceof Error ? err.message : 'Senkronizasyon başlatılamadı.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Ürünler</h1>
                        <p className="text-slate-400 text-sm mt-1">Tüm pazaryeri ürünleriniz</p>
                    </div>
                    <motion.button
                        onClick={triggerSync} disabled={syncing} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                    >
                        <motion.div animate={syncing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: syncing ? Infinity : 0, ease: 'linear' }}>
                            <RefreshCw className="w-4 h-4" />
                        </motion.div>
                        Pazaryerinden Eşitle
                    </motion.button>
                </div>

                {syncMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-6 text-sm text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-3">
                        {syncMsg}
                    </motion.div>
                )}

                {/* Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                {['Ürün Adı', 'Barkod', 'Stok', 'Fiyat', 'Durum'].map(h => (
                                    <th key={h} className="text-left text-xs font-medium text-slate-400 px-6 py-4">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {MOCK_PRODUCTS.map((p, i) => {
                                    const badge = STATUS_BADGE[p.status];
                                    return (
                                        <motion.tr key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-sm text-white font-medium">{p.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-400 font-mono">{p.barcode}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={p.stock === 0 ? 'text-red-400' : 'text-slate-300'}>{p.stock} adet</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-300">₺{p.price.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${badge.className}`}>
                                                    {badge.icon} {badge.label}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
