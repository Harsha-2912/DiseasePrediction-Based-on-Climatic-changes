import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const DiseaseRadarChart = ({ risks }) => {
    const { t } = useTranslation();

    if (!risks) return null;

    // Transform API data object to Recharts array format
    // Input: { "Malaria": 40, "Dengue": 30 ... }
    // Output: [ { subject: "Malaria", A: 40 }, ... ]
    const data = Object.keys(risks).map(key => ({
        subject: t(key),
        A: risks[key],
        fullMark: 100
    }));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-panel"
            style={{ padding: '1.5rem', marginTop: '2rem', borderTop: '4px solid var(--primary)' }}
        >
            <h3 style={{ marginBottom: '0.5rem' }}>{t('Disease Risk Analysis')}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {t('comparative_view_desc', 'How different diseases compare under current conditions.')}
            </p>

            <div style={{ width: '100%', height: 350, minHeight: 350 }}>
                <ResponsiveContainer width="99%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.2)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#fff', fontSize: 12 }} />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fill: '#ccc', fontSize: 10 }}
                            stroke="rgba(255,255,255,0.1)"
                        />
                        <Radar
                            name={t('Risk Probability')}
                            dataKey="A"
                            stroke="#10b981"
                            strokeWidth={3}
                            fill="#10b981"
                            fillOpacity={0.4}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#10b981' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default DiseaseRadarChart;
