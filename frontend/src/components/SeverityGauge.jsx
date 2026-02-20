import React from 'react';
import { motion } from 'framer-motion';

const SeverityGauge = ({ severity, riskScore }) => {
    const levels = ['Low', 'Moderate', 'High', 'Critical'];
    const colors = ['#10b981', '#f59e0b', '#ef4444', '#dc2626'];
    const activeIndex = levels.indexOf(severity);
    const score = riskScore || 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="card"
            style={{ textAlign: 'center', border: `1px solid ${colors[activeIndex] || '#6b7280'}` }}
        >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-muted)' }}>⚡ Health Severity</h3>

            {/* Gauge Bar */}
            <div style={{
                width: '100%',
                height: '12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '1rem'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                        height: '100%',
                        borderRadius: '8px',
                        background: `linear-gradient(to right, #10b981, #f59e0b, #ef4444, #dc2626)`
                    }}
                />
            </div>

            {/* Level Indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                {levels.map((level, i) => (
                    <div key={level} style={{
                        textAlign: 'center',
                        flex: 1,
                        opacity: i <= activeIndex ? 1 : 0.3,
                        transition: 'opacity 0.3s'
                    }}>
                        <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: i <= activeIndex ? colors[i] : 'rgba(255,255,255,0.2)',
                            margin: '0 auto 0.3rem',
                            boxShadow: i === activeIndex ? `0 0 12px ${colors[i]}` : 'none',
                            transition: 'all 0.3s'
                        }} />
                        <span style={{
                            fontSize: '0.7rem',
                            color: i === activeIndex ? colors[i] : 'var(--text-muted)',
                            fontWeight: i === activeIndex ? 'bold' : 'normal'
                        }}>
                            {level}
                        </span>
                    </div>
                ))}
            </div>

            {/* Score */}
            <div>
                <span style={{ fontSize: '3rem', fontWeight: '800', color: colors[activeIndex] || '#fff' }}>
                    {score}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Overall Health Risk Score
            </p>
        </motion.div>
    );
};

export default SeverityGauge;
