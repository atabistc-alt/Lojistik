'use client';

import { useEffect, useState, useRef } from 'react';
import { default as MapGL, Marker, Source, Layer } from 'react-map-gl/maplibre';
import { useStore } from '@/store/useStore';
import { CITIES, DEPOT } from '@/lib/data';
import { motion } from 'framer-motion';
import { fetchRoute, interpolateAlongRoute } from '@/lib/routing';
import type { FeatureCollection } from 'geojson';

type Coord = [number, number];

export function TurkeyMap() {
    const orders = useStore(s => s.orders);
    const [animTick, setAnimTick] = useState(0);
    const lastUpdateRef = useRef(Date.now());

    const [routes, setRoutes] = useState<Map<number, Coord[]>>(new Map());

    useEffect(() => {
        const i = setInterval(() => {
            lastUpdateRef.current = Date.now();
            setAnimTick(t => (t + 1) % 10000);
        }, 50);
        return () => clearInterval(i);
    }, []);

    const activeDeliveries = orders.filter(o =>
        o.status === 'transit' &&
        o.startSimH !== undefined &&
        o.travelHours > 0 &&
        o.city
    );

    useEffect(() => {
        activeDeliveries.forEach(o => {
            if (!routes.has(o.id)) {
                fetchRoute([DEPOT.lng, DEPOT.lat], [o.city.lng, o.city.lat]).then(coords => {
                    setRoutes(prev => {
                        const next = new Map(prev);
                        next.set(o.id, coords);
                        return next;
                    });
                });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeDeliveries.map(o => o.id).join(',')]);

    const trucks = activeDeliveries.map(o => {
        // Gerçek zamana göre progress: 1 sim saati = 2 gerçek saniye
        if (!o.startTime) return null;

        const realMsElapsed = (Date.now() - o.startTime) * useStore.getState().speed;
        const totalRealMs = o.travelHours * 2000; // 1 saat = 2000ms
        const progress = Math.max(0, Math.min(1, realMsElapsed / totalRealMs));

        const route = routes.get(o.id);

        if (!route || route.length < 2) {
            const lng = DEPOT.lng + (o.city.lng - DEPOT.lng) * progress;
            const lat = DEPOT.lat + (o.city.lat - DEPOT.lat) * progress;
            if (!isFinite(lng) || !isFinite(lat)) return null;
            return { order: o, lng, lat, progress, bearing: 0, hasRoute: false };
        }

        const { lng, lat, bearing } = interpolateAlongRoute(route, progress);
        if (!isFinite(lng) || !isFinite(lat)) return null;
        return { order: o, lng, lat, progress, bearing, hasRoute: true };
    }).filter((t): t is NonNullable<typeof t> => t !== null);

    const routeFeatures: FeatureCollection = {
        type: 'FeatureCollection',
        features: activeDeliveries
            .filter(o => routes.has(o.id))
            .map(o => ({
                type: 'Feature' as const,
                properties: {
                    priority: o.priority,
                    hasEvent: o.hasEvent,
                },
                geometry: {
                    type: 'LineString' as const,
                    coordinates: routes.get(o.id)!,
                },
            })),
    };

    const trailFeatures: FeatureCollection = {
        type: 'FeatureCollection',
        features: trucks
            .filter(t => t.hasRoute)
            .map(t => {
                const route = routes.get(t.order.id)!;
                const cutoffIdx = Math.max(1, Math.floor(route.length * t.progress));
                return {
                    type: 'Feature' as const,
                    properties: {
                        priority: t.order.priority,
                        hasEvent: t.order.hasEvent,
                    },
                    geometry: {
                        type: 'LineString' as const,
                        coordinates: route.slice(0, cutoffIdx + 1),
                    },
                };
            }),
    };

    const recentDelivered = orders.filter(o =>
        o.status === 'delivered' && o.deliveredAt && (Date.now() - o.deliveredAt) < 3000
    );

    return (
        <MapGL
            initialViewState={{
                longitude: 35.5,
                latitude: 39.2,
                zoom: 5.3,
            }}
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            style={{ width: '100%', height: '100%' }}
            attributionControl={false}
        >
            <Source id="routes" type="geojson" data={routeFeatures}>
                <Layer
                    id="routes-layer"
                    type="line"
                    paint={{
                        'line-color': ['case',
                            ['get', 'hasEvent'], '#ef4444',
                            ['==', ['get', 'priority'], 'high'], '#fb923c',
                            '#06b6d4'
                        ],
                        'line-width': 2,
                        'line-opacity': 0.25,
                    }}
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                />
            </Source>

            <Source id="trails" type="geojson" data={trailFeatures}>
                <Layer
                    id="trails-glow"
                    type="line"
                    paint={{
                        'line-color': ['case',
                            ['get', 'hasEvent'], '#ef4444',
                            ['==', ['get', 'priority'], 'high'], '#fb923c',
                            '#06b6d4'
                        ],
                        'line-width': 6,
                        'line-opacity': 0.35,
                        'line-blur': 3,
                    }}
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                />
                <Layer
                    id="trails-layer"
                    type="line"
                    paint={{
                        'line-color': ['case',
                            ['get', 'hasEvent'], '#fca5a5',
                            ['==', ['get', 'priority'], 'high'], '#fed7aa',
                            '#67e8f9'
                        ],
                        'line-width': 2.5,
                        'line-opacity': 1,
                    }}
                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                />
            </Source>

            {CITIES.map(c => {
                const radius = 3 + Math.min(4, Math.log10(c.pop / 100000));
                return (
                    <Marker key={c.name} longitude={c.lng} latitude={c.lat} anchor="center">
                        <div className="group cursor-pointer">
                            <div
                                className="rounded-full bg-gray-400/40 border border-white/30 transition-all group-hover:bg-cyan-400 group-hover:scale-125"
                                style={{ width: radius * 2, height: radius * 2 }}
                            />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] text-gray-300 font-medium whitespace-nowrap pointer-events-none"
                                style={{ textShadow: '0 0 4px black, 0 0 8px black' }}>
                                {c.name}
                            </div>
                        </div>
                    </Marker>
                );
            })}

            <Marker longitude={DEPOT.lng} latitude={DEPOT.lat} anchor="center">
                <div className="relative">
                    <motion.div
                        className="absolute rounded-full border-2 border-yellow-400"
                        style={{ width: 60, height: 60, left: -30, top: -30 }}
                        animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.div
                        className="absolute rounded-full border-2 border-yellow-400"
                        style={{ width: 60, height: 60, left: -30, top: -30 }}
                        animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 1.25 }}
                    />
                    <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.8)] grid place-items-center text-xs">
                        🏢
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs font-bold text-yellow-400 whitespace-nowrap"
                        style={{ textShadow: '0 0 8px black, 0 0 4px black' }}>
                        İSTANBUL DEPO
                    </div>
                </div>
            </Marker>

            {trucks.map(({ order, lng, lat, progress, bearing, hasRoute }) => {
                const color = order.hasEvent ? '#ef4444' : order.priority === 'high' ? '#fb923c' : '#06b6d4';
                return (
                    <Marker key={order.id} longitude={lng} latitude={lat} anchor="center">
                        <div className="relative" style={{ zIndex: 50 }}>
                            {order.hasEvent && (
                                <motion.div
                                    className="absolute rounded-full border-2 border-red-500"
                                    style={{ width: 50, height: 50, left: -25, top: -25 }}
                                    animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            )}

                            <div
                                className="absolute rounded-full"
                                style={{
                                    width: 40, height: 40, left: -20, top: -20,
                                    background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`,
                                    filter: 'blur(4px)',
                                }}
                            />

                            <div
                                className="relative"
                                style={{ transform: `rotate(${bearing}deg)`, transition: 'transform 0.3s ease-out' }}
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
                                    <circle cx="12" cy="12" r="11" fill={color} stroke="white" strokeWidth="2" />
                                    <path d="M12 6 L16 12 L12 10 L8 12 Z" fill="white" />
                                </svg>
                            </div>

                            <div
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center gap-1 pointer-events-none"
                                style={{ minWidth: 60 }}
                            >
                                <div
                                    className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded"
                                    style={{
                                        color,
                                        background: 'rgba(10, 15, 30, 0.85)',
                                        border: `1px solid ${color}60`,
                                        textShadow: '0 0 4px black',
                                    }}
                                >
                                    #{order.id} · %{Math.round(progress * 100)}
                                    {!hasRoute && <span className="opacity-50"> ⟳</span>}
                                </div>
                                <div
                                    className="h-0.5 bg-black/60 rounded-full overflow-hidden"
                                    style={{ width: 50 }}
                                >
                                    <div
                                        className="h-full transition-all"
                                        style={{ width: `${progress * 100}%`, background: color }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Marker>
                );
            })}

            {recentDelivered.map(o => {
                const age = (Date.now() - (o.deliveredAt ?? 0)) / 3000;
                return (
                    <Marker key={`d-${o.id}`} longitude={o.city.lng} latitude={o.city.lat} anchor="center">
                        <div className="relative pointer-events-none">
                            <div
                                className="absolute rounded-full border-2 border-green-400"
                                style={{
                                    width: 20 + age * 80, height: 20 + age * 80,
                                    opacity: 1 - age,
                                    left: -(10 + age * 40), top: -(10 + age * 40),
                                }}
                            />
                            <div
                                className="absolute rounded-full bg-green-400/30"
                                style={{
                                    width: 10 + age * 40, height: 10 + age * 40,
                                    opacity: 1 - age,
                                    left: -(5 + age * 20), top: -(5 + age * 20),
                                }}
                            />
                            {age < 0.3 && (
                                <div className="absolute text-2xl" style={{ left: -10, top: -20, opacity: 1 - age * 3 }}>
                                    ✓
                                </div>
                            )}
                        </div>
                    </Marker>
                );
            })}
        </MapGL>
    );
}