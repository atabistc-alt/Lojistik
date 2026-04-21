import { create } from 'zustand';
import { Agent, Vehicle, Order, LogEntry, Product } from '@/types';
import { PRODUCTS } from '@/lib/data';

interface Store {
    // State
    agents: Agent[];
    fleet: Vehicle[];
    orders: Order[];
    stock: Record<string, number>;
    logs: LogEntry[];
    running: boolean;
    chaos: boolean;
    speed: number;
    simHours: number;
    simDay: number;
    revenue: number;
    eventCount: number;
    filter: 'all' | 'active' | 'done';
    weather: { id: string; icon: string; text: string; temp: number };

    // Actions
    setRunning: (v: boolean) => void;
    setChaos: (v: boolean) => void;
    setSpeed: (v: number) => void;
    setFilter: (v: 'all' | 'active' | 'done') => void;
    setAgentBusy: (id: string, busy: boolean) => void;
    addOrder: (o: Order) => void;
    updateOrder: (id: number, patch: Partial<Order>) => void;
    updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
    addLog: (log: Omit<LogEntry, 'id'>) => void;
    clearLogs: () => void;
    setStock: (product: string, qty: number) => void;
    restockAll: () => void;
    addRevenue: (amount: number) => void;
    incrementEventCount: () => void;
    advanceSimTime: (hours: number) => void;
    reset: () => void;
}

const initialAgents: Agent[] = [
    { id: 'orch', name: 'Orchestrator', role: 'Görev yönetimi', icon: '🧠', color: 'purple', busy: false, taskCount: 0 },
    { id: 'ord', name: 'Sipariş Ajanı', role: 'Sipariş işleme', icon: '📋', color: 'blue', busy: false, taskCount: 0 },
    { id: 'inv', name: 'Envanter Ajanı', role: 'Stok yönetimi', icon: '📦', color: 'green', busy: false, taskCount: 0 },
    { id: 'rt', name: 'Rota Ajanı', role: 'Rota optimizasyonu', icon: '🗺️', color: 'yellow', busy: false, taskCount: 0 },
    { id: 'nt', name: 'Bildirim Ajanı', role: 'Müşteri iletişimi', icon: '📢', color: 'pink', busy: false, taskCount: 0 },
    { id: 'rp', name: 'Raporlama Ajanı', role: 'Analiz & rapor', icon: '📊', color: 'cyan', busy: false, taskCount: 0 },
];

const initialFleet: Vehicle[] = [
    { id: 'TR-01', driver: 'Ahmet Yılmaz', capacity: 1000, load: 0, status: 'idle', currentOrder: null, km: 0, fuel: 100 },
    { id: 'TR-02', driver: 'Mehmet Demir', capacity: 1500, load: 0, status: 'idle', currentOrder: null, km: 0, fuel: 100 },
    { id: 'TR-03', driver: 'Ayşe Kaya', capacity: 800, load: 0, status: 'idle', currentOrder: null, km: 0, fuel: 100 },
    { id: 'TR-04', driver: 'Fatma Öztürk', capacity: 1200, load: 0, status: 'idle', currentOrder: null, km: 0, fuel: 100 },
    { id: 'TR-05', driver: 'Hasan Çelik', capacity: 2000, load: 0, status: 'idle', currentOrder: null, km: 0, fuel: 100 },
    { id: 'TR-06', driver: 'Zeynep Aydın', capacity: 1000, load: 0, status: 'idle', currentOrder: null, km: 0, fuel: 100 },
];

const initialStock: Record<string, number> = {};
PRODUCTS.forEach(p => { initialStock[p.name] = 80; });

export const useStore = create<Store>((set) => ({
    agents: initialAgents,
    fleet: initialFleet,
    orders: [],
    stock: initialStock,
    logs: [],
    running: false,
    chaos: false,
    speed: 1,
    simHours: 8,
    simDay: 1,
    revenue: 0,
    eventCount: 0,
    filter: 'active',
    weather: { id: 'clear', icon: '☀️', text: 'Açık', temp: 18 },

    setRunning: (v) => set({ running: v }),
    setChaos: (v) => set({ chaos: v }),
    setSpeed: (v) => set({ speed: v }),
    setFilter: (v) => set({ filter: v }),

    setAgentBusy: (id, busy) => set(s => ({
        agents: s.agents.map(a => a.id === id
            ? { ...a, busy, taskCount: busy ? a.taskCount + 1 : a.taskCount }
            : a)
    })),

    addOrder: (o) => set(s => ({ orders: [...s.orders, o] })),

    updateOrder: (id, patch) => set(s => ({
        orders: s.orders.map(o => o.id === id ? { ...o, ...patch } : o)
    })),

    updateVehicle: (id, patch) => set(s => ({
        fleet: s.fleet.map(v => v.id === id ? { ...v, ...patch } : v)
    })),

    addLog: (log) => set(s => ({
        logs: [{ ...log, id: Math.random().toString(36).slice(2) }, ...s.logs].slice(0, 120)
    })),

    clearLogs: () => set({ logs: [] }),

    setStock: (product, qty) => set(s => ({
        stock: { ...s.stock, [product]: qty }
    })),

    restockAll: () => {
        const fresh: Record<string, number> = {};
        PRODUCTS.forEach(p => { fresh[p.name] = 80; });
        set({ stock: fresh });
    },

    addRevenue: (amount) => set(s => ({ revenue: s.revenue + amount })),
    incrementEventCount: () => set(s => ({ eventCount: s.eventCount + 1 })),

    advanceSimTime: (hours) => set(s => {
        let newH = s.simHours + hours;
        let newDay = s.simDay;
        while (newH >= 24) { newH -= 24; newDay++; }
        return { simHours: newH, simDay: newDay };
    }),

    reset: () => set({
        agents: initialAgents.map(a => ({ ...a, busy: false, taskCount: 0 })),
        fleet: initialFleet.map(v => ({ ...v })),
        orders: [],
        stock: { ...initialStock },
        logs: [],
        running: false,
        chaos: false,
        simHours: 8,
        simDay: 1,
        revenue: 0,
        eventCount: 0,
    }),
}));