import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTemperatureHigh, FaCloudShowersHeavy } from 'react-icons/fa';

const AlertBanner = ({ alerts }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
            <AnimatePresence>
                {alerts.map((alert, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        style={{
                            background: alert.level === 'Critical' ? 'rgba(239, 68, 68, 0.9)' :
                                alert.type === 'FLOOD' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(245, 158, 11, 0.9)',
                            backdropFilter: 'blur(10px)',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '12px'
                        }}
                    >
                        <div style={{ fontSize: '1.5rem', marginTop: '2px' }}>
                            {alert.type === 'HEATWAVE' ? <FaTemperatureHigh /> :
                                alert.type === 'FLOOD' ? <FaCloudShowersHeavy /> :
                                    <FaExclamationTriangle />}
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
                                {alert.type === 'OUTBREAK' ? 'Disease Outbreak Warning' :
                                    alert.type === 'HEATWAVE' ? 'Extreme Heat Alert' : 'Flood Risk Alert'}
                            </h4>
                            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                                {alert.message}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default AlertBanner;
