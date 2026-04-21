'use client';

import { Package, Truck, CheckCircle, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fmtMoney } from '@/lib/utils';
import { motion } from 'framer-motion';

export function KPIStrip() {
    const { orders, revenue, eventCount } = useStore();

    const transit = orders.filter(o => o.status === 'transit').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const failed = orders.filter(o => ['failed', 'blocked'].includes(o.status)).length;
    const completed = delivered + failed;
    const rate = completed > 0 ? Math.round((delivered / completed) * 100) : null;

    const kpis = [
        { 
            label: 'Toplam Sipariş', 
            value: orders.length, 
            icon: Package, 
            color: 'blue', 
            sub: orders.length ? 'Akış aktif' : 'Bekleniyor',
            isEmpty: orders.length === 0
        },
        { 
            label: 'Aktif Teslimat', 
            value: transit, 
            icon: Truck, 
            color: 'cyan', 
            sub: 'Yolda',
            isEmpty: transit === 0
        },
        { 
            label: 'Teslim Edildi', 
            value: delivered, 
            icon: CheckCircle, 
            color: 'green', 
            sub: delivered ? `ort. ${fmtMoney(revenue / Math.max(1, delivered))}` : '–',
            isEmpty: delivered === 0
        },
        { 
            label: 'Başarı Oranı', 
            value: rate !== null ? `%${rate}` : '–', 
            icon: Activity, 
            color: 'yellow', 
            sub: 'Bitenlere göre',
            isEmpty: rate === null
        },
        { 
            label: 'Gelir', 
            value: fmtMoney(revenue), 
            icon: TrendingUp, 
            color: 'purple', 
            sub: revenue > 0 ? '↑ artıyor' : '–',
            isEmpty: revenue === 0
        },
        { 
            label: 'Anomali', 
            value: eventCount, 
            icon: AlertTriangle, 
            color: 'red', 
            sub: 'Olay sayısı',
            isEmpty: eventCount === 0
        },
    ];

    const styles: Record<string, { borderTop: string, iconBg: string, iconColor: string, textGrad: string, hoverGlow: string }> = {
        blue: {
            borderTop: 'bg-blue-500',
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
            textGrad: 'from-white to-blue-200/60',
            hoverGlow: 'group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]'
        },
        cyan: {
            borderTop: 'bg-cyan-500',
            iconBg: 'bg-cyan-500/10',
            iconColor: 'text-cyan-400',
            textGrad: 'from-white to-cyan-200/60',
            hoverGlow: 'group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]'
        },
        green: {
            borderTop: 'bg-emerald-500',
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            textGrad: 'from-white to-emerald-200/60',
            hoverGlow: 'group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]'
        },
        yellow: {
            borderTop: 'bg-amber-500',
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-400',
            textGrad: 'from-white to-amber-200/60',
            hoverGlow: 'group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)]'
        },
        purple: {
            borderTop: 'bg-purple-500',
            iconBg: 'bg-purple-500/10',
            iconColor: 'text-purple-400',
            textGrad: 'from-white to-purple-200/60',
            hoverGlow: 'group-hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.15)]'
        },
        red: {
            borderTop: 'bg-red-500',
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-400',
            textGrad: 'from-white to-red-200/60',
            hoverGlow: 'group-hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.15)]'
        },
    };

    return (
        <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 p-4 bg-transparent">
            {kpis.map((k, i) => {
                const Icon = k.icon;
                const s = styles[k.color];
                
                return (
                    <motion.div
                        key={k.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 + 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className={`relative bg-neutral-900/40 backdrop-blur-xl border border-white/[0.04] rounded-2xl p-4 overflow-hidden group transition-all duration-300 hover:bg-neutral-800/60 hover:-translate-y-0.5 ${s.hoverGlow}`}
                    >
                        {/* Animated top border line */}
                        <div className={`absolute top-0 left-0 right-0 h-[2px] ${s.borderTop} opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />
                        
                        {/* Subtle radial glow background on hover */}
                        <div className={`absolute -inset-1 bg-gradient-to-b ${s.iconBg} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 pointer-events-none`} />

                        <div className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.15em] text-neutral-500 font-medium mb-3 relative z-10">
                            <div className={`p-1.5 rounded-lg ${s.iconBg} ring-1 ring-inset ring-white/[0.05] group-hover:ring-white/[0.1] transition-colors`}>
                                <Icon className={`w-3.5 h-3.5 ${s.iconColor}`} />
                            </div>
                            <span className="group-hover:text-neutral-300 transition-colors">{k.label}</span>
                        </div>
                        
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className={`text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br transition-all duration-300 ${
                                k.isEmpty 
                                    ? 'from-neutral-600 to-neutral-800' 
                                    : s.textGrad
                            }`}>
                                {k.value}
                            </div>
                            <div className={`text-[11px] font-medium transition-colors duration-300 ${
                                k.isEmpty ? 'text-neutral-700' : 'text-neutral-500 group-hover:text-neutral-400'
                            }`}>
                                {k.sub}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}