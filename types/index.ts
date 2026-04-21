export interface City {
    name: string;
    lng: number;
    lat: number;
    pop: number;
}

export interface Product {
    name: string;
    emoji: string;
    price: number;
    weight: number;
    category: string;
}

export interface Agent {
    id: 'orch' | 'ord' | 'inv' | 'rt' | 'nt' | 'rp';
    name: string;
    role: string;
    icon: string;
    color: string;
    busy: boolean;
    taskCount: number;
}

export interface Vehicle {
    id: string;
    driver: string;
    capacity: number;
    load: number;
    status: 'idle' | 'loading' | 'busy' | 'broken';
    currentOrder: number | null;
    km: number;
    fuel: number;
}

export type OrderStatus = 'new' | 'checking' | 'routing' | 'loading' | 'transit' | 'delivered' | 'failed' | 'blocked';

export interface TimelineEvent {
    time: number;
    simTime: string;
    event: string;
    agent: string;
}

export interface IncidentEvent {
    id: string;
    name: string;
    emoji: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    delayMult: number;
    fail?: boolean;
}

export interface Order {
    id: number;
    product: Product;
    city: City;
    quantity: number;
    priority: 'high' | 'normal';
    status: OrderStatus;
    revenue: number;
    createdAt: number;
    simCreatedH: number;
    simCreatedDay: number;
    timeline: TimelineEvent[];
    vehicle: string | null;
    events: IncidentEvent[];
    hasEvent: boolean;
    travelHours: number;
    km: number;
    progress: number;
    startSimH?: number;
    startSimDay?: number;
    deliveredAt?: number;
    startTime?: number;
}

export interface LogEntry {
    id: string;
    time: string;
    simTime: string;
    tag: string;
    message: string;
    type: 'info' | 'success' | 'warn' | 'error' | 'event';
}