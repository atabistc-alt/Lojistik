'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

const colorConfig: Record<string, { bg: string; text: string; border: string; glow: string; dot: string; via: string }> = {
    purple: { 
        bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', 
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]', dot: 'bg-purple-400', via: 'via-purple-500' 
    },
    blue: { 
        bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', 
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]', dot: 'bg-blue-400', via: 'via-blue-500' 
    },
    green: { 
        bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', 
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', dot: 'bg-emerald-400', via: 'via-emerald-500' 
    },
    yellow: { 
        bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', 
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]', dot: 'bg-amber-400', via: 'via-amber-500' 
    },
    pink: { 
        bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', 
        glow: 'shadow-[0_0_15px_rgba(236,72,153,0.15)]', dot: 'bg-pink-400', via: 'via-pink-500' 
    },
    cyan: { 
        bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', 
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]', dot: 'bg-cyan-400', via: 'via-cyan-500' 
    },
};

export function AgentsPanel() {
    const agents = useStore(s => s.agents);

    return (
        <div className="space-y-2.5">
            {agents.map((a, i) => {
                const c = colorConfig[a.color] || colorConfig.blue;

                return (
                    <motion.div
                        key={a.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className={`relative p-3 rounded-xl border transition-all duration-300 overflow-hidden group ${
                            a.busy
                                ? `bg-white/[0.03] border-white/[0.08] ${c.glow}`
                                : 'bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.02] hover:border-white/[0.06]'
                        }`}
                    >
                        {a.busy && (
                            <>
                                {/* Animated left accent line */}
                                <div className={`absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent ${c.via} to-transparent opacity-80`} />
                                
                                {/* Subtle background pulse */}
                                <motion.div 
                                    className={`absolute inset-0 opacity-30 ${c.bg}`}
                                    animate={{ opacity: [0.1, 0.4, 0.1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                                
                                {/* Shimmer passing through */}
                                <motion.div
                                    className="absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    style={{ transform: 'skewX(-20deg)' }}
                                />
                            </>
                        )}
                        
                        <div className="flex items-center gap-3 relative z-10">
                            {/* Icon */}
                            <div className={`w-9 h-9 rounded-xl grid place-items-center text-[15px] border transition-all duration-300 ${a.busy ? `bg-neutral-900 ${c.border} ${c.text} shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]` : 'bg-neutral-900/50 border-white/[0.05] text-neutral-400 group-hover:text-neutral-300 group-hover:border-white/[0.1]'}`}>
                                {a.icon}
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-neutral-200 truncate group-hover:text-white transition-colors">
                                    {a.name}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono">
                                    {/* Status Dot */}
                                    <div className="relative flex h-1.5 w-1.5 items-center justify-center">
                                        {a.busy && (
                                            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${c.dot}`}></span>
                                        )}
                                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 transition-colors duration-300 ${a.busy ? c.dot : 'bg-neutral-600'}`}></span>
                                    </div>
                                    
                                    {/* Status Text */}
                                    <div className="min-w-[60px]">
                                        {a.busy ? (
                                            <span className={`${c.text} font-medium tracking-[0.05em]`}>İŞLİYOR...</span>
                                        ) : (
                                            <span className="text-neutral-500 group-hover:text-neutral-400 transition-colors">{a.role}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Metric Badge */}
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all duration-300 ${
                                a.taskCount > 0
                                    ? `bg-white/[0.03] border-white/[0.06] ${a.busy ? c.text : 'text-neutral-300'}`
                                    : 'bg-transparent border-transparent text-neutral-600'
                            }`}>
                                <span className="text-[9px] uppercase tracking-wider opacity-60 hidden sm:inline-block">Görev</span>
                                <span className="text-[11px] font-mono font-medium">{a.taskCount}</span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}