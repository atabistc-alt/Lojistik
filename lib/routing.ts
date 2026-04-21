// OSRM Routing - Gerçek karayolu rotalarını çeker ve önbelleğe alır

type Coord = [number, number]; // [lng, lat]
type RouteCache = Map<string, Coord[]>;

const cache: RouteCache = new Map();
const pending: Map<string, Promise<Coord[]>> = new Map();

// OSRM demo server (ücretsiz, rate limit var ama bizim için yeterli)
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export async function fetchRoute(from: Coord, to: Coord): Promise<Coord[]> {
    const key = `${from[0].toFixed(3)},${from[1].toFixed(3)}-${to[0].toFixed(3)},${to[1].toFixed(3)}`;

    // Önbellekte varsa direkt dön
    const cached = cache.get(key);
    if (cached) return cached;

    // Aynı anda aynı istek varsa onu bekle
    const existing = pending.get(key);
    if (existing) return existing;

    const promise = (async () => {
        try {
            const url = `${OSRM_URL}/${from[0]},${from[1]};${to[0]},${to[1]}?geometries=geojson&overview=full`;
            const res = await fetch(url);

            if (!res.ok) throw new Error('OSRM request failed');

            const data = await res.json();

            if (!data.routes || data.routes.length === 0) {
                throw new Error('No route found');
            }

            const coords: Coord[] = data.routes[0].geometry.coordinates;
            cache.set(key, coords);
            return coords;
        } catch (err) {
            console.warn('Route fetch failed, falling back to straight line:', err);
            // Başarısız olursa düz çizgi dön (en az 2 nokta)
            const fallback: Coord[] = [from, to];
            cache.set(key, fallback);
            return fallback;
        } finally {
            pending.delete(key);
        }
    })();

    pending.set(key, promise);
    return promise;
}

// Rota üzerinde belirli bir progress (0-1) değerine karşılık gelen nokta
export function interpolateAlongRoute(route: Coord[], progress: number): { lng: number; lat: number; bearing: number } {
    if (route.length < 2) {
        return { lng: route[0]?.[0] ?? 0, lat: route[0]?.[1] ?? 0, bearing: 0 };
    }

    progress = Math.max(0, Math.min(1, progress));

    // Toplam mesafeyi segment segment hesapla
    const distances: number[] = [0];
    for (let i = 1; i < route.length; i++) {
        const dx = route[i][0] - route[i - 1][0];
        const dy = route[i][1] - route[i - 1][1];
        distances.push(distances[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    const total = distances[distances.length - 1];
    if (total === 0) return { lng: route[0][0], lat: route[0][1], bearing: 0 };

    const target = progress * total;

    // Hangi segmentte?
    let segIdx = 0;
    for (let i = 1; i < distances.length; i++) {
        if (distances[i] >= target) {
            segIdx = i - 1;
            break;
        }
        segIdx = i - 1;
    }

    const segStart = distances[segIdx];
    const segEnd = distances[segIdx + 1];
    const segProgress = segEnd === segStart ? 0 : (target - segStart) / (segEnd - segStart);

    const p1 = route[segIdx];
    const p2 = route[segIdx + 1];
    const lng = p1[0] + (p2[0] - p1[0]) * segProgress;
    const lat = p1[1] + (p2[1] - p1[1]) * segProgress;

    // Yön (bearing)
    const dLng = p2[0] - p1[0];
    const dLat = p2[1] - p1[1];
    const bearing = Math.atan2(dLng, dLat) * 180 / Math.PI;

    return { lng, lat, bearing };
}

// Sipariş oluşturulunca rotayı önceden çek (background'da)
export function prefetchRoute(from: Coord, to: Coord): void {
    fetchRoute(from, to).catch(() => { });
}