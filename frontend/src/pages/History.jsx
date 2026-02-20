import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import Navbar from '../components/Navbar';

const History = () => {
    const { t } = useTranslation();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/predict/history');
                setHistory(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const getSeverityColor = (disease) => {
        const colors = {
            'Malaria': '#ef4444', 'Dengue': '#f97316', 'Flu': '#06b6d4',
            'Typhoid': '#8b5cf6', 'Asthma': '#64748b', 'Cholera': '#ec4899',
            'Heat Stroke': '#f59e0b', 'Tuberculosis': '#10b981'
        };
        return colors[disease] || '#6366f1';
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ paddingBottom: '3rem' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '2rem' }}
                >
                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '2.5rem',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.4rem'
                    }}>
                        📋 {t('Prediction History')}
                    </h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                        Your past analyses and disease predictions
                    </p>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.3rem 0.8rem', borderRadius: '999px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.15)',
                        fontSize: '0.75rem', fontWeight: '600', color: '#a78bfa',
                        marginTop: '0.5rem'
                    }}>
                        {history.length} record{history.length !== 1 ? 's' : ''} found
                    </div>
                </motion.div>

                {/* History Cards */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <div style={{
                            width: '40px', height: '40px', margin: '0 auto 1rem',
                            border: '3px solid rgba(99, 102, 241, 0.2)',
                            borderTopColor: '#6366f1',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }} />
                        <p style={{ color: 'var(--text-dim)' }}>Loading history...</p>
                    </div>
                ) : (
                    <motion.div
                        className="grid"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {history.length === 0 ? (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '16px',
                                border: '1px dashed rgba(255,255,255,0.08)'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', fontWeight: '500' }}>No predictions yet</p>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Head to the Dashboard to make your first prediction</p>
                            </div>
                        ) : (
                            history.map((record) => {
                                const color = getSeverityColor(record.predicted_disease);
                                return (
                                    <motion.div
                                        key={record.id}
                                        className="card"
                                        variants={item}
                                        style={{ position: 'relative', overflow: 'hidden' }}
                                    >
                                        {/* Top accent bar */}
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                            background: `linear-gradient(90deg, ${color}, transparent)`
                                        }} />

                                        {/* Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                            <span style={{
                                                fontFamily: "'Outfit', sans-serif",
                                                fontWeight: '800', fontSize: '1.2rem', color
                                            }}>
                                                {record.predicted_disease}
                                            </span>
                                            <span style={{
                                                fontSize: '0.7rem', color: 'var(--text-dim)',
                                                background: 'rgba(255,255,255,0.04)',
                                                padding: '0.2rem 0.6rem', borderRadius: '999px',
                                                border: '1px solid rgba(255,255,255,0.06)'
                                            }}>
                                                {new Date(record.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        {/* Climate Data Grid */}
                                        <div style={{
                                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                                            gap: '0.5rem', fontSize: '0.85rem'
                                        }}>
                                            {[
                                                { icon: '🌡️', label: record.temperature + '°C', color: '#ef4444' },
                                                { icon: '💧', label: record.humidity + '%', color: '#06b6d4' },
                                                { icon: '🌧️', label: record.rainfall + 'mm', color: '#60a5fa' },
                                                { icon: '🌫️', label: 'AQI ' + record.aqi, color: '#fbbf24' }
                                            ].map((d, i) => (
                                                <div key={i} style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                    padding: '0.4rem 0.6rem',
                                                    borderRadius: '8px',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    <span>{d.icon}</span> <span style={{ fontWeight: '600' }}>{d.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div style={{
                                            marginTop: '1rem', paddingTop: '0.75rem',
                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                                📍 {record.location || 'Unknown Location'}
                                            </span>
                                            <span style={{
                                                fontWeight: '700', color: '#06b6d4', fontSize: '0.85rem',
                                                background: 'rgba(6, 182, 212, 0.08)',
                                                padding: '0.2rem 0.5rem', borderRadius: '999px'
                                            }}>
                                                {record.accuracy}%
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </motion.div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

export default History;
