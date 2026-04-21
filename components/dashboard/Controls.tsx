'use client';

import { useStore } from '@/store/useStore';
import { processNewOrder, triggerIncident, runReport } from '@/lib/agents';
import { Play, Pause, Plus, Package, Zap, RotateCcw, AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function Controls() {
    const { running, chaos, speed, setRunning, setChaos, setSpeed, reset, orders, advanceSimTime, restockAll } = useStore();
    const orderTimerRef = useRef<NodeJS.Timeout | null>(null);
    const reportTimerRef = useRef<NodeJS.Timeout | null>(null);
    const tickTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (running) {
            // Sipariş üret
            orderTimerRef.current = setInterval(() => {
                const s = useStore.getState();
                if (s.running && s.orders.length < 150) processNewOrder();
            }, chaos ? 2000 : 3500);

            // Periyodik rapor
            reportTimerRef.current = setInterval(() => runReport(), 10000);

            // Simülasyon saati
            tickTimerRef.current = setInterval(() => {
                const s = useStore.getState();
                advanceSimTime((6 / 60) * s.speed);
            }, 1000);
        }

        return () => {
            if (orderTimerRef.current) clearInterval(orderTimerRef.current);
            if (reportTimerRef.current) clearInterval(reportTimerRef.current);
            if (tickTimerRef.current) clearInterval(tickTimerRef.current);
        };
    }, [running, chaos, advanceSimTime]);

    const handleStart = () => {
        if (running) {
            setRunning(false);
        } else {
            setRunning(true);
            processNewOrder();
        }
    };

    const handleManual = () => {
        if (!running) setRunning(true);
        processNewOrder();
    };

    const handleBulk = () => {
        if (!running) setRunning(true);
        for (let i = 0; i < 10; i++) {
            setTimeout(() => processNewOrder(), i * 250);
        }
    };

    const handleEvent = () => {
        const active = orders.filter(o => o.status === 'transit');
        if (active.length === 0) return;
        const random = active[Math.floor(Math.random() * active.length)];
        triggerIncident(random.id);
    };

    return (
        <div className="p-3 bg-[#0a0f1e] border-t border-[#1f2937] flex gap-2 items-center shrink-0">
            <button
                onClick={handleStart}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${running
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                    }`}
            >
                {running ? <><Pause className="w-4 h-4" />Durdur</> : <><Play className="w-4 h-4" />Başlat</>}
            </button>

            <button onClick={handleManual} className="px-3 py-2 bg-[#1f2937] hover:bg-[#374151] rounded-lg text-sm font-medium border border-[#374151] flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> 1 Sipariş
            </button>

            <button onClick={handleBulk} className="px-3 py-2 bg-[#1f2937] hover:bg-[#374151] rounded-lg text-sm font-medium border border-[#374151] flex items-center gap-1.5">
                <Package className="w-4 h-4" /> 10 Sipariş
            </button>

            <button
                onClick={() => setChaos(!chaos)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border flex items-center gap-1.5 transition ${chaos
                        ? 'bg-yellow-500 text-black border-yellow-400 shadow-lg shadow-yellow-500/30'
                        : 'bg-[#1f2937] hover:bg-[#374151] border-[#374151]'
                    }`}
            >
                <AlertTriangle className="w-4 h-4" /> {chaos ? 'Kaos: AÇIK' : 'Kaos Modu'}
            </button>

            <button onClick={handleEvent} className="px-3 py-2 bg-[#1f2937] hover:bg-[#374151] rounded-lg text-sm font-medium border border-[#374151] flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Olay Tetikle
            </button>

            <button onClick={() => { reset(); restockAll(); }} className="px-3 py-2 bg-red-900/40 hover:bg-red-900/60 rounded-lg text-sm font-medium border border-red-800/50 text-red-300 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> Sıfırla
            </button>

            {/* Speed */}
            <div className="ml-auto flex gap-1 bg-[#1f2937] p-1 rounded-lg border border-[#374151]">
                {[0.5, 1, 2, 5, 10].map(s => (
                    <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${speed === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {s}x
                    </button>
                ))}
            </div>
        </div>
    );
}