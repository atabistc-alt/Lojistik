'use client';

import { useStore } from '@/store/useStore';
import { fmtMoney } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
    new: { label: 'Yeni', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400', border: 'border-blue-500/20' },
    checking: { label: 'Stok', bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400', border: 'border-yellow-500/20' },
    routing: { label: 'Rota', bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400', border: 'border-purple-500/20' },
    loading: { label: 'Yükleme', bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400', border: 'border-cyan-500/20' },
    transit: { label: 'Yolda', bg: 'bg-indigo-500/10', text: 'text-indigo-400', dot: 'bg-indigo-400', border: 'border-indigo-500/20' },
    delivered: { label: 'Teslim', bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/20' },
    failed: { label: 'Başarısız', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', border: 'border-red-500/20' },
    blocked: { label: 'Engel', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', border: 'border-red-500/20' },
};

export function OrdersList() {
    const { orders, filter, setFilter } = useStore();
    let filtered = orders;
    if (filter === 'active') filtered = orders.filter(o => !['delivered', 'failed', 'blocked'].includes(o.status));
    if (filter === 'done') filtered = orders.filter(o => ['delivered', 'failed', 'blocked'].includes(o.status));
    const list = filtered.slice().reverse().slice(0, 40);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    Siparişler
                </div>
                <div className="flex gap-1 p-1 bg-neutral-900/60 border border-white/[0.04] rounded-lg">
                    {(['all', 'active', 'done'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${filter === f ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04]'}`}>
                            {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Biten'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/[0.05] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.1]">
                <AnimatePresence initial={false} mode="popLayout">
                    {list.length === 0 ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-12 text-center h-full">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-900/50 border border-white/[0.05] flex items-center justify-center mb-4 shadow-inner">
                                <span className="text-neutral-500 text-xl">📋</span>
                            </div>
                            <div className="text-sm font-medium text-neutral-300">Sipariş Bulunamadı</div>
                            <div className="text-[11px] text-neutral-500 mt-1.5 max-w-[200px] leading-relaxed">
                                {filter === 'active' ? 'Şu anda aktif veya yolda olan bir sipariş bulunmuyor.'
                                    : filter === 'done' ? 'Henüz tamamlanmış veya iptal edilmiş bir sipariş yok.'
                                    : 'Sisteme henüz hiç sipariş düşmedi.'}
                            </div>
                        </motion.div>
                    ) : list.map(o => {
                        const st = statusConfig[o.status] || statusConfig.new;
                        return (
                            <motion.div key={o.id} layout initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
                                className="group relative p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl cursor-pointer transition-all duration-300">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-medium text-neutral-500 text-[11px] group-hover:text-neutral-400 transition-colors">#{o.id}</span>
                                        {o.priority === 'high' && (
                                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                                ACİL
                                            </span>
                                        )}
                                        {o.hasEvent && (
                                            <span className="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-amber-500/10 text-[9px] border border-amber-500/20" title="Anomali Raporlandı">⚠️</span>
                                        )}
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border ${st.bg} ${st.text} ${st.border}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                        {st.label}
                                    </div>
                                </div>
                                <div className="text-[13px] font-medium text-neutral-300 group-hover:text-white transition-colors flex items-center gap-2 truncate">
                                    <span className="opacity-80 group-hover:opacity-100 transition-opacity">{o.product.emoji}</span>
                                    <span><span className="text-neutral-500 font-mono mr-1">{o.quantity}×</span>{o.product.name}</span>
                                </div>
                                <div className="text-[11px] text-neutral-500 mt-2.5 flex items-center justify-between font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-neutral-600">→</span>
                                        <span className="text-neutral-400 group-hover:text-neutral-300 transition-colors">{o.city.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-mono">
                                        {o.km && <span>{o.km}km</span>}
                                        {o.km && <span className="text-neutral-700">•</span>}
                                        <span className="text-neutral-300 group-hover:text-white transition-colors">{fmtMoney(o.revenue)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}