import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Helper to recenter map when coords change
const RecenterAutomatically = ({ lat, lon }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lon]);
    }, [lat, lon, map]);
    return null;
};

const RiskMap = ({ lat, lon, disease }) => {
    const { t } = useTranslation();
    const [layer, setLayer] = useState('risk'); // 'risk', 'temp', 'aqi'
    const [points, setPoints] = useState([]);

    // Generate dummy data around the user's location
    useEffect(() => {
        if (!lat || !lon) return;

        const newPoints = [];
        for (let i = 0; i < 20; i++) {
            // Random offset within ~5km
            const latOffset = (Math.random() - 0.5) * 0.05;
            const lonOffset = (Math.random() - 0.5) * 0.05;

            newPoints.push({
                id: i,
                lat: lat + latOffset,
                lon: lon + lonOffset,
                risk: Math.floor(Math.random() * 100),
                temp: 25 + Math.random() * 15,
                aqi: 50 + Math.random() * 200,
                disease: Math.random() > 0.5 ? disease : 'No Disease'
            });
        }
        setPoints(newPoints);
    }, [lat, lon, disease]);

    if (!lat || !lon) return null;

    const getColor = (point) => {
        if (layer === 'risk') {
            return point.risk > 70 ? '#ef4444' : point.risk > 40 ? '#fbbf24' : '#10b981';
        }
        if (layer === 'temp') {
            return point.temp > 35 ? '#ef4444' : point.temp > 25 ? '#fbbf24' : '#3b82f6';
        }
        if (layer === 'aqi') {
            return point.aqi > 150 ? '#ef4444' : point.aqi > 100 ? '#fbbf24' : '#10b981';
        }
        return '#fff';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-panel"
            style={{ padding: '1rem', marginTop: '2rem', height: '500px', display: 'flex', flexDirection: 'column' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{t('Geospatial Risk Analysis')}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setLayer('risk')}
                        className={`btn ${layer === 'risk' ? 'btn-primary' : ''}`}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', opacity: layer === 'risk' ? 1 : 0.6 }}
                    >
                        Risk
                    </button>
                    <button
                        onClick={() => setLayer('temp')}
                        className={`btn ${layer === 'temp' ? 'btn-primary' : ''}`}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', opacity: layer === 'temp' ? 1 : 0.6 }}
                    >
                        Temp
                    </button>
                    <button
                        onClick={() => setLayer('aqi')}
                        className={`btn ${layer === 'aqi' ? 'btn-primary' : ''}`}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', opacity: layer === 'aqi' ? 1 : 0.6 }}
                    >
                        AQI
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <MapContainer center={[lat, lon]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterAutomatically lat={lat} lon={lon} />

                    {/* User Location */}
                    <CircleMarker center={[lat, lon]} radius={8} pathOptions={{ color: 'white', fillColor: 'blue', fillOpacity: 0.8 }}>
                        <Popup>Your Location</Popup>
                    </CircleMarker>

                    {/* AI Generated Risk Points */}
                    {points.map(p => (
                        <CircleMarker
                            key={p.id}
                            center={[p.lat, p.lon]}
                            radius={6}
                            pathOptions={{ color: getColor(p), fillColor: getColor(p), fillOpacity: 0.6, stroke: false }}
                        >
                            <Popup>
                                <div style={{ color: '#333' }}>
                                    <strong>Reported Case (Simulated)</strong><br />
                                    Risk: {p.risk}%<br />
                                    Temp: {p.temp.toFixed(1)}°C<br />
                                    AQI: {p.aqi.toFixed(0)}
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                * Displaying synthetic data for demonstration. In production, this would pull from IDSP/CDC real-time databases.
            </p>
        </motion.div>
    );
};

export default RiskMap;
