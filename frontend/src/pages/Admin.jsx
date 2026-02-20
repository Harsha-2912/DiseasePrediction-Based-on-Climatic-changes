import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';
import Navbar from '../components/Navbar';

const Admin = () => {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('dataset', file);

        setLoading(true);
        setMessage('');

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(res.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ paddingBottom: '3rem' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem' }}
                >
                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '2.5rem',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #f97316, #ef4444)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.3rem'
                    }}>
                        ⚙️ {t('Admin Panel')}
                    </h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                        Manage datasets and retrain the ML model
                    </p>
                </motion.div>

                {/* Upload Card */}
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ maxWidth: '650px', position: 'relative', overflow: 'hidden' }}
                >
                    {/* Top accent */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                        background: 'linear-gradient(90deg, #f97316, #ef4444)'
                    }} />

                    <h2 style={{
                        fontFamily: "'Outfit', sans-serif",
                        marginTop: '0.5rem', fontSize: '1.4rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        📤 {t('Upload Dataset')}
                    </h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        Upload a CSV file to retrain the machine learning model with new data patterns.
                    </p>

                    <form onSubmit={handleUpload}>
                        {/* Drag & Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            style={{
                                padding: '2.5rem 1.5rem',
                                borderRadius: '14px',
                                border: `2px dashed ${dragActive ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                background: dragActive ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255,255,255,0.02)',
                                textAlign: 'center',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                marginBottom: '1.5rem'
                            }}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                                {file ? '📄' : '☁️'}
                            </div>
                            {file ? (
                                <>
                                    <div style={{ fontWeight: '600', color: '#10b981', fontSize: '0.95rem' }}>
                                        ✅ {file.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                                        {(file.size / 1024).toFixed(1)} KB — Click to change
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                        Drag & drop your CSV file here
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                                        or click to browse files
                                    </div>
                                </>
                            )}
                            <input
                                id="file-input"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            className="btn"
                            whileTap={{ scale: 0.97 }}
                            disabled={loading || !file}
                            style={{
                                width: '100%',
                                padding: '0.9rem',
                                fontWeight: '700',
                                fontSize: '1rem',
                                background: loading || !file
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'linear-gradient(135deg, #f97316, #ef4444)',
                                color: loading || !file ? 'var(--text-dim)' : '#fff',
                                boxShadow: loading || !file ? 'none' : '0 4px 15px rgba(249, 115, 22, 0.3)',
                                borderRadius: '12px',
                                cursor: loading || !file ? 'not-allowed' : 'pointer',
                                opacity: loading || !file ? 0.5 : 1
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: '18px', height: '18px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff', borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }} />
                                    Training Model...
                                </span>
                            ) : '🚀 Upload & Train Model'}
                        </motion.button>
                    </form>

                    {/* Message */}
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: '1.5rem',
                                padding: '1rem 1.25rem',
                                background: message.toLowerCase().includes('fail')
                                    ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                border: `1px solid ${message.toLowerCase().includes('fail')
                                    ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`,
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                color: message.toLowerCase().includes('fail') ? '#f87171' : '#34d399'
                            }}
                        >
                            {message.toLowerCase().includes('fail') ? '❌' : '✅'} {message}
                        </motion.div>
                    )}
                </motion.div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

export default Admin;
