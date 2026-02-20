import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ModelComparison = ({ data }) => {
    const { t } = useTranslation();

    if (!data || data.length === 0) return null;

    // Custom Tick to truncate long model names if needed
    const CustomizedAxisTick = (props) => {
        const { x, y, stroke, payload } = props;
        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
                    {payload.value}
                </text>
            </g>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel"
            style={{ padding: '1.5rem', marginTop: '2rem', borderLeft: '4px solid var(--secondary)' }}
        >
            <h3 style={{ marginBottom: '0.5rem' }}>{t('AI Model Consensus')}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Comparing confidence scores from different algorithms to ensure accuracy.
            </p>

            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                <ResponsiveContainer width="99%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{
                            top: 5,
                            right: 30,
                            left: 40,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="model" type="category" width={100} tick={{ fill: '#fff' }} />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                        />
                        <Bar dataKey="confidence" name="Confidence (%)" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.confidence > 80 ? '#10b981' : entry.confidence > 50 ? '#fbbf24' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default ModelComparison;
