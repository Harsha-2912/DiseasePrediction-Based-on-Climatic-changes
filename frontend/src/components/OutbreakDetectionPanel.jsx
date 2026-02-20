import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import api from '../services/api';

// ==================== ALERT LEVEL CONFIGS ====================
const ALERT_STYLES = {
    CRITICAL: { bg: 'rgba(220, 38, 38, 0.15)', border: '#dc2626', icon: '🚨', pulse: true },
    HIGH: { bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', icon: '⚠️', pulse: false },
    ELEVATED: { bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', icon: '🔶', pulse: false },
    ADVISORY: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', icon: '📋', pulse: false },
    Normal: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', icon: '✅', pulse: false }
};

const THREAT_COLORS = {
    CRITICAL: '#dc2626', HIGH: '#ef4444', MODERATE: '#f59e0b', LOW: '#10b981'
};

// ==================== WARNING CARD ====================
const WarningCard = ({ warning, index }) => {
    const style = ALERT_STYLES[warning.alertLevel] || ALERT_STYLES.Normal;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: '12px',
                padding: '1rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Pulse animation for critical */}
            {style.pulse && (
                <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: style.border,
                    animation: 'pulse 1.5s infinite'
                }} />
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <div>
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{style.icon}</span>
                    <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#fff' }}>{warning.disease}</span>
                    <span style={{
                        marginLeft: '0.6rem', padding: '0.15rem 0.5rem',
                        borderRadius: '10px', fontSize: '0.65rem', fontWeight: '700',
                        background: `${style.border}33`, color: style.border,
                        letterSpacing: '0.5px'
                    }}>
                        {warning.alertLevel}
                    </span>
                </div>
                <div style={{
                    fontSize: '1.5rem', fontWeight: '800',
                    color: style.border, lineHeight: 1
                }}>
                    {warning.riskScore}%
                </div>
            </div>

            {/* Risk bar */}
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '0.6rem' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${warning.riskScore}%` }}
                    transition={{ duration: 1, delay: index * 0.15 }}
                    style={{ height: '100%', background: style.border, borderRadius: '2px' }}
                />
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <span>🦠 {warning.transmission}</span>
                <span>⏱️ Incubation: {warning.incubation}</span>
                <span>🔬 Vector: {warning.vector}</span>
                <span>{warning.isSeasonal ? '📅 In Peak Season' : '📅 Off-Season'}</span>
            </div>

            {/* Triggers */}
            <div style={{ marginBottom: '0.5rem' }}>
                {warning.triggers.map((t, i) => (
                    <div key={i} style={{ fontSize: '0.72rem', color: '#ccc', padding: '0.1rem 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ color: style.border }}>▸</span> {t}
                    </div>
                ))}
            </div>

            {/* Recommendation */}
            <div style={{
                background: 'rgba(0,0,0,0.3)', borderRadius: '8px',
                padding: '0.5rem 0.7rem', fontSize: '0.75rem',
                color: '#ddd', borderLeft: `3px solid ${style.border}`
            }}>
                <strong style={{ fontSize: '0.7rem', color: style.border }}>RECOMMENDATION:</strong><br />
                {warning.recommendation}
            </div>
        </motion.div>
    );
};

// ==================== TIMELINE CHART ====================
const TimelineChart = ({ timeline }) => {
    if (!timeline || timeline.length === 0) return null;

    const diseases = ['Malaria', 'Dengue', 'Typhoid', 'Asthma', 'Cholera', 'Viral Fever', 'Heat Stroke'];
    const COLORS = ['#ef4444', '#f97316', '#eab308', '#6b7280', '#a855f7', '#ec4899', '#dc2626'];

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', color: '#fff', fontSize: '0.95rem' }}>
                📈 7-Day Outbreak Risk Timeline
            </h4>
            <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <defs>
                            {diseases.map((d, i) => (
                                <linearGradient key={d} id={`grad-${d}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" stroke="#666" fontSize={11} />
                        <YAxis domain={[0, 100]} stroke="#666" fontSize={11} />
                        <Tooltip
                            contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '0.8rem' }}
                            formatter={(value, name) => [`${value}%`, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                        {diseases.map((d, i) => (
                            <Area
                                key={d}
                                type="monotone"
                                dataKey={entry => entry.risks?.[d] || 0}
                                name={d}
                                stroke={COLORS[i]}
                                fillOpacity={1}
                                fill={`url(#grad-${d})`}
                                strokeWidth={2}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// ==================== TREND BARS ====================
const TrendBars = ({ trendData }) => {
    if (!trendData || trendData.length === 0) return null;

    const sorted = [...trendData].sort((a, b) => b.riskScore - a.riskScore);
    const COLORS_MAP = {
        CRITICAL: '#dc2626', HIGH: '#ef4444', ELEVATED: '#f59e0b', ADVISORY: '#3b82f6', Normal: '#10b981'
    };

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', color: '#fff', fontSize: '0.95rem' }}>
                📊 Current Disease Threat Index
            </h4>
            <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="99%" height="100%">
                    <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 40, left: 70, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis type="number" domain={[0, 100]} stroke="#666" />
                        <YAxis dataKey="disease" type="category" stroke="#ccc" fontSize={12} width={65} />
                        <Tooltip
                            contentStyle={{ background: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '10px', color: '#fff' }}
                            formatter={(value) => [`${value}%`, 'Threat Score']}
                        />
                        <Bar dataKey="riskScore" barSize={16} radius={[0, 6, 6, 0]}>
                            {sorted.map((entry, idx) => (
                                <Cell key={idx} fill={COLORS_MAP[entry.alertLevel] || '#10b981'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
const OutbreakDetectionPanel = ({ formData, forecastData }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('warnings');

    const runAnalysis = async () => {
        if (!formData.temperature || !formData.humidity || !formData.rainfall || !formData.aqi) return;

        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/predict/outbreak-analysis', {
                temperature: formData.temperature,
                humidity: formData.humidity,
                rainfall: formData.rainfall,
                aqi: formData.aqi,
                forecastData: forecastData || []
            });
            setAnalysis(res.data);
        } catch (err) {
            console.error('Outbreak analysis failed:', err);
            setError('Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (formData.temperature && formData.humidity && formData.rainfall && formData.aqi) {
            runAnalysis();
        }
    }, [formData.temperature, formData.humidity, formData.rainfall, formData.aqi]);

    const tabs = [
        { id: 'warnings', label: '🚨 Warnings', count: analysis?.totalWarnings },
        { id: 'timeline', label: '📈 Timeline', count: analysis?.timeline?.length },
        { id: 'threats', label: '📊 Threat Index', count: analysis?.trendData?.length }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
                marginTop: '2rem',
                borderRadius: '16px',
                overflow: 'hidden',
                border: `1px solid ${analysis ? (THREAT_COLORS[analysis.overallThreat] + '44') : 'rgba(255,255,255,0.1)'}`,
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.05), rgba(139, 92, 246, 0.05))'
            }}
        >
            {/* ===== HEADER ===== */}
            <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>
                            🛡️ AI Early Warning & Outbreak Detection
                        </h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Intelligent disease surveillance system analyzing {Object.keys(formData).filter(k => formData[k]).length} climate parameters
                        </p>
                    </div>

                    {analysis && (
                        <div style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            background: THREAT_COLORS[analysis.overallThreat] + '22',
                            border: `1px solid ${THREAT_COLORS[analysis.overallThreat]}`,
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <div style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: THREAT_COLORS[analysis.overallThreat],
                                boxShadow: `0 0 8px ${THREAT_COLORS[analysis.overallThreat]}`
                            }} />
                            <span style={{
                                fontSize: '0.8rem', fontWeight: '700',
                                color: THREAT_COLORS[analysis.overallThreat],
                                letterSpacing: '0.5px'
                            }}>
                                {analysis.overallThreat} THREAT
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== STATS BAR ===== */}
            {analysis && (
                <div style={{
                    display: 'flex', gap: '1rem', padding: '1rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ textAlign: 'center', flex: '1 1 80px' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: THREAT_COLORS[analysis.overallThreat] }}>
                            {analysis.maxRiskScore}%
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Peak Risk</div>
                    </div>
                    <div style={{ textAlign: 'center', flex: '1 1 80px' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ef4444' }}>
                            {analysis.criticalCount}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Critical Alerts</div>
                    </div>
                    <div style={{ textAlign: 'center', flex: '1 1 80px' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b' }}>
                            {analysis.totalWarnings}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Warnings</div>
                    </div>
                    <div style={{ textAlign: 'center', flex: '1 1 120px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ccc', marginTop: '0.3rem' }}>
                            {new Date(analysis.analyzedAt).toLocaleTimeString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last Analyzed</div>
                    </div>
                </div>
            )}

            {/* ===== TABS ===== */}
            <div style={{ display: 'flex', gap: '0.35rem', padding: '0.75rem 1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.5rem 1rem', fontSize: '0.8rem',
                            borderRadius: '8px 8px 0 0', cursor: 'pointer',
                            border: 'none', borderBottom: activeTab === tab.id ? `2px solid #8b5cf6` : '2px solid transparent',
                            background: activeTab === tab.id ? 'rgba(139,92,246,0.15)' : 'transparent',
                            color: activeTab === tab.id ? '#c4b5fd' : '#888',
                            fontWeight: activeTab === tab.id ? '600' : '400',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span style={{
                                marginLeft: '0.4rem', padding: '0.1rem 0.4rem',
                                borderRadius: '8px', fontSize: '0.65rem',
                                background: 'rgba(255,255,255,0.1)', color: '#aaa'
                            }}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ===== CONTENT ===== */}
            <div style={{ padding: '1.25rem 1.5rem', minHeight: '200px' }}>
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔬</div>
                        <p>Analyzing climate data for outbreak patterns...</p>
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                        <p>{error}</p>
                        <button onClick={runAnalysis} className="btn" style={{ marginTop: '0.5rem', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent' }}>
                            Retry Analysis
                        </button>
                    </div>
                )}

                {analysis && !loading && (
                    <AnimatePresence mode="wait">
                        {activeTab === 'warnings' && (
                            <motion.div key="warnings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {analysis.warnings.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                        {analysis.warnings.map((w, i) => (
                                            <WarningCard key={w.disease} warning={w} index={i} />
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#10b981' }}>
                                        <div style={{ fontSize: '3rem' }}>✅</div>
                                        <h4>No Active Warnings</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            Current climate conditions do not indicate significant outbreak risk.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'timeline' && (
                            <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {analysis.timeline.length > 0 ? (
                                    <TimelineChart timeline={analysis.timeline} />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '2rem' }}>📡</div>
                                        <p>Fetch weather data first to see the 7-day outbreak timeline.</p>
                                        <p style={{ fontSize: '0.8rem' }}>Click "Auto-fill with Local Weather" on the form above.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'threats' && (
                            <motion.div key="threats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <TrendBars trendData={analysis.trendData} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {!analysis && !loading && !error && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</div>
                        <h4 style={{ color: '#ccc' }}>Outbreak Detection Ready</h4>
                        <p style={{ fontSize: '0.85rem' }}>Submit climate data above to activate the early warning system.</p>
                    </div>
                )}
            </div>

            {/* ===== FOOTER ===== */}
            <div style={{
                padding: '0.75rem 1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    🔬 Powered by multi-factor outbreak models · IDSP/WHO-calibrated thresholds
                </p>
                {analysis && (
                    <button
                        onClick={runAnalysis}
                        style={{
                            padding: '0.25rem 0.7rem', fontSize: '0.7rem',
                            borderRadius: '6px', cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#999'
                        }}
                    >
                        🔄 Re-analyze
                    </button>
                )}
            </div>

            {/* Pulse animation CSS */}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.5); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </motion.div>
    );
};

export default OutbreakDetectionPanel;
