import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ForecastChart = ({ data }) => {
    const { t } = useTranslation();

    if (!data || data.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel"
            style={{ padding: '1.5rem', marginTop: '2rem' }}
        >
            <h3 style={{ marginBottom: '1rem' }}>{t('7-Day Disease Risk Forecast')}</h3>
            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                <ResponsiveContainer width="99%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#ccc" />
                        <YAxis stroke="#ccc" />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="temp" stroke="#ff7300" name={t('Temperature (°C)')} />
                        <Line type="monotone" dataKey="risk_score" stroke="#ff0000" name={t('Risk Score (0-100)')} />
                        <Line type="monotone" dataKey="humidity" stroke="#387908" name={t('Humidity (%)')} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default ForecastChart;
