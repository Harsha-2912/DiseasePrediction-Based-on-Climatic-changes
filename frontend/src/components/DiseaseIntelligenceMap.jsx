import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== MAP RECENTER ====================
const RecenterMap = ({ lat, lon }) => {
    const map = useMap();
    useEffect(() => { map.setView([lat, lon], 12); }, [lat, lon, map]);
    return null;
};

// ==================== LAYER CONFIG ====================
const LAYERS = [
    { id: 'hotspots', label: '🦠 Disease Hotspots', color: '#ef4444' },
    { id: 'aqi', label: '🌫️ Air Quality', color: '#f59e0b' },
    { id: 'weather', label: '🌡️ Climate Zones', color: '#3b82f6' },
    { id: 'hospitals', label: '🏥 Nearby Hospitals', color: '#10b981' },
    { id: 'corridors', label: '⚡ Outbreak Corridors', color: '#8b5cf6' }
];

// ==================== MAP THEMES ====================
const TILE_LAYERS = {
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; CartoDB'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri'
    },
    standard: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap'
    }
};

// ==================== DISEASE DATABASE FOR MAP ====================
const DISEASE_PROFILES = {
    'Malaria': { icon: '🦟', zones: 'tropical', spreadRadius: 3, color: '#ef4444' },
    'Dengue': { icon: '🦟', zones: 'urban', spreadRadius: 2, color: '#f97316' },
    'Typhoid': { icon: '💧', zones: 'waterborne', spreadRadius: 2.5, color: '#eab308' },
    'Cholera': { icon: '💧', zones: 'waterborne', spreadRadius: 3, color: '#a855f7' },
    'Asthma': { icon: '🌫️', zones: 'industrial', spreadRadius: 4, color: '#6b7280' },
    'Viral Fever': { icon: '🤒', zones: 'seasonal', spreadRadius: 2, color: '#ec4899' },
    'Heat Stroke': { icon: '☀️', zones: 'arid', spreadRadius: 5, color: '#dc2626' },
    'No Disease': { icon: '✅', zones: 'safe', spreadRadius: 0, color: '#10b981' }
};

// ==================== HELPER: Generate intelligence data ====================
const generateIntelligenceData = (lat, lon, disease, diseaseRisks) => {
    const rng = (seed) => {
        // Simple seeded random for consistency
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    // Disease Hotspots
    const hotspots = [];
    const diseaseList = diseaseRisks ? Object.entries(diseaseRisks) : [[disease, 80]];
    diseaseList.forEach(([d, risk], idx) => {
        if (d === 'No Disease' || risk < 5) return;
        const profile = DISEASE_PROFILES[d] || DISEASE_PROFILES['Viral Fever'];
        const count = Math.ceil(risk / 15);
        for (let i = 0; i < count; i++) {
            const seed = idx * 100 + i + lat * 1000;
            hotspots.push({
                id: `hs-${idx}-${i}`,
                lat: lat + (rng(seed) - 0.5) * 0.08,
                lon: lon + (rng(seed + 1) - 0.5) * 0.08,
                disease: d,
                risk: risk,
                cases: Math.floor(rng(seed + 2) * 50) + 5,
                icon: profile.icon,
                color: profile.color,
                radius: Math.max(4, risk / 10)
            });
        }
    });

    // AQI Zones
    const aqiZones = [];
    for (let i = 0; i < 8; i++) {
        const seed = i + lon * 500;
        const aqi = Math.floor(rng(seed) * 300) + 20;
        aqiZones.push({
            id: `aqi-${i}`,
            lat: lat + (rng(seed + 3) - 0.5) * 0.06,
            lon: lon + (rng(seed + 4) - 0.5) * 0.06,
            aqi: aqi,
            color: aqi > 200 ? '#dc2626' : aqi > 150 ? '#ef4444' : aqi > 100 ? '#f59e0b' : aqi > 50 ? '#22c55e' : '#10b981',
            label: aqi > 200 ? 'Hazardous' : aqi > 150 ? 'Unhealthy' : aqi > 100 ? 'Moderate' : aqi > 50 ? 'Satisfactory' : 'Good'
        });
    }

    // Weather micro-zones
    const weatherZones = [];
    for (let i = 0; i < 6; i++) {
        const seed = i + lat * 300;
        const temp = 20 + rng(seed + 5) * 25;
        const hum = 30 + rng(seed + 6) * 60;
        weatherZones.push({
            id: `wz-${i}`,
            lat: lat + (rng(seed + 7) - 0.5) * 0.07,
            lon: lon + (rng(seed + 8) - 0.5) * 0.07,
            temp: temp,
            humidity: hum,
            color: temp > 38 ? '#dc2626' : temp > 32 ? '#f97316' : temp > 25 ? '#eab308' : '#3b82f6'
        });
    }

    // Hospitals
    const hospitals = [];
    const hospitalNames = [
        'District General Hospital', 'City Medical Centre', 'Community Health Clinic',
        'Primary Health Centre', 'Government Hospital', 'Regional Medical College',
        'Urban Health Post', 'Specialty Care Hospital'
    ];
    for (let i = 0; i < 6; i++) {
        const seed = i + (lat + lon) * 200;
        hospitals.push({
            id: `hosp-${i}`,
            lat: lat + (rng(seed + 9) - 0.5) * 0.05,
            lon: lon + (rng(seed + 10) - 0.5) * 0.05,
            name: hospitalNames[i % hospitalNames.length],
            beds: Math.floor(rng(seed + 11) * 200) + 20,
            emergency: rng(seed + 12) > 0.4
        });
    }

    // Outbreak corridors (connecting high-risk hotspots)
    const corridors = [];
    const highRiskHotspots = hotspots.filter(h => h.risk > 15).slice(0, 6);
    for (let i = 0; i < highRiskHotspots.length - 1; i++) {
        corridors.push({
            id: `cor-${i}`,
            from: [highRiskHotspots[i].lat, highRiskHotspots[i].lon],
            to: [highRiskHotspots[i + 1].lat, highRiskHotspots[i + 1].lon],
            risk: (highRiskHotspots[i].risk + highRiskHotspots[i + 1].risk) / 2,
            disease: highRiskHotspots[i].disease
        });
    }

    return { hotspots, aqiZones, weatherZones, hospitals, corridors };
};

// ==================== STAT PANEL ====================
const StatPanel = ({ data, activeLayers }) => {
    const totalHotspots = data.hotspots.length;
    const avgAqi = data.aqiZones.length > 0
        ? Math.round(data.aqiZones.reduce((s, z) => s + z.aqi, 0) / data.aqiZones.length)
        : 0;
    const emergencyHospitals = data.hospitals.filter(h => h.emergency).length;
    const corridorCount = data.corridors.length;

    const stats = [
        { label: 'Hotspots', value: totalHotspots, icon: '🦠', visible: activeLayers.includes('hotspots') },
        { label: 'Avg AQI', value: avgAqi, icon: '🌫️', visible: activeLayers.includes('aqi') },
        { label: '24/7 Hospitals', value: emergencyHospitals, icon: '🏥', visible: activeLayers.includes('hospitals') },
        { label: 'Risk Corridors', value: corridorCount, icon: '⚡', visible: activeLayers.includes('corridors') }
    ].filter(s => s.visible);

    if (stats.length === 0) return null;

    return (
        <div style={{
            display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
            padding: '0.75rem', background: 'rgba(0,0,0,0.4)',
            borderRadius: '10px', marginBottom: '0.75rem'
        }}>
            {stats.map(s => (
                <div key={s.label} style={{
                    flex: '1 1 80px', textAlign: 'center',
                    padding: '0.5rem', background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px', minWidth: '80px'
                }}>
                    <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>{s.value}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
            ))}
        </div>
    );
};

// ==================== LEGEND ====================
const MapLegend = ({ activeLayers }) => {
    const legends = {
        hotspots: [
            { color: '#ef4444', label: 'High Risk (>60%)' },
            { color: '#f97316', label: 'Medium Risk (30-60%)' },
            { color: '#eab308', label: 'Low Risk (<30%)' }
        ],
        aqi: [
            { color: '#dc2626', label: 'Hazardous (>200)' },
            { color: '#ef4444', label: 'Unhealthy (150-200)' },
            { color: '#f59e0b', label: 'Moderate (100-150)' },
            { color: '#10b981', label: 'Good (<100)' }
        ],
        weather: [
            { color: '#dc2626', label: '>38°C Extreme' },
            { color: '#f97316', label: '32-38°C Hot' },
            { color: '#eab308', label: '25-32°C Warm' },
            { color: '#3b82f6', label: '<25°C Cool' }
        ]
    };

    const active = activeLayers.filter(l => legends[l]);
    if (active.length === 0) return null;

    return (
        <div style={{
            position: 'absolute', bottom: '12px', right: '12px', zIndex: 1000,
            background: 'rgba(0,0,0,0.85)', padding: '0.75rem', borderRadius: '10px',
            backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '180px'
        }}>
            {active.map(layerId => (
                <div key={layerId} style={{ marginBottom: active.indexOf(layerId) < active.length - 1 ? '0.5rem' : 0 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#ccc', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                        {layerId}
                    </div>
                    {legends[layerId].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.65rem', color: '#aaa' }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
const DiseaseIntelligenceMap = ({ lat, lon, disease, diseaseRisks, formData }) => {
    const [activeLayers, setActiveLayers] = useState(['hotspots', 'hospitals']);
    const [mapTheme, setMapTheme] = useState('dark');
    const [showStats, setShowStats] = useState(true);

    const data = useMemo(
        () => generateIntelligenceData(lat, lon, disease, diseaseRisks),
        [lat, lon, disease, diseaseRisks]
    );

    if (!lat || !lon) return null;

    const toggleLayer = (id) => {
        setActiveLayers(prev =>
            prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
        );
    };

    const tile = TILE_LAYERS[mapTheme];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
                marginTop: '2rem',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08))'
            }}
        >
            {/* Header */}
            <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>
                            🗺️ Multi-Layer Disease Intelligence Map
                        </h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Real-time spatial analysis with {activeLayers.length} active layers
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {Object.keys(TILE_LAYERS).map(theme => (
                            <button
                                key={theme}
                                onClick={() => setMapTheme(theme)}
                                style={{
                                    padding: '0.3rem 0.6rem', fontSize: '0.7rem',
                                    borderRadius: '6px', cursor: 'pointer',
                                    border: mapTheme === theme ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.15)',
                                    background: mapTheme === theme ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)',
                                    color: mapTheme === theme ? '#c4b5fd' : '#999',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {theme}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Layer Toggles */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {LAYERS.map(layer => {
                        const isActive = activeLayers.includes(layer.id);
                        return (
                            <button
                                key={layer.id}
                                onClick={() => toggleLayer(layer.id)}
                                style={{
                                    padding: '0.35rem 0.75rem', fontSize: '0.75rem',
                                    borderRadius: '20px', cursor: 'pointer',
                                    border: `1px solid ${isActive ? layer.color : 'rgba(255,255,255,0.15)'}`,
                                    background: isActive ? `${layer.color}22` : 'transparent',
                                    color: isActive ? layer.color : '#888',
                                    fontWeight: isActive ? '600' : '400',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {layer.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Stats Panel */}
            <div style={{ padding: '0.75rem 1rem 0' }}>
                <StatPanel data={data} activeLayers={activeLayers} />
            </div>

            {/* Map */}
            <div style={{ position: 'relative', height: '500px', margin: '0 1rem 1rem' }}>
                <div style={{ height: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <MapContainer center={[lat, lon]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                        <TileLayer url={tile.url} attribution={tile.attribution} />
                        <RecenterMap lat={lat} lon={lon} />

                        {/* ===== USER LOCATION ===== */}
                        <CircleMarker
                            center={[lat, lon]}
                            radius={10}
                            pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 3 }}
                        >
                            <Popup>
                                <div style={{ color: '#333', textAlign: 'center' }}>
                                    <strong>📍 Your Location</strong><br />
                                    <span style={{ fontSize: '0.8rem' }}>{lat.toFixed(4)}, {lon.toFixed(4)}</span>
                                </div>
                            </Popup>
                        </CircleMarker>
                        {/* Pulse ring */}
                        <Circle
                            center={[lat, lon]}
                            radius={200}
                            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1, dashArray: '5 5' }}
                        />

                        {/* ===== DISEASE HOTSPOTS ===== */}
                        {activeLayers.includes('hotspots') && data.hotspots.map(h => (
                            <React.Fragment key={h.id}>
                                <CircleMarker
                                    center={[h.lat, h.lon]}
                                    radius={h.radius}
                                    pathOptions={{
                                        color: h.color,
                                        fillColor: h.color,
                                        fillOpacity: 0.6,
                                        weight: 1
                                    }}
                                >
                                    <Popup>
                                        <div style={{ color: '#333', minWidth: '150px' }}>
                                            <strong>{h.icon} {h.disease}</strong><br />
                                            <span style={{ fontSize: '0.85rem' }}>
                                                Risk Level: <b style={{ color: h.risk > 50 ? '#dc2626' : '#f59e0b' }}>{h.risk}%</b><br />
                                                Reported Cases: <b>{h.cases}</b><br />
                                                <span style={{ color: '#888', fontSize: '0.75rem' }}>Simulated Intelligence Data</span>
                                            </span>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                                {/* Heatmap-like glow */}
                                <Circle
                                    center={[h.lat, h.lon]}
                                    radius={h.risk * 8 + 100}
                                    pathOptions={{ color: 'transparent', fillColor: h.color, fillOpacity: 0.08, stroke: false }}
                                />
                            </React.Fragment>
                        ))}

                        {/* ===== AQI ZONES ===== */}
                        {activeLayers.includes('aqi') && data.aqiZones.map(z => (
                            <React.Fragment key={z.id}>
                                <Circle
                                    center={[z.lat, z.lon]}
                                    radius={500}
                                    pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: 0.2, weight: 1, dashArray: '4 4' }}
                                >
                                    <Popup>
                                        <div style={{ color: '#333' }}>
                                            <strong>🌫️ Air Quality Zone</strong><br />
                                            AQI: <b style={{ color: z.color }}>{z.aqi}</b> ({z.label})<br />
                                            <span style={{ fontSize: '0.75rem', color: '#888' }}>Monitored Region</span>
                                        </div>
                                    </Popup>
                                </Circle>
                            </React.Fragment>
                        ))}

                        {/* ===== WEATHER ZONES ===== */}
                        {activeLayers.includes('weather') && data.weatherZones.map(w => (
                            <Circle
                                key={w.id}
                                center={[w.lat, w.lon]}
                                radius={600}
                                pathOptions={{ color: w.color, fillColor: w.color, fillOpacity: 0.15, weight: 2 }}
                            >
                                <Popup>
                                    <div style={{ color: '#333' }}>
                                        <strong>🌡️ Micro-Climate Zone</strong><br />
                                        Temperature: <b>{w.temp.toFixed(1)}°C</b><br />
                                        Humidity: <b>{w.humidity.toFixed(0)}%</b>
                                    </div>
                                </Popup>
                            </Circle>
                        ))}

                        {/* ===== HOSPITALS ===== */}
                        {activeLayers.includes('hospitals') && data.hospitals.map(h => (
                            <CircleMarker
                                key={h.id}
                                center={[h.lat, h.lon]}
                                radius={7}
                                pathOptions={{
                                    color: '#10b981',
                                    fillColor: h.emergency ? '#10b981' : '#6b7280',
                                    fillOpacity: 0.9,
                                    weight: 2
                                }}
                            >
                                <Popup>
                                    <div style={{ color: '#333', minWidth: '150px' }}>
                                        <strong>🏥 {h.name}</strong><br />
                                        Beds: <b>{h.beds}</b><br />
                                        Emergency: <b style={{ color: h.emergency ? '#10b981' : '#ef4444' }}>
                                            {h.emergency ? '24/7 Available' : 'Limited Hours'}
                                        </b>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}

                        {/* ===== OUTBREAK CORRIDORS ===== */}
                        {activeLayers.includes('corridors') && data.corridors.map(c => (
                            <Polyline
                                key={c.id}
                                positions={[c.from, c.to]}
                                pathOptions={{
                                    color: '#8b5cf6',
                                    weight: 3,
                                    opacity: 0.7,
                                    dashArray: '8 6'
                                }}
                            >
                                <Popup>
                                    <div style={{ color: '#333' }}>
                                        <strong>⚡ Outbreak Corridor</strong><br />
                                        Disease: <b>{c.disease}</b><br />
                                        Avg Risk: <b>{c.risk.toFixed(0)}%</b><br />
                                        <span style={{ fontSize: '0.75rem', color: '#888' }}>Predicted spread path</span>
                                    </div>
                                </Popup>
                            </Polyline>
                        ))}
                    </MapContainer>

                    {/* Legend Overlay */}
                    <MapLegend activeLayers={activeLayers} />
                </div>
            </div>

            {/* Footer */}
            <div style={{
                padding: '0.75rem 1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(0,0,0,0.2)'
            }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    🔬 Intelligence data is AI-generated for demonstration. Production version integrates IDSP/CDC/WHO feeds.
                </p>
                <button
                    onClick={() => setShowStats(!showStats)}
                    style={{
                        padding: '0.25rem 0.6rem', fontSize: '0.7rem',
                        borderRadius: '6px', cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#999'
                    }}
                >
                    {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
            </div>
        </motion.div>
    );
};

export default DiseaseIntelligenceMap;
