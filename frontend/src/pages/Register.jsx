import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';
import { FaEye, FaEyeSlash, FaHeartbeat, FaGlobeAsia, FaCloudSunRain, FaVirusSlash } from 'react-icons/fa';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success("Account created! Redirecting to login...", {
                position: "top-center",
                autoClose: 2000,
                theme: "dark",
            });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed', {
                position: "top-center",
                theme: "dark"
            });
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { icon: <FaGlobeAsia />, value: '22+', label: 'Indian Cities Monitored' },
        { icon: <FaCloudSunRain />, value: '8', label: 'Diseases Detected' },
        { icon: <FaVirusSlash />, value: '95%', label: 'Prediction Accuracy' }
    ];

    return (
        <>
            <ToastContainer />
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                        display: 'flex',
                        maxWidth: '950px',
                        width: '100%',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 60px rgba(6, 182, 212, 0.08)',
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    {/* Left Panel — Form */}
                    <div style={{
                        flex: '1 1 50%',
                        padding: '3rem 2.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <h2 style={{
                            fontFamily: "'Outfit', sans-serif",
                            textAlign: 'center',
                            marginBottom: '0.25rem',
                            fontSize: '1.5rem'
                        }}>
                            Create Account
                        </h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                            Join the intelligence platform
                        </p>

                        <form onSubmit={handleSubmit}>
                            <label>👤 Username</label>
                            <input
                                type="text"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />

                            <label>🔒 Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Choose a strong password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    style={{ paddingRight: '45px', width: '100%', boxSizing: 'border-box' }}
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%',
                                        transform: 'translateY(-50%)', cursor: 'pointer',
                                        color: 'var(--text-dim)', display: 'flex', alignItems: 'center'
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </span>
                            </div>

                            <motion.button
                                type="submit"
                                className="btn btn-primary"
                                whileTap={{ scale: 0.97 }}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '0.9rem',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    marginTop: '0.5rem',
                                    background: 'linear-gradient(135deg, #06b6d4, #10b981)'
                                }}
                            >
                                {loading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: '18px', height: '18px',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: '#fff',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite'
                                        }} />
                                        Creating account...
                                    </div>
                                ) : (
                                    `✨ ${t('Register')}`
                                )}
                            </motion.button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{
                                color: '#22d3ee',
                                textDecoration: 'none',
                                fontWeight: '600'
                            }}>
                                ← Sign in
                            </Link>
                        </p>
                    </div>

                    {/* Right Panel — Brand */}
                    <div style={{
                        flex: '1 1 50%',
                        background: 'linear-gradient(160deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.08), rgba(245, 158, 11, 0.06))',
                        padding: '3rem 2.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        borderLeft: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative */}
                        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.06)', filter: 'blur(50px)' }} />
                        <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.06)', filter: 'blur(40px)' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
                            }}>
                                <FaHeartbeat style={{ color: '#fff', fontSize: '1.4rem' }} />
                            </div>
                            <div>
                                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>
                                    ClimateHealth
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    Intelligence Platform
                                </div>
                            </div>
                        </div>

                        <h2 style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            lineHeight: 1.3,
                            color: '#e2e8f0',
                            marginBottom: '1.5rem'
                        }}>
                            Climate meets<br />
                            <span style={{ color: '#22d3ee' }}>health intelligence.</span>
                        </h2>

                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            {stats.map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    style={{
                                        flex: '1',
                                        textAlign: 'center',
                                        padding: '0.9rem 0.5rem',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        minWidth: '80px'
                                    }}
                                >
                                    <div style={{ fontSize: '1rem', color: '#22d3ee', marginBottom: '0.25rem' }}>{s.icon}</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>{s.value}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{s.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                            Get real-time disease predictions powered by AI, weather data analysis, and outbreak detection for 22+ Indian cities.
                        </p>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    div[style*="flex: 1 1 50%"]:last-child {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Register;
