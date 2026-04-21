import { useStore } from '@/store/useStore';
import { CITIES, DEPOT, PRODUCTS, EVENT_TYPES } from '@/lib/data';
import { roadKm, fmtSimTime, pickWeighted } from '@/lib/utils';
import { Order, IncidentEvent } from '@/types';
import { prefetchRoute } from '@/lib/routing';

const sleep = (ms: number) => {
    const speed = useStore.getState().speed;
    return new Promise(r => setTimeout(r, ms / speed));
};

function simNow() {
    const { simDay, simHours } = useStore.getState();
    return `Gün ${simDay} ${fmtSimTime(simHours)}`;
}

function addLog(message: string, tag: string, type: 'info' | 'success' | 'warn' | 'error' | 'event' = 'info') {
    const realTime = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    useStore.getState().addLog({
        time: realTime,
        simTime: simNow(),
        tag,
        message,
        type,
    });
}

// ============ ORCHESTRATOR ============
async function orchestrate(eventType: string) {
    useStore.getState().setAgentBusy('orch', true);
    addLog(`"${eventType}" olayı alındı, yönlendiriliyor...`, 'orch');
    await sleep(250);
    useStore.getState().setAgentBusy('orch', false);
}

// ============ SİPARİŞ AJANI ============
export async function processNewOrder() {
    const { setAgentBusy, addOrder, simHours, simDay } = useStore.getState();
    setAgentBusy('ord', true);

    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const city = pickWeighted(CITIES, 'pop');
    const qty = Math.random() < 0.75 ? 1 : Math.floor(Math.random() * 3) + 1;
    const priority: 'high' | 'normal' = Math.random() < 0.18 ? 'high' : 'normal';

    const order: Order = {
        id: 10000 + Math.floor(Math.random() * 90000),
        product, city, quantity: qty, priority,
        status: 'new',
        revenue: product.price * qty,
        createdAt: Date.now(),
        simCreatedH: simHours,
        simCreatedDay: simDay,
        timeline: [{ time: Date.now(), simTime: simNow(), event: 'Sipariş oluşturuldu', agent: 'ord' }],
        vehicle: null,
        events: [],
        hasEvent: false,
        travelHours: 0,
        km: 0,
        progress: 0,
    };

    addOrder(order);
    addLog(
        `<b>#${order.id}</b> · ${qty}× ${product.emoji} ${product.name} → <b>${city.name}</b>${priority === 'high' ? ' ⚡ACİL' : ''}`,
        'ord'
    );

    await sleep(400);
    setAgentBusy('ord', false);
    await orchestrate('yeni_sipariş');
    await checkStock(order);
}

// ============ ENVANTER AJANI ============
async function checkStock(order: Order) {
    const { setAgentBusy, updateOrder, stock, setStock } = useStore.getState();
    setAgentBusy('inv', true);

    updateOrder(order.id, {
        status: 'checking',
        timeline: [...order.timeline, { time: Date.now(), simTime: simNow(), event: 'Stok kontrolü başladı', agent: 'inv' }],
    });

    addLog(`<b>#${order.id}</b> stok: ${order.product.name} (${stock[order.product.name]} mevcut)`, 'inv');
    await sleep(350);

    const currentStock = useStore.getState().stock[order.product.name];

    if (currentStock < order.quantity) {
        updateOrder(order.id, {
            status: 'blocked',
            timeline: [...order.timeline, { time: Date.now(), simTime: simNow(), event: 'Stok yetersiz', agent: 'inv' }],
        });
        addLog(`<b>#${order.id}</b> STOK YETERSİZ`, 'inv', 'error');
        setAgentBusy('inv', false);
        return;
    }

    setStock(order.product.name, currentStock - order.quantity);
    addLog(`<b>#${order.id}</b> ✓ ${order.quantity} adet rezerve (kalan: ${currentStock - order.quantity})`, 'inv', 'success');

    if (currentStock - order.quantity < 15) {
        addLog(`⚠ DÜŞÜK STOK: ${order.product.name} (${currentStock - order.quantity})`, 'inv', 'warn');
    }

    setAgentBusy('inv', false);

    const updatedOrder = useStore.getState().orders.find(o => o.id === order.id);
    if (updatedOrder) await planRoute(updatedOrder);
}

// ============ ROTA AJANI ============
async function planRoute(order: Order) {
    const { setAgentBusy, updateOrder, fleet, updateVehicle, chaos } = useStore.getState();
    setAgentBusy('rt', true);

    updateOrder(order.id, {
        status: 'routing',
        timeline: [...order.timeline, { time: Date.now(), simTime: simNow(), event: 'Rota hesaplanıyor', agent: 'rt' }],
    });

    const km = roadKm(DEPOT, order.city);
    prefetchRoute([DEPOT.lng, DEPOT.lat], [order.city.lng, order.city.lat]);
    const baseH = km / 70;
    const hours = chaos ? baseH * 1.5 : baseH;

    addLog(`<b>#${order.id}</b> ${order.city.name}: ${km}km, ~${baseH.toFixed(1)} saat`, 'rt');
    await sleep(500);

    const vehicle = fleet.find(v => v.status === 'idle' && v.load + order.product.weight * order.quantity <= v.capacity)
        || fleet.reduce((m, v) => v.load < m.load ? v : m);

    const newLoad = vehicle.load + order.product.weight * order.quantity;
    updateVehicle(vehicle.id, {
        load: newLoad,
        currentOrder: order.id,
        status: 'busy',
        km: vehicle.km + km,
        fuel: Math.max(0, vehicle.fuel - (km / 15)),
    });

    updateOrder(order.id, {
        vehicle: vehicle.id,
        km,
        travelHours: hours,
        timeline: [...order.timeline,
        { time: Date.now(), simTime: simNow(), event: 'Rota hesaplanıyor', agent: 'rt' },
        { time: Date.now(), simTime: simNow(), event: `Araç ${vehicle.id} atandı (${vehicle.driver})`, agent: 'rt' }
        ],
    });

    addLog(`<b>#${order.id}</b> ✓ ${vehicle.id} · ${vehicle.driver} · ${km}km · ${hours.toFixed(1)}h`, 'rt', 'success');
    setAgentBusy('rt', false);

    await notifyCustomer(order.id, 'dispatched', { vehicle: vehicle.id, eta: hours, km });

    // Yükleme
    updateOrder(order.id, { status: 'loading' });
    await sleep(400);

    // Yola çıkış — startTime kaydı BURADA
    const { simHours: sH, simDay: sD } = useStore.getState();
    updateOrder(order.id, {
        status: 'transit',
        startSimH: sH,
        startSimDay: sD,
        startTime: Date.now(),
    });

    // Yolculuk - her sim saati için 2 saniye gerçek zaman
    const realSecondsPerSimHour = 2;
    const totalRealMs = hours * realSecondsPerSimHour * 1000;
    const ticks = Math.max(20, Math.floor(hours * 4));
    const tickMs = totalRealMs / ticks;

    for (let i = 0; i < ticks; i++) {
        await sleep(tickMs);
        const state = useStore.getState();
        const currentChaos = state.chaos;
        const currentOrder = state.orders.find(o => o.id === order.id);
        if (!currentOrder || currentOrder.status === 'failed') {
            const v = useStore.getState().fleet.find(x => x.id === vehicle.id);
            if (v) {
                const newL = Math.max(0, v.load - order.product.weight * order.quantity);
                updateVehicle(vehicle.id, {
                    load: newL,
                    status: newL <= 0.01 ? 'idle' : 'busy',
                    currentOrder: newL <= 0.01 ? null : v.currentOrder,
                });
            }
            return;
        }
        if (Math.random() < (currentChaos ? 0.08 : 0.025)) {
            triggerIncident(order.id);
        }
    }

    // Teslimat başarılı
    const finalOrder = useStore.getState().orders.find(o => o.id === order.id);
    if (finalOrder && finalOrder.status === 'transit') {
        updateOrder(order.id, {
            status: 'delivered',
            deliveredAt: Date.now(),
            timeline: [...(finalOrder.timeline), { time: Date.now(), simTime: simNow(), event: `✓ ${order.city.name}'e teslim edildi`, agent: 'nt' }],
        });
        useStore.getState().addRevenue(order.revenue);
        addLog(`<b>#${order.id}</b> ✓ ${order.city.name}'e TESLİM EDİLDİ`, 'nt', 'success');
        await notifyCustomer(order.id, 'delivered');

        const v = useStore.getState().fleet.find(x => x.id === vehicle.id);
        if (v) {
            const newL = Math.max(0, v.load - order.product.weight * order.quantity);
            updateVehicle(vehicle.id, {
                load: newL,
                status: newL <= 0.01 ? 'idle' : 'busy',
                currentOrder: newL <= 0.01 ? null : v.currentOrder,
            });
        }
    }
}

// ============ OLAY TETİKLEYİCİ ============
export function triggerIncident(orderId: number) {
    const { orders, updateOrder, incrementEventCount, setStock, stock } = useStore.getState();
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status !== 'transit') return;

    const ev: IncidentEvent = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];

    updateOrder(orderId, {
        hasEvent: true,
        events: [...order.events, ev],
        timeline: [...order.timeline, { time: Date.now(), simTime: simNow(), event: `${ev.emoji} ${ev.name}`, agent: 'event' }],
        travelHours: order.travelHours * (ev.fail ? 1 : ev.delayMult),
    });

    incrementEventCount();
    addLog(`${ev.emoji} <b>#${orderId}</b> (${order.city.name}): ${ev.name}`, 'event', 'event');

    if (ev.fail) {
        updateOrder(orderId, { status: 'failed' });
        setStock(order.product.name, stock[order.product.name] + order.quantity);
        addLog(`✗ <b>#${orderId}</b> TESLİMAT BAŞARISIZ (${ev.name})`, 'nt', 'error');
    }

    setTimeout(() => {
        const curr = useStore.getState().orders.find(o => o.id === orderId);
        if (curr) useStore.getState().updateOrder(orderId, { hasEvent: false });
    }, 2500);
}

// ============ BİLDİRİM AJANI ============
async function notifyCustomer(orderId: number, event: string, data: Record<string, unknown> = {}) {
    useStore.getState().setAgentBusy('nt', true);
    await sleep(180);
    let m = '';
    if (event === 'dispatched') m = `<b>#${orderId}</b> 📱 "Siparişiniz ${data.vehicle} ile yolda, ETA ${(data.eta as number).toFixed(1)}h, ${data.km}km"`;
    else if (event === 'delivered') m = `<b>#${orderId}</b> 📱 "Teslim edildi ✓ Puanlar mısınız?"`;
    if (m) addLog(m, 'nt', event === 'delivered' ? 'success' : 'info');
    useStore.getState().setAgentBusy('nt', false);
}

// ============ RAPORLAMA AJANI ============
export async function runReport() {
    const { setAgentBusy, orders, revenue } = useStore.getState();
    setAgentBusy('rp', true);
    await sleep(350);

    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const transit = orders.filter(o => o.status === 'transit').length;
    const failed = orders.filter(o => ['failed', 'blocked'].includes(o.status)).length;
    const rate = (delivered + failed) > 0 ? Math.round((delivered / (delivered + failed)) * 100) : 0;

    addLog(`📊 ${total} toplam · ${delivered} teslim · ${transit} yolda · ${failed} başarısız · %${rate} · ${revenue >= 1000 ? '₺' + (revenue / 1000).toFixed(1) + 'K' : '₺' + revenue}`, 'rp');
    setAgentBusy('rp', false);
}