import { City, Product, IncidentEvent } from '@/types';

export const CITIES: City[] = [
    { name: 'İstanbul', lng: 28.979, lat: 41.015, pop: 15840900 },
    { name: 'Ankara', lng: 32.855, lat: 39.925, pop: 5747325 },
    { name: 'İzmir', lng: 27.142, lat: 38.423, pop: 4462056 },
    { name: 'Bursa', lng: 29.060, lat: 40.188, pop: 3194720 },
    { name: 'Antalya', lng: 30.713, lat: 36.897, pop: 2696249 },
    { name: 'Adana', lng: 35.321, lat: 37.000, pop: 2270298 },
    { name: 'Konya', lng: 32.484, lat: 37.871, pop: 2296347 },
    { name: 'Gaziantep', lng: 37.378, lat: 37.066, pop: 2154051 },
    { name: 'Kayseri', lng: 35.485, lat: 38.721, pop: 1453428 },
    { name: 'Mersin', lng: 34.633, lat: 36.812, pop: 1916432 },
    { name: 'Samsun', lng: 36.329, lat: 41.286, pop: 1368488 },
    { name: 'Trabzon', lng: 39.720, lat: 41.002, pop: 811901 },
    { name: 'Eskişehir', lng: 30.520, lat: 39.776, pop: 906617 },
    { name: 'Erzurum', lng: 41.266, lat: 39.904, pop: 749754 },
    { name: 'Van', lng: 43.384, lat: 38.494, pop: 1127612 },
    { name: 'Diyarbakır', lng: 40.213, lat: 37.914, pop: 1804880 },
    { name: 'Denizli', lng: 29.087, lat: 37.783, pop: 1061043 },
    { name: 'Malatya', lng: 38.314, lat: 38.355, pop: 812580 },
    { name: 'Edirne', lng: 26.559, lat: 41.676, pop: 415000 },
    { name: 'Şanlıurfa', lng: 38.794, lat: 37.166, pop: 2170110 },
];

export const DEPOT: City = { name: 'İstanbul Ana Depo', lng: 28.979, lat: 41.015, pop: 0 };

export const PRODUCTS: Product[] = [
    { name: 'iPhone 15 Pro', emoji: '📱', price: 65000, weight: 0.5, category: 'Elektronik' },
    { name: 'MacBook Pro', emoji: '💻', price: 85000, weight: 2.5, category: 'Elektronik' },
    { name: 'T-Shirt Seti', emoji: '👕', price: 750, weight: 0.8, category: 'Tekstil' },
    { name: 'Spor Ayakkabı', emoji: '👟', price: 2500, weight: 1.0, category: 'Tekstil' },
    { name: 'Gıda Paketi', emoji: '🥫', price: 850, weight: 5.0, category: 'Gıda' },
    { name: 'Kitap Koli', emoji: '📚', price: 450, weight: 3.5, category: 'Kitap' },
    { name: 'Kozmetik Seti', emoji: '💄', price: 1800, weight: 0.8, category: 'Kozmetik' },
    { name: 'Çocuk Oyuncağı', emoji: '🧸', price: 650, weight: 1.5, category: 'Oyuncak' },
    { name: 'Beyaz Eşya', emoji: '🔌', price: 15000, weight: 45.0, category: 'Ev' },
    { name: 'Parfüm', emoji: '🌸', price: 3200, weight: 0.3, category: 'Kozmetik' },
];

export const EVENT_TYPES: IncidentEvent[] = [
    { id: 'traffic', name: 'Trafik sıkışıklığı', emoji: '🚦', severity: 'low', delayMult: 1.8 },
    { id: 'weather', name: 'Kötü hava koşulları', emoji: '🌧️', severity: 'medium', delayMult: 2.0 },
    { id: 'snow', name: 'Kar yağışı', emoji: '❄️', severity: 'high', delayMult: 2.8 },
    { id: 'break', name: 'Araç arızası', emoji: '🔧', severity: 'high', delayMult: 3.0 },
    { id: 'fuel', name: 'Yakıt molası', emoji: '⛽', severity: 'low', delayMult: 1.2 },
    { id: 'customs', name: 'Gümrük kontrolü', emoji: '📋', severity: 'low', delayMult: 1.3 },
    { id: 'accident', name: 'Trafik kazası', emoji: '🚑', severity: 'critical', delayMult: 3.5 },
    { id: 'rejected', name: 'Müşteri adreste yok', emoji: '🏠', severity: 'medium', delayMult: 1.0, fail: true },
    { id: 'damaged', name: 'Paket hasarlı', emoji: '📦', severity: 'high', delayMult: 1.0, fail: true },
    { id: 'theft', name: 'Hırsızlık olayı', emoji: '🚨', severity: 'critical', delayMult: 1.0, fail: true },
];