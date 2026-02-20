import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';
import { FaEye, FaEyeSlash, FaHeartbeat, FaShieldAlt, FaChartLine, FaBrain } from 'react-icons/fa';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            toast.success("Login Successful!", {
                position: "top-center",
                autoClose: 1000,
                theme: "dark"
            });
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed', {
                position: "top-center",
                theme: "dark"
            });
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: <FaBrain />, title: 'AI-Powered Predictions', desc: 'Ensemble ML models for accurate disease forecasting' },
        { icon: <FaChartLine />, title: 'Real-Time Analytics', desc: 'Live climate data with outbreak detection' },
        { icon: <FaShieldAlt />, title: 'Early Warning System', desc: 'Multi-layer intelligence for proactive health alerts' }
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
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 60px rgba(99, 102, 241, 0.08)',
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    {/* Left Panel — Brand */}
                    <div style={{
                        flex: '1 1 50%',
                        background: 'linear-gradient(160deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1), rgba(16, 185, 129, 0.08))',
                        padding: '3rem 2.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative circles */}
                        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.08)', filter: 'blur(40px)' }} />
                        <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.08)', filter: 'blur(40px)' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
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
                            fontSize: '1.6rem',
                            fontWeight: '700',
                            lineHeight: 1.3,
                            color: '#e2e8f0',
                            marginBottom: '1.5rem'
                        }}>
                            Predict diseases.<br />
                            <span style={{ color: '#818cf8' }}>Protect lives.</span>
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {features.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.15 }}
                                    style={{
                                        display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.04)'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '1rem', color: '#818cf8',
                                        marginTop: '2px', flexShrink: 0
                                    }}>{f.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>{f.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{f.desc}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel — Form */}
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
                            Welcome Back
                        </h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                            Sign in to your account
                        </p>

                        <form onSubmit={handleSubmit}>
                            <label>👤 Username</label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />

                            <label>🔒 Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
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
                                    marginTop: '0.5rem'
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
                                        Signing in...
                                    </div>
                                ) : (
                                    `🚀 ${t('Login')}`
                                )}
                            </motion.button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{
                                color: 'var(--primary-light, #818cf8)',
                                textDecoration: 'none',
                                fontWeight: '600'
                            }}>
                                Create one →
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    div[style*="flex: 1 1 50%"]:first-child {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Login;
