'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { XCircle, Scissors, AlertTriangle } from 'lucide-react';

type Order = { id: string; orderNumber: string; product: string; amount: number; status: string };

const MOCK_ORDERS: Order[] = [
    { id: 'pkg-001', orderNumber: 'TY-2024-001', product: 'Siyah Pamuk T-Shirt', amount: 199.99, status: 'Awaiting' },
    { id: 'pkg-002', orderNumber: 'TY-2024-002', product: 'Beyaz Basic Gömlek', amount: 349.90, status: 'Awaiting' },
];

const CANCEL_REASONS = [
    { code: 500, label: '500 — Stok Tükendi' },
    { code: 501, label: '501 — Ürün Hasarlı' },
    { code: 502, label: '502 — Müşteri İsteği' },
    { code: 504, label: '504 — Hatalı Fiyat' },
    { code: 505, label: '505 — Fatura Hatası' },
    { code: 506, label: '506 — Tedarikçi Sorunu' },
];

export default function OrdersPage() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [modalType, setModalType] = useState<'cancel' | 'split' | null>(null);
    const [reasonCode, setReasonCode] = useState<number>(500);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState('');

    const openModal = (order: Order, type: 'cancel' | 'split') => {
        setSelectedOrder(order);
        setModalType(type);
        setResult('');
    };
    const closeModal = () => { setSelectedOrder(null); setModalType(null); };

    const handleCancel = async () => {
        if (!selectedOrder) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/orders/${selectedOrder.id}/unsupplied`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reasonCode, lines: [{ lineId: 1, quantity: 1 }] }),
            });
            setResult(res.ok ? '✓ Sipariş başarıyla iptal edildi.' : '✗ Hata oluştu.');
        } catch { setResult('✗ İstek gönderilemedi.'); }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-2">Siparişler</h1>
                <p className="text-slate-400 text-sm mb-8">Trendyol bekleyen siparişleriniz</p>

                <div className="space-y-3">
                    {MOCK_ORDERS.map((order, i) => (
                        <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-white font-medium">{order.orderNumber}</p>
                                <p className="text-slate-400 text-sm mt-0.5">{order.product}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-semibold">₺{order.amount.toFixed(2)}</p>
                                <p className="text-xs text-indigo-400 mt-0.5">{order.status}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => openModal(order, 'split')}
                                    className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">
                                    <Scissors className="w-3.5 h-3.5" /> Paketi Böl
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => openModal(order, 'cancel')}
                                    className="flex items-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors">
                                    <XCircle className="w-3.5 h-3.5" /> Tedarik Edilemedi
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Cancel Modal */}
                <AnimatePresence>
                    {modalType === 'cancel' && selectedOrder && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={closeModal}>
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2 bg-red-500/20 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
                                    <div>
                                        <h3 className="text-white font-bold">İptal Sebebi Seçin</h3>
                                        <p className="text-slate-400 text-sm">{selectedOrder.orderNumber}</p>
                                    </div>
                                </div>
                                <select value={reasonCode} onChange={e => setReasonCode(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4">
                                    {CANCEL_REASONS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
                                </select>
                                {result && <p className={`text-sm mb-4 ${result.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{result}</p>}
                                <div className="flex gap-3">
                                    <button onClick={closeModal} className="flex-1 text-slate-400 hover:text-white text-sm py-2.5 rounded-lg border border-white/10 transition-colors">Vazgeç</button>
                                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleCancel} disabled={submitting}
                                        className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm py-2.5 rounded-lg font-medium transition-colors">
                                        {submitting ? 'Gönderiliyor...' : 'İptali Onayla'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
