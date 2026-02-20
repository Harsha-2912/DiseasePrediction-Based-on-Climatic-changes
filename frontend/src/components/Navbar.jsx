import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaHeartbeat } from 'react-icons/fa';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <motion.nav
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="navbar container"
        >
            {/* Brand */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                }}>
                    <FaHeartbeat style={{ color: '#fff', fontSize: '1.3rem' }} />
                </div>
                <div>
                    <span style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '1.35rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #6366f1, #06b6d4, #10b981)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em'
                    }}>
                        ClimateHealth
                    </span>
                    <span style={{
                        display: 'block',
                        fontSize: '0.6rem',
                        color: 'var(--text-dim)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginTop: '-2px'
                    }}>
                        Intelligence Platform
                    </span>
                </div>
            </Link>

            {/* Navigation */}
            <div className="nav-links">
                {token ? (
                    <>
                        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                            🏠 {t('Dashboard')}
                        </Link>
                        <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}>
                            📋 {t('History')}
                        </Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                                ⚙️ {t('Admin')}
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="btn"
                            style={{
                                background: 'rgba(239, 68, 68, 0.08)',
                                color: '#f87171',
                                padding: '0.45rem 1rem',
                                borderRadius: '9999px',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                fontSize: '0.85rem'
                            }}
                        >
                            {t('Logout')}
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">
                            {t('Login')}
                        </Link>
                        <Link
                            to="/register"
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', textDecoration: 'none' }}
                        >
                            {t('Register')}
                        </Link>
                    </>
                )}

                <select
                    onChange={(e) => changeLanguage(e.target.value)}
                    value={i18n.language}
                    style={{
                        width: 'auto', margin: 0,
                        padding: '0.45rem 0.6rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-muted)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                    }}
                >
                    <option value="en" style={{ background: '#1e293b', color: '#fff' }}>EN</option>
                    <option value="hi" style={{ background: '#1e293b', color: '#fff' }}>HI</option>
                    <option value="te" style={{ background: '#1e293b', color: '#fff' }}>TE</option>
                </select>
            </div>
        </motion.nav>
    );
};

export default Navbar;
