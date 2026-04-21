'use client';

import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const tagConfig: Record<string, string> = {
    orch: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ord: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    inv: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rt: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    nt: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    rp: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    sys: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
    event: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const typeConfig: Record<string, { text: string; accent: string; bg: string }> = {
    info: { text: 'text-neutral-300', accent: 'border-l-transparent', bg: 'hover:bg-white/[0.02]' },
    success: { text: 'text-emerald-300', accent: 'border-l-emerald-500/30', bg: 'bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04]' },
    warn: { text: 'text-amber-300', accent: 'border-l-amber-500/50', bg: 'bg-amber-500/[0.03] hover:bg-amber-500/[0.05]' },
    error: { text: 'text-red-300 font-medium', accent: 'border-l-red-500', bg: 'bg-red-500/[0.05] hover:bg-red-500/[0.08]' },
    event: { text: 'text-rose-300 font-medium', accent: 'border-l-rose-500 shadow-[inset_15px_0_20px_-15px_rgba(244,63,94,0.3)]', bg: 'bg-rose-500/[0.05] hover:bg-rose-500/[0.08]' },
};

export function LogPanel() {
    const { logs, clearLogs } = useStore();

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-500/50 shadow-[0_0_8px_rgba(115,115,115,0.5)]" />
                    Olay Akışı
                </div>
                <button onClick={clearLogs}
                    className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium bg-neutral-900/50 hover:bg-red-500/10 text-neutral-500 hover:text-red-400 border border-white/[0.04] hover:border-red-500/20 transition-all duration-200">
                    <Trash2 className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                    Temizle
                </button>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-xl border border-white/[0.04] bg-[#0A0A0A] shadow-inner">
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
                <div className="h-full overflow-y-auto overflow-x-hidden pt-1 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/[0.05] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.1]">
                    <AnimatePresence initial={false} mode="popLayout">
                        {logs.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-16 h-full text-center">
                                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/[0.05] flex items-center justify-center mb-3">
                                    <span className="text-neutral-600 text-lg font-mono">›_</span>
                                </div>
                                <div className="text-sm font-medium text-neutral-400">Terminal Boş</div>
                                <div className="text-[11px] text-neutral-600 mt-1">Ajan olayları bekleniyor...</div>
                            </motion.div>
                        ) : logs.map(log => {
                            const t = typeConfig[log.type] || typeConfig.info;
                            return (
                                <motion.div key={log.id} layout="position" initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`group flex items-start gap-3 py-2 px-3 border-b border-white/[0.02] border-l-2 ${t.accent} ${t.bg} transition-colors`}>
                                    <div className="flex flex-col items-end shrink-0 gap-1.5 pt-0.5 w-[52px]">
                                        <span className="text-[9px] font-mono text-neutral-600 group-hover:text-neutral-400 transition-colors text-right tabular-nums cursor-help" title="Zaman Damgası">
                                            {log.time}
                                        </span>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-wider border ${tagConfig[log.tag] || tagConfig.sys}`}>
                                            {log.tag}
                                        </span>
                                    </div>
                                    <div className={`flex-1 min-w-0 text-[11px] font-mono leading-relaxed pt-0.5 break-words ${t.text}`}
                                        dangerouslySetInnerHTML={{ __html: log.message }} />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
            </div>
        </div>
    );
}