'use client';

import { TopBar } from './dashboard/TopBar';
import { AgentsPanel } from './dashboard/AgentsPanel';
import { KPIStrip } from './dashboard/KPIStrip';
import { OrdersList } from './dashboard/OrdersList';
import { LogPanel } from './dashboard/LogPanel';
import { Controls } from './dashboard/Controls';
import { TurkeyMap } from './map/TurkeyMap';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/lib/data';
import { fmtSimTime } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { stock, fleet, simDay, simHours } = useStore();

    return (
        <div className="h-screen flex flex-col bg-neutral-950 text-neutral-50 overflow-hidden font-sans selection:bg-white/10 antialiased">
            <TopBar />

            <div className="flex-1 grid grid-cols-[280px_1fr_340px] overflow-hidden relative">

                {/* Background Noise/Grid for outer wrapper */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none mix-blend-screen" />

                {/* LEFT SIDEBAR */}
                <aside className="bg-neutral-900/30 border-r border-white/[0.04] overflow-y-auto p-4 flex flex-col gap-8 relative z-10 backdrop-blur-xl">
                    <section>
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-neutral-500 font-medium mb-4">
                            <span className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                AI Ajanları
                            </span>
                            <span className="tabular-nums font-mono text-neutral-400">6/6</span>
                        </div>
                        <AgentsPanel />
                    </section>

                    <section>
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-neutral-500 font-medium mb-4">
                            <span className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                Stok Seviyeleri
                            </span>
                            <button
                                onClick={() => useStore.getState().restockAll()}
                                className="px-2 py-1 rounded-md text-[10px] font-medium bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 transition-all border border-white/[0.05] hover:border-white/[0.1] active:scale-95"
                            >
                                + Yenile
                            </button>
                        </div>
                        <div className="space-y-3">
                            {PRODUCTS.slice(0, 8).map(p => {
                                const s = stock[p.name];
                                const pct = Math.min(100, (s / 80) * 100);
                                const isLow = s < 10;
                                const isMedium = s < 25;
                                const colorClass = isLow
                                    ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                                    : isMedium
                                        ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                                        : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';

                                return (
                                    <div key={p.name} className="group">
                                        <div className="flex justify-between mb-1.5 text-xs text-neutral-400 group-hover:text-neutral-200 transition-colors">
                                            <span className="truncate flex items-center gap-1.5">
                                                <span className="opacity-70 group-hover:opacity-100 transition-opacity">{p.emoji}</span>
                                                {p.name}
                                            </span>
                                            <span className="tabular-nums font-mono text-[10px]">{s}</span>
                                        </div>
                                        <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02]">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.7, ease: "easeOut" }}
                                                className={`h-full rounded-full ${colorClass}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-neutral-500 font-medium mb-4">
                            <span className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                Filo <span className="normal-case tracking-normal opacity-60">({fleet.length} araç)</span>
                            </span>
                        </div>
                        <div className="space-y-2">
                            {fleet.map(v => {
                                const loadPct = Math.round((v.load / v.capacity) * 100);
                                const st = v.status === 'idle'
                                    ? { bg: 'bg-emerald-500', ring: 'ring-emerald-500/20', label: 'Boşta' }
                                    : v.status === 'broken'
                                        ? { bg: 'bg-red-500', ring: 'ring-red-500/20', label: 'Arızalı' }
                                        : { bg: 'bg-amber-500', ring: 'ring-amber-500/20', label: `#${v.currentOrder}` };

                                return (
                                    <div key={v.id} className="group flex items-start gap-3 p-2.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] rounded-xl transition-all duration-300">
                                        <div className={`w-1.5 h-1.5 rounded-full ${st.bg} mt-1.5 shrink-0 ring-4 ${st.ring}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-neutral-300 truncate group-hover:text-white transition-colors">
                                                {v.id} <span className="text-neutral-700 mx-1">/</span> <span className="text-neutral-400">{v.driver}</span>
                                            </div>
                                            <div className="text-[10px] text-neutral-500 mt-1 font-mono flex items-center gap-1.5">
                                                <span className={v.status === 'broken' ? 'text-red-400' : ''}>{st.label}</span>
                                                <span className="text-neutral-800">•</span>
                                                <span>Yük %{loadPct}</span>
                                                <span className="text-neutral-800">•</span>
                                                <span>⛽ {Math.round(v.fuel)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </aside>

                {/* CENTER */}
                <main className="flex flex-col overflow-hidden relative z-0">
                    <div className="relative z-20">
                        <KPIStrip />
                    </div>

                    <div className="flex-1 relative m-4 mt-0 rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_0_40px_rgba(0,0,0,0.3)] group bg-neutral-950/50">
                        <TurkeyMap />

                        {/* Map Inner Vignette */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] z-0" />

                        {/* Simulation Time Overlay */}
                        <div className="absolute top-4 left-4 bg-neutral-950/60 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 z-10 shadow-2xl transition-all hover:bg-neutral-950/80">
                            <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-medium mb-1.5 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                                Simülasyon Zamanı
                            </div>
                            <div className="font-mono text-sm tracking-tight text-neutral-100 flex items-center gap-2">
                                <span><span className="text-neutral-500">Gün</span> {simDay}</span>
                                <span className="text-neutral-700">/</span>
                                <span>{fmtSimTime(simHours)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-20 px-4 pb-4">
                        <Controls />
                    </div>
                </main>

                {/* RIGHT SIDEBAR */}
                <aside className="bg-neutral-900/30 border-l border-white/[0.04] overflow-hidden flex flex-col p-4 gap-4 relative z-10 backdrop-blur-xl">
                    <div className="flex-1 min-h-0 flex flex-col relative">
                        {/* Glow effect behind panels */}
                        <div className="absolute -inset-4 bg-gradient-to-b from-blue-500/5 to-transparent blur-2xl pointer-events-none opacity-50" />
                        <OrdersList />
                    </div>
                    <div className="flex-1 min-h-0 flex flex-col relative">
                        <LogPanel />
                    </div>
                </aside>
            </div>
        </div>
    );
}
