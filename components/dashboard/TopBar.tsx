'use client';

import { Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fmtSimTime } from '@/lib/utils';

export function TopBar() {
    const { simDay, simHours, weather, agents } = useStore();
    const activeAgents = agents.filter(a => !a.busy).length;

    return (
        <header className="h-14 border-b border-white/[0.04] bg-neutral-950/80 backdrop-blur-xl flex items-center justify-between px-5 relative z-50 shrink-0">
            {/* Subtle bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 grid place-items-center shadow-[0_0_15px_rgba(59,130,246,0.25)] relative overflow-hidden group cursor-default">
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col justify-center">
                    <div className="font-bold text-[14px] tracking-tight leading-none text-neutral-100 flex items-center gap-1.5">
                        Lojistik<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span>
                        <span className="px-1.5 py-[1px] rounded bg-white/[0.05] border border-white/[0.05] text-[7px] uppercase tracking-widest text-neutral-400 ml-1 font-medium">Beta</span>
                    </div>
                    <div className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] mt-1.5 font-medium leading-none">
                        Multi-Agent Command
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* System Status Chip */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-medium text-emerald-400/90 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)] cursor-default transition-colors hover:bg-emerald-500/15">
                    <div className="relative flex h-1.5 w-1.5 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    </div>
                    <span>Sistem Aktif <span className="text-emerald-500/40 mx-1">/</span> {activeAgents}/6 Hazır</span>
                </div>
                <div className="w-px h-4 bg-white/[0.06] mx-1" />
                {/* Weather Chip */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.02] border border-white/[0.04] rounded-lg text-[11px] font-medium text-neutral-400 hover:bg-white/[0.04] transition-colors cursor-default">
                    <span className="text-sm leading-none">{weather.icon}</span>
                    <div className="flex items-center gap-1.5 pt-[1px]">
                        <span className="text-neutral-300">Ankara</span>
                        <span className="text-neutral-600">•</span>
                        <span>{weather.text}</span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-neutral-200 font-semibold">{weather.temp}°C</span>
                    </div>
                </div>
                {/* Simulation Time Chip */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#0A0A0A] border border-white/[0.08] rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                    <div className="font-mono text-[11px] font-medium text-neutral-200 tracking-wide flex items-center pt-[1px]">
                        <span className="text-neutral-500 mr-2 uppercase tracking-[0.2em] text-[9px]">T+</span>
                        <span className="text-neutral-400">GÜN </span>
                        <span className="ml-1">{simDay}</span>
                        <span className="text-neutral-600 mx-1.5">/</span>
                        <span className="text-blue-200 font-semibold tracking-tight">{fmtSimTime(simHours)}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}