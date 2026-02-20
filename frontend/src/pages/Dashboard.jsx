import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ForecastChart from '../components/ForecastChart';
import ErrorBoundary from '../components/ErrorBoundary';
import ModelComparison from '../components/ModelComparison';
import AlertBanner from '../components/AlertBanner';
import DiseaseRadarChart from '../components/DiseaseRadarChart';
import DiseaseBarChart from '../components/DiseaseBarChart';
import DiseasePieChart from '../components/DiseasePieChart';
import SeverityGauge from '../components/SeverityGauge';
import DiseaseIntelligenceMap from '../components/DiseaseIntelligenceMap';
import OutbreakDetectionPanel from '../components/OutbreakDetectionPanel';
import Chatbot from '../components/Chatbot';
import ExplainableAIPanel from '../components/ExplainableAIPanel';
import generateReport from '../utils/ReportGenerator';

// ==================== SEVERITY CONFIG ====================
const SEVERITY_STYLES = {
    Critical: { bg: 'linear-gradient(135deg, #dc2626, #b91c1c)', shadow: 'rgba(220,38,38,0.4)' },
    High: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', shadow: 'rgba(239,68,68,0.3)' },
    Moderate: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: 'rgba(245,158,11,0.3)' },
    Low: { bg: 'linear-gradient(135deg, #10b981, #059669)', shadow: 'rgba(16,185,129,0.3)' }
};

const Dashboard = () => {
    const { t } = useTranslation();
    const resultRef = useRef(null);
    const [formData, setFormData] = useState({
        temperature: '',
        humidity: '',
        rainfall: '',
        aqi: '',
        location: ''
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [externalData, setExternalData] = useState(null);
    const [fetchingWeather, setFetchingWeather] = useState(false);
    const [forecastData, setForecastData] = useState([]);
    const [alerts, setAlerts] = useState([]);

    const fetchWeather = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser", { theme: "dark" });
            return;
        }

        setFetchingWeather(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const extRes = await api.get(`/external/context?lat=${latitude}&lon=${longitude}`);
                setExternalData(extRes.data);

                if (extRes.data.weather) {
                    setFormData(prev => ({
                        ...prev,
                        temperature: extRes.data.weather.temp || prev.temperature,
                        humidity: extRes.data.weather.humidity || prev.humidity,
                        rainfall: extRes.data.weather.rainfall || prev.rainfall,
                        aqi: extRes.data.aqi?.aqi || prev.aqi,
                        location: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`
                    }));
                }

                if (extRes.data.regional_alert) {
                    setAlerts([extRes.data.regional_alert]);
                }

                toast.success("📍 Weather data loaded!", { theme: "dark" });
            } catch (err) {
                toast.error("Failed to fetch weather data", { theme: "dark" });
            } finally {
                setFetchingWeather(false);
            }
        }, (err) => {
            toast.error("Location access denied", { theme: "dark" });
            setFetchingWeather(false);
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const res = await api.post('/predict', formData);
            setResult(res.data);
            toast.success("✅ Prediction generated!", { theme: "dark" });
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Prediction failed', { theme: "dark" });
        } finally {
            setLoading(false);
        }
    };

    const sevStyle = result?.severity ? SEVERITY_STYLES[result.severity] || SEVERITY_STYLES.Low : null;

    return (
        <ErrorBoundary>
            <Navbar />
            <ToastContainer />
            <AlertBanner alerts={alerts} />
            <div className="container" style={{ paddingBottom: '3rem' }}>

                {/* ==================== HERO HEADER ==================== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '2rem' }}
                >
                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '2.8rem',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 35%, #10b981 65%, #f59e0b 100%)',
                        backgroundSize: '300% 300%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'gradientFlow 8s ease infinite',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.03em'
                    }}>
                        {t('Climate Disease Intelligence')}
                    </h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                        AI-powered prediction engine analyzing climate patterns to forecast disease outbreaks
                    </p>
                </motion.div>

                {/* ==================== LIVE INTELLIGENCE WIDGET ==================== */}
                {externalData && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginBottom: '2rem',
                            padding: '1.25rem 1.5rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(99, 102, 241, 0.15)',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(6, 182, 212, 0.04))',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <h3 style={{
                            margin: '0 0 1rem',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>🌍</span> Live Health Intelligence
                            <span style={{
                                marginLeft: 'auto', fontSize: '0.65rem',
                                padding: '0.2rem 0.6rem', borderRadius: '999px',
                                background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                                fontWeight: '600', letterSpacing: '0.05em'
                            }}>● LIVE</span>
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{
                                padding: '1rem', borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.06)',
                                border: '1px solid rgba(239, 68, 68, 0.1)'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', fontWeight: '600' }}>📡 Regional Alerts (IDSP)</div>
                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: externalData.regional_alert?.risk === 'High' ? '#ef4444' : '#fbbf24' }}>
                                    {externalData.regional_alert?.risk} Risk
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                    {externalData.regional_alert?.message}
                                </div>
                            </div>
                            <div style={{
                                padding: '1rem', borderRadius: '12px',
                                background: 'rgba(99, 102, 241, 0.06)',
                                border: '1px solid rgba(99, 102, 241, 0.1)'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', fontWeight: '600' }}>🏥 WHO Global Stats</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Malaria: <b style={{ color: '#ef4444' }}>{externalData.who_stats?.Malaria?.global_cases}</b> cases
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Dengue: <b style={{ color: '#f97316' }}>{externalData.who_stats?.Dengue?.global_cases}</b> cases
                                </div>
                            </div>
                            <div style={{
                                padding: '1rem', borderRadius: '12px',
                                background: 'rgba(6, 182, 212, 0.06)',
                                border: '1px solid rgba(6, 182, 212, 0.1)'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', fontWeight: '600' }}>🌫️ Local Air Quality</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#22d3ee', lineHeight: 1 }}>
                                    {externalData.aqi?.aqi || 'N/A'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>AQI Index</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ==================== MAIN GRID ==================== */}
                <div className="grid">
                    {/* ===== INPUT FORM CARD ===== */}
                    <motion.div
                        className="card"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ position: 'relative' }}
                    >
                        {/* Auto-fill button */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <motion.button
                                type="button"
                                onClick={fetchWeather}
                                whileTap={{ scale: 0.97 }}
                                className="btn"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.12))',
                                    color: '#22d3ee',
                                    border: '1px solid rgba(6, 182, 212, 0.2)',
                                    borderRadius: '12px',
                                    fontWeight: '600'
                                }}
                                disabled={fetchingWeather}
                            >
                                {fetchingWeather ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '14px', height: '14px', border: '2px solid rgba(34,211,238,0.3)', borderTopColor: '#22d3ee', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                        Fetching Location & Weather...
                                    </span>
                                ) : '📍 Auto-fill with Local Weather'}
                            </motion.button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label>🌡️ {t('Temperature')} (°C)</label>
                            <input name="temperature" type="number" step="0.1" placeholder="e.g. 30" value={formData.temperature} onChange={handleChange} required />

                            <label>💧 {t('Humidity')} (%)</label>
                            <input name="humidity" type="number" step="0.1" placeholder="e.g. 75" value={formData.humidity} onChange={handleChange} required />

                            <label>🌧️ {t('Rainfall')} (mm)</label>
                            <input name="rainfall" type="number" step="0.1" placeholder="e.g. 200" value={formData.rainfall} onChange={handleChange} required />

                            <label>🌫️ {t('AQI')}</label>
                            <input name="aqi" type="number" step="0.1" placeholder="e.g. 150" value={formData.aqi} onChange={handleChange} required />

                            <label>📍 {t('Location')}</label>
                            <input name="location" type="text" placeholder="Auto-detected or manual" value={formData.location} onChange={handleChange} />

                            <motion.button
                                type="submit"
                                className="btn btn-primary"
                                whileTap={{ scale: 0.97 }}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    marginTop: '0.75rem',
                                    padding: '0.9rem',
                                    fontWeight: '700',
                                    fontSize: '1rem'
                                }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                        Analyzing Climate Data...
                                    </span>
                                ) : `🔬 ${t('Analyze & Predict')}`}
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* ===== RESULT CARD ===== */}
                    {result && (
                        <motion.div
                            ref={resultRef}
                            className="card"
                            style={{
                                height: 'fit-content',
                                border: `1px solid ${sevStyle?.shadow?.replace('0.3', '0.3') || 'rgba(245,158,11,0.2)'}`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        >
                            {/* Top gradient accent */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                background: sevStyle?.bg || 'var(--gradient-primary)'
                            }} />

                            {/* Severity Badge */}
                            {result.severity && (
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.3rem 0.8rem', borderRadius: '999px',
                                    background: sevStyle?.bg,
                                    boxShadow: `0 4px 12px ${sevStyle?.shadow}`,
                                    fontSize: '0.75rem', fontWeight: '700', color: '#fff',
                                    marginBottom: '1rem', letterSpacing: '0.05em'
                                }}>
                                    {result.severity === 'Critical' ? '🚨' : result.severity === 'High' ? '⚠️' : result.severity === 'Moderate' ? '🔶' : '✅'}
                                    {result.severity.toUpperCase()} RISK
                                </div>
                            )}

                            <h3 style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '500' }}>Predicted Disease</h3>
                            <p style={{
                                fontSize: '2.2rem', fontWeight: '900', margin: 0,
                                fontFamily: "'Outfit', sans-serif",
                                background: 'linear-gradient(135deg, #f1f5f9, #cbd5e1)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                lineHeight: 1.1
                            }}>
                                {result.disease}
                            </p>

                            {/* Accuracy */}
                            <div style={{ marginTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '500' }}>Confidence</span>
                                    <span style={{ fontWeight: '700', color: '#06b6d4', fontSize: '0.95rem' }}>{result.accuracy}%</span>
                                </div>
                                <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${result.accuracy}%` }}
                                        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                                        style={{
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                                            borderRadius: '999px'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Precautions */}
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                                    🛡️ Precautions
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    {(result.precautions || ['Consult a doctor immediately', 'Monitor symptoms closely', 'Maintain hygiene and hydration']).map((p, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '8px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.04)',
                                                fontSize: '0.8rem',
                                                color: 'var(--text-muted)',
                                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            <span style={{ color: '#818cf8', fontSize: '0.7rem' }}>▸</span>
                                            {p}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Download Button */}
                            <motion.button
                                onClick={() => generateReport(result, formData, forecastData, alerts)}
                                whileTap={{ scale: 0.97 }}
                                className="btn"
                                style={{
                                    marginTop: '1.5rem',
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(245, 158, 11, 0.08)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    color: '#fbbf24',
                                    borderRadius: '12px',
                                    fontWeight: '600'
                                }}
                            >
                                📄 {t('Download Medical Report')}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Disease Radar Chart */}
                    {result && result.disease_risks && (
                        <ErrorBoundary>
                            <DiseaseRadarChart risks={result.disease_risks} />
                        </ErrorBoundary>
                    )}

                    {/* Ensemble Comparison */}
                    {result && result.ensemble && (
                        <ErrorBoundary>
                            <ModelComparison data={result.ensemble} />
                        </ErrorBoundary>
                    )}
                </div>

                {/* ==================== EXPLAINABLE AI ==================== */}
                {result && result.explainability && (
                    <ErrorBoundary>
                        <ExplainableAIPanel
                            explainability={result.explainability}
                            disease={result.disease}
                        />
                    </ErrorBoundary>
                )}

                {/* ==================== CHARTS SECTION ==================== */}
                {result && result.disease_risks && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ marginTop: '2rem' }}
                    >
                        <h3 style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            marginBottom: '1rem',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <span>📊</span> Advanced Risk Analytics
                        </h3>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                            <ErrorBoundary><DiseaseBarChart risks={result.disease_risks} /></ErrorBoundary>
                            <ErrorBoundary><DiseasePieChart risks={result.disease_risks} /></ErrorBoundary>
                            <ErrorBoundary><SeverityGauge score={result.accuracy} severity={result.severity} /></ErrorBoundary>
                        </div>
                    </motion.div>
                )}

                {/* Forecast */}
                {forecastData && forecastData.length > 0 && (
                    <ErrorBoundary>
                        <ForecastChart data={forecastData} />
                    </ErrorBoundary>
                )}

                {/* Intelligence Map */}
                {formData.location && formData.location.includes("Lat:") && (
                    <ErrorBoundary>
                        <DiseaseIntelligenceMap
                            lat={parseFloat(formData.location.split('Lat: ')[1].split(',')[0])}
                            lon={parseFloat(formData.location.split('Lon: ')[1])}
                            disease={result ? result.disease : 'No Disease'}
                            diseaseRisks={result ? result.disease_risks : null}
                            formData={formData}
                        />
                    </ErrorBoundary>
                )}

                {/* Outbreak Detection */}
                {formData.temperature && formData.humidity && (
                    <ErrorBoundary>
                        <OutbreakDetectionPanel
                            formData={formData}
                            forecastData={forecastData}
                        />
                    </ErrorBoundary>
                )}
            </div>

            {/* AI Assistant */}
            <Chatbot />

            {/* Spinner animation */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes gradientFlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </ErrorBoundary>
    );
};

export default Dashboard;
