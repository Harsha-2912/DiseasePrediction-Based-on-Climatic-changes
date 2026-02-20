import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FEATURE_META = {
    Temperature: { icon: '🌡️', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
    Humidity: { icon: '💧', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
    Rainfall: { icon: '🌧️', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
    AQI: { icon: '🌫️', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' }
};

const DIRECTION_LABELS = {
    high_risk: { label: 'HIGH IMPACT', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    moderate: { label: 'MODERATE', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    low_risk: { label: 'LOW IMPACT', color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div style={{
                background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '0.75rem 1rem', backdropFilter: 'blur(10px)'
            }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    {FEATURE_META[d.name]?.icon} {d.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Importance: <b style={{ color: '#fff' }}>{d.importance}%</b>
                </div>
            </div>
        );
    }
    return null;
};

const ExplainableAIPanel = ({ explainability, disease }) => {
    const [activeTab, setActiveTab] = useState('importance');

    const tabs = [
        { id: 'importance', label: '📊 Feature Importance', desc: 'How much each factor matters' },
        { id: 'reasoning', label: '🧠 AI Reasoning', desc: 'Why the AI made this prediction' },
        { id: 'waterfall', label: '📈 Risk Waterfall', desc: 'Step-by-step risk buildup' }
    ];

    const chartData = useMemo(() => {
        if (!explainability?.reasoning) return [];
        return explainability.reasoning.map(r => ({
            name: r.feature,
            importance: r.importance,
            value: r.value,
            unit: r.unit,
            color: FEATURE_META[r.feature]?.color || '#6366f1'
        }));
    }, [explainability]);

    const waterfallData = useMemo(() => {
        if (!explainability?.waterfall) return [];
        return explainability.waterfall;
    }, [explainability]);

    if (!explainability) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
                marginTop: '2rem',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(16px)',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Top gradient accent */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #f59e0b)'
            }} />

            {/* ===== HEADER ===== */}
            <div style={{ padding: '1.5rem 1.5rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h3 style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '1.3rem', fontWeight: '800', margin: 0,
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.4rem' }}>🔍</span>
                            Explainable AI
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0.25rem 0 0' }}>
                            Understand why <b style={{ color: '#a78bfa' }}>{disease}</b> was predicted
                        </p>
                    </div>
                    <div style={{
                        padding: '0.3rem 0.75rem', borderRadius: '999px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        fontSize: '0.7rem', fontWeight: '700', color: '#a78bfa',
                        letterSpacing: '0.05em'
                    }}>
                        XAI ENGINE v2.0
                    </div>
                </div>

                {/* Summary */}
                {explainability.explanation_summary && (
                    <div style={{
                        marginTop: '1rem', padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06), rgba(236, 72, 153, 0.04))',
                        border: '1px solid rgba(139, 92, 246, 0.1)',
                        fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5
                    }}>
                        💡 <b style={{ color: '#e2e8f0' }}>Key Insight:</b> {explainability.explanation_summary}
                    </div>
                )}

                {/* Dominant Feature Badge */}
                {explainability.dominant_feature && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.25rem 0.7rem', borderRadius: '999px',
                            background: FEATURE_META[explainability.dominant_feature]?.gradient || '#6366f1',
                            fontSize: '0.7rem', fontWeight: '700', color: '#fff',
                            boxShadow: `0 3px 10px ${FEATURE_META[explainability.dominant_feature]?.color}40`
                        }}>
                            {FEATURE_META[explainability.dominant_feature]?.icon} Dominant: {explainability.dominant_feature}
                        </div>
                        {explainability.reasoning?.map(r => (
                            <div key={r.feature} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                padding: '0.2rem 0.5rem', borderRadius: '999px',
                                background: DIRECTION_LABELS[r.direction]?.bg,
                                border: `1px solid ${DIRECTION_LABELS[r.direction]?.color}30`,
                                fontSize: '0.6rem', fontWeight: '600',
                                color: DIRECTION_LABELS[r.direction]?.color
                            }}>
                                {FEATURE_META[r.feature]?.icon} {r.importance}%
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ===== TAB BAR ===== */}
            <div style={{
                display: 'flex', gap: '0.25rem', padding: '1rem 1.5rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '8px 8px 0 0',
                            border: 'none',
                            background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                            color: activeTab === tab.id ? '#a78bfa' : 'var(--text-dim)',
                            fontWeight: activeTab === tab.id ? '700' : '500',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderBottom: activeTab === tab.id ? '2px solid #a78bfa' : '2px solid transparent',
                            fontFamily: "'Inter', sans-serif"
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ===== TAB CONTENT ===== */}
            <div style={{ padding: '1.5rem' }}>
                <AnimatePresence mode="wait">
                    {/* ─── FEATURE IMPORTANCE TAB ─── */}
                    {activeTab === 'importance' && (
                        <motion.div
                            key="importance"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Bar Chart */}
                            <div style={{
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '12px',
                                padding: '1rem 0.5rem 0.5rem 0',
                                border: '1px solid rgba(255,255,255,0.04)',
                                marginBottom: '1.25rem'
                            }}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={chartData} layout="vertical" barCategoryGap="20%">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                        <XAxis type="number" domain={[0, 'auto']} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} unit="%" />
                                        <YAxis
                                            dataKey="name" type="category" width={90}
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                            axisLine={false} tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={false} />
                                        <Bar dataKey="importance" radius={[0, 6, 6, 0]} animationDuration={1200}>
                                            {chartData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Importance Breakdown Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                                {chartData.map((d, i) => (
                                    <motion.div
                                        key={d.name}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 + i * 0.08 }}
                                        style={{
                                            padding: '0.9rem',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${d.color}20`,
                                            textAlign: 'center',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Mini progress bar at bottom */}
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0,
                                            height: '3px', width: `${d.importance}%`,
                                            background: d.color, opacity: 0.6,
                                            borderRadius: '0 3px 0 0'
                                        }} />
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>
                                            {FEATURE_META[d.name]?.icon}
                                        </div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: d.color, fontFamily: "'Outfit', sans-serif" }}>
                                            {d.importance}%
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600', marginTop: '0.1rem' }}>
                                            {d.name}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                                            {d.value}{d.unit}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Model vs Rules Comparison */}
                            {explainability.model_importance && explainability.rule_importance && (
                                <div style={{
                                    marginTop: '1.25rem', padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.04)'
                                }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                        🤖 ML Model vs 📐 Expert Rules — Importance Comparison
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {Object.keys(explainability.model_importance).map((key) => {
                                            const mi = Math.round(explainability.model_importance[key] * 100);
                                            const ri = Math.round(explainability.rule_importance[key] * 100);
                                            const meta = FEATURE_META[key] || {};
                                            return (
                                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ width: '90px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                        {meta.icon} {key}
                                                    </span>
                                                    <div style={{ flex: 1, display: 'flex', gap: '3px', alignItems: 'center' }}>
                                                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${mi}%`, height: '100%', background: '#8b5cf6', borderRadius: '3px' }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.65rem', color: '#8b5cf6', width: '30px', fontWeight: '600' }}>{mi}%</span>
                                                    </div>
                                                    <div style={{ flex: 1, display: 'flex', gap: '3px', alignItems: 'center' }}>
                                                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${ri}%`, height: '100%', background: '#ec4899', borderRadius: '3px' }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.65rem', color: '#ec4899', width: '30px', fontWeight: '600' }}>{ri}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                                        <span style={{ fontSize: '0.6rem', color: '#8b5cf6', fontWeight: '600' }}>■ ML Model</span>
                                        <span style={{ fontSize: '0.6rem', color: '#ec4899', fontWeight: '600' }}>■ Expert Rules</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ─── AI REASONING TAB ─── */}
                    {activeTab === 'reasoning' && (
                        <motion.div
                            key="reasoning"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {explainability.reasoning?.map((r, i) => {
                                    const meta = FEATURE_META[r.feature] || {};
                                    const dir = DIRECTION_LABELS[r.direction] || DIRECTION_LABELS.low_risk;
                                    return (
                                        <motion.div
                                            key={r.feature}
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            style={{
                                                padding: '1rem 1.25rem',
                                                borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.02)',
                                                border: `1px solid ${meta.color}15`,
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Left accent */}
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, bottom: 0,
                                                width: '3px', background: meta.gradient || meta.color
                                            }} />

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '1.3rem' }}>{meta.icon}</span>
                                                    <div>
                                                        <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#e2e8f0' }}>
                                                            {r.feature}
                                                        </span>
                                                        <span style={{
                                                            marginLeft: '0.5rem', fontSize: '0.85rem',
                                                            fontWeight: '800', color: meta.color,
                                                            fontFamily: "'Outfit', sans-serif"
                                                        }}>
                                                            {r.value}{r.unit}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{
                                                        padding: '0.15rem 0.5rem', borderRadius: '999px',
                                                        background: dir.bg, color: dir.color,
                                                        fontSize: '0.6rem', fontWeight: '700',
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        {dir.label}
                                                    </span>
                                                    <span style={{
                                                        fontWeight: '800', color: meta.color,
                                                        fontSize: '1rem', fontFamily: "'Outfit', sans-serif"
                                                    }}>
                                                        {r.importance}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Reasoning text */}
                                            <p style={{
                                                margin: 0, fontSize: '0.8rem', color: '#94a3b8',
                                                lineHeight: 1.5, paddingLeft: '2rem'
                                            }}>
                                                {r.reasoning}
                                            </p>

                                            {/* Importance bar */}
                                            <div style={{
                                                marginTop: '0.6rem', marginLeft: '2rem',
                                                height: '4px', background: 'rgba(255,255,255,0.04)',
                                                borderRadius: '2px', overflow: 'hidden'
                                            }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${r.importance}%` }}
                                                    transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                                                    style={{ height: '100%', background: meta.gradient || meta.color, borderRadius: '2px' }}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ─── RISK WATERFALL TAB ─── */}
                    {activeTab === 'waterfall' && (
                        <motion.div
                            key="waterfall"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                                Shows how each climate factor incrementally builds up the final risk score, similar to SHAP waterfall plots in professional ML.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {waterfallData.map((step, i) => {
                                    const isBase = step.type === 'base';
                                    const isTotal = step.type === 'total';
                                    const meta = FEATURE_META[step.label] || {};
                                    const barColor = isBase ? '#64748b' : isTotal ? '#a78bfa' : (meta.color || '#6366f1');
                                    const maxVal = Math.max(...waterfallData.map(s => s.cumulative), 100);

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '8px',
                                                background: isTotal ? 'rgba(167, 139, 250, 0.06)' : 'rgba(255,255,255,0.02)',
                                                border: isTotal ? '1px solid rgba(167, 139, 250, 0.15)' : '1px solid rgba(255,255,255,0.03)'
                                            }}
                                        >
                                            {/* Label */}
                                            <div style={{ width: '100px', flexShrink: 0 }}>
                                                <div style={{
                                                    fontSize: '0.8rem', fontWeight: isTotal ? '800' : '600',
                                                    color: isTotal ? '#a78bfa' : '#e2e8f0',
                                                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                                                }}>
                                                    {!isBase && !isTotal && meta.icon}
                                                    {step.label}
                                                </div>
                                            </div>

                                            {/* Delta */}
                                            <div style={{
                                                width: '60px', textAlign: 'right', flexShrink: 0,
                                                fontSize: '0.8rem', fontWeight: '700',
                                                color: isBase ? '#64748b' : (step.value > 0 ? '#ef4444' : '#10b981'),
                                                fontFamily: "'Outfit', sans-serif"
                                            }}>
                                                {isBase ? '' : (step.value > 0 ? '+' : '')}{isBase ? '' : step.value}
                                            </div>

                                            {/* Bar */}
                                            <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '5px', overflow: 'hidden' }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(step.cumulative / maxVal) * 100}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.12 }}
                                                    style={{
                                                        height: '100%',
                                                        background: isTotal
                                                            ? 'linear-gradient(90deg, #8b5cf6, #ec4899)'
                                                            : barColor,
                                                        borderRadius: '5px',
                                                        opacity: 0.8
                                                    }}
                                                />
                                            </div>

                                            {/* Cumulative */}
                                            <div style={{
                                                width: '45px', textAlign: 'right', flexShrink: 0,
                                                fontSize: '0.8rem', fontWeight: '800',
                                                color: barColor, fontFamily: "'Outfit', sans-serif"
                                            }}>
                                                {step.cumulative}%
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div style={{
                                marginTop: '1rem', padding: '0.75rem',
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.6
                            }}>
                                <b style={{ color: '#e2e8f0' }}>How to read:</b> Starting from a base rate of 12.5% (equal probability across 8 diseases),
                                each climate feature adds its contribution to build the final risk score. Think of this as a
                                SHAP-style explanation showing how the AI decision unfolds step by step.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ExplainableAIPanel;
