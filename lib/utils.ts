export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

export function roadKm(c1: { lat: number, lng: number }, c2: { lat: number, lng: number }): number {
    return Math.round(haversineKm(c1.lat, c1.lng, c2.lat, c2.lng) * 1.35);
}

export function fmtMoney(n: number): string {
    if (n >= 1e6) return '₺' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '₺' + (n / 1e3).toFixed(1) + 'K';
    return '₺' + Math.round(n);
}

export function fmtSimTime(h: number): string {
    const hh = Math.floor(h) % 24;
    const mm = Math.floor((h % 1) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

export function pickWeighted<T>(arr: T[], weightKey: keyof T): T {
    const total = arr.reduce((s, i) => s + (i[weightKey] as unknown as number), 0);
    let r = Math.random() * total;
    for (const x of arr) {
        r -= (x[weightKey] as unknown as number);
        if (r <= 0) return x;
    }
    return arr[0];
}

export function uid(): string {
    return Math.random().toString(36).slice(2, 9);
}