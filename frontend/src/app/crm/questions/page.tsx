'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';

type Question = { id: string; product: string; question: string; askedAt: string };

const MOCK_QUESTIONS: Question[] = [
    { id: 'q-001', product: 'Siyah Pamuk T-Shirt', question: 'Bu ürün yıkamada renk verir mi?', askedAt: '2 saat önce' },
    { id: 'q-002', product: 'Lacivert Chino Pantolon', question: 'Boy uzun gelir mi, kısa boyluya uyar mı?', askedAt: '5 saat önce' },
];

export default function QnaPage() {
    const [selected, setSelected] = useState<Question | null>(MOCK_QUESTIONS[0]);
    const [answer, setAnswer] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState<Record<string, boolean>>({});

    const sendAnswer = async () => {
        if (!selected || !answer.trim()) return;
        setSending(true);
        try {
            await fetch(`/api/qna/${selected.id}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer }),
            });
            setSent(prev => ({ ...prev, [selected.id]: true }));
            setAnswer('');
        } finally { setSending(false); }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-xl font-bold text-white">Müşteri Soruları (CRM)</h1>
                <p className="text-slate-400 text-sm mt-0.5">Yanıt bekleyen sorular — Trendyol</p>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left: Question list */}
                <div className="w-80 border-r border-white/10 overflow-y-auto">
                    {MOCK_QUESTIONS.map(q => (
                        <motion.button key={q.id} whileTap={{ scale: 0.98 }} onClick={() => setSelected(q)}
                            className={`w-full text-left p-4 border-b border-white/5 transition-colors ${selected?.id === q.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                            <div className="flex items-start gap-2">
                                <MessageCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-white text-sm font-medium line-clamp-2">{q.question}</p>
                                    <p className="text-slate-500 text-xs mt-1">{q.product} · {q.askedAt}</p>
                                    {sent[q.id] && <span className="text-green-400 text-xs">✓ Cevaplandı</span>}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Right: Chat window */}
                <div className="flex-1 flex flex-col p-6">
                    <AnimatePresence mode="wait">
                        {selected ? (
                            <motion.div key={selected.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col h-full">
                                <p className="text-slate-400 text-xs mb-1">{selected.product}</p>

                                {/* Customer message bubble */}
                                <div className="flex-1">
                                    <div className="inline-block bg-white/10 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 max-w-sm">
                                        <p className="text-white text-sm">{selected.question}</p>
                                    </div>
                                </div>

                                {/* Answer area */}
                                {sent[selected.id] ? (
                                    <div className="text-center text-green-400 text-sm py-4">✓ Cevabınız Trendyol'a iletildi.</div>
                                ) : (
                                    <div className="flex gap-3 mt-4">
                                        <textarea
                                            value={answer} onChange={e => setAnswer(e.target.value)}
                                            placeholder="Cevabınızı yazın..."
                                            rows={3}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
                                        />
                                        <motion.button whileTap={{ scale: 0.95 }} onClick={sendAnswer} disabled={sending || !answer.trim()}
                                            className="px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-colors self-end py-3">
                                            <Send className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-600">
                                Bir soru seçin
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
