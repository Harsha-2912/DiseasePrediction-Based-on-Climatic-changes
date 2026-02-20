import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#06b6d4'];

const DiseaseBarChart = ({ risks }) => {
    if (!risks) return null;

    const data = Object.entries(risks)
        .map(([name, value]) => ({ name, risk: value }))
        .sort((a, b) => b.risk - a.risk);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel"
            style={{ padding: '1.5rem', borderTop: '4px solid #f97316' }}
        >
            <h3 style={{ marginBottom: '0.5rem' }}>📊 Disease Risk Breakdown</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Comparative risk levels for all tracked diseases
            </p>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="99%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" domain={[0, 100]} stroke="#ccc" />
                        <YAxis dataKey="name" type="category" stroke="#ccc" width={80} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                            formatter={(value) => [`${value}%`, 'Risk']}
                        />
                        <Bar dataKey="risk" radius={[0, 6, 6, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList dataKey="risk" position="right" fill="#fff" formatter={(v) => `${v}%`} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default DiseaseBarChart;
