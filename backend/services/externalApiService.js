const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WAQI_API_TOKEN = process.env.WAQI_API_TOKEN;

// ==================== IDSP Mock Data (20+ Indian Cities) ====================
const IDSP_ALERTS = {
    'Mumbai': { disease: 'Malaria', risk: 'High', cases: 450, message: 'Monsoon-related Malaria surge reported' },
    'Delhi': { disease: 'Dengue', risk: 'High', cases: 320, message: 'Dengue outbreak in multiple districts' },
    'Kerala': { disease: 'Viral Fever', risk: 'Moderate', cases: 200, message: 'Seasonal viral fever cases rising' },
    'Hyderabad': { disease: 'Typhoid', risk: 'Moderate', cases: 150, message: 'Water contamination alert in old city' },
    'Bangalore': { disease: 'Asthma', risk: 'Low', cases: 80, message: 'Air quality deteriorating near industrial zones' },
    'Chennai': { disease: 'Dengue', risk: 'High', cases: 280, message: 'Post-monsoon dengue cases spike' },
    'Kolkata': { disease: 'Malaria', risk: 'High', cases: 400, message: 'Waterlogging fueling mosquito breeding' },
    'Pune': { disease: 'Viral Fever', risk: 'Moderate', cases: 120, message: 'Temperature fluctuation causing fever spread' },
    'Jaipur': { disease: 'Asthma', risk: 'High', cases: 90, message: 'Dust storms worsening respiratory conditions' },
    'Ahmedabad': { disease: 'Dengue', risk: 'Moderate', cases: 150, message: 'Standing water areas identified' },
    'Vizag': { disease: 'Malaria', risk: 'Moderate', cases: 110, message: 'Coastal humidity increasing vector activity' },
    'Visakhapatnam': { disease: 'Malaria', risk: 'Moderate', cases: 110, message: 'Coastal humidity increasing vector activity' },
    'Lucknow': { disease: 'Typhoid', risk: 'High', cases: 180, message: 'Contaminated water supply detected' },
    'Nagpur': { disease: 'Heat Stroke', risk: 'High', cases: 95, message: 'Extreme heat wave warning' },
    'Bhopal': { disease: 'Cholera', risk: 'Moderate', cases: 65, message: 'Flood-related waterborne disease risk' },
    'Patna': { disease: 'Cholera', risk: 'High', cases: 120, message: 'Post-flood cholera cases reported' },
    'Indore': { disease: 'Viral Fever', risk: 'Low', cases: 45, message: 'Mild seasonal illness observed' },
    'Ranchi': { disease: 'Malaria', risk: 'High', cases: 220, message: 'Forest-fringe malaria zone active' },
    'Guwahati': { disease: 'Dengue', risk: 'Moderate', cases: 90, message: 'Northeast monsoon bringing vector risks' },
    'Thiruvananthapuram': { disease: 'Viral Fever', risk: 'Moderate', cases: 130, message: 'Tropical climate sustaining infections' },
    'Coimbatore': { disease: 'Asthma', risk: 'Moderate', cases: 70, message: 'Industrial emissions impacting air' },
    'Surat': { disease: 'Malaria', risk: 'High', cases: 210, message: 'Urban flooding creating breeding sites' }
};

// ==================== WHO Global Stats ====================
let WHO_STATS = {
    'Malaria': { global_cases: '247 Million', deaths: '619,000', region_high: 'Africa' },
    'Dengue': { global_cases: '390 Million', deaths: '36,000', region_high: 'SE Asia' },
    'Typhoid': { global_cases: '21 Million', deaths: '161,000', region_high: 'South Asia' },
    'Asthma': { global_cases: '262 Million', deaths: '455,000', region_high: 'Global' },
    'Cholera': { global_cases: '4 Million', deaths: '143,000', region_high: 'Africa/South Asia' },
    'Heat Stroke': { global_cases: '489,000', deaths: '356,000', region_high: 'Global (Rising)' }
};

// Fetch real WHO data on startup
const fetchWhoData = async () => {
    try {
        const res = await axios.get('https://ghoapi.azureedge.net/api/MALARIA_EST_CASES?$filter=TimeDim eq 2021');
        if (res.data && res.data.value && res.data.value.length > 0) {
            const indiaData = res.data.value.find(d => d.SpatialDim === 'IND');
            if (indiaData) {
                WHO_STATS['Malaria'].global_cases = `${parseInt(indiaData.NumericValue).toLocaleString()} (India 2021)`;
                console.log(`[WHO API] Updated Malaria stats: ${WHO_STATS['Malaria'].global_cases}`);
            }
        }
    } catch (error) {
        console.error("[WHO API] Using fallback data:", error.message);
    }
};

fetchWhoData();

exports.fetchContextData = async (lat, lon, locationName) => {
    let weatherData = null;
    let aqiData = null;

    // 1. OpenWeather
    try {
        if (OPENWEATHER_API_KEY) {
            const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
            weatherData = weatherRes.data;
        }
    } catch (err) {
        console.error("OpenWeather Error:", err.message);
    }

    // 2. AQI (Primary: Open-Meteo free API, Fallback: WAQI)
    try {
        // Try Open-Meteo first (no API key needed!)
        const omRes = await axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5`);
        aqiData = {
            aqi: omRes.data.current.us_aqi,
            pm10: omRes.data.current.pm10,
            pm2_5: omRes.data.current.pm2_5,
            source: 'Open-Meteo',
            city: { name: locationName || 'Local Region' }
        };
        console.log(`[AQI] Open-Meteo AQI: ${aqiData.aqi}, PM2.5: ${aqiData.pm2_5}`);
    } catch (err) {
        console.warn(`[AQI] Open-Meteo failed (${err.message}). Trying WAQI fallback.`);
        try {
            if (WAQI_API_TOKEN) {
                const aqiRes = await axios.get(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_API_TOKEN}`);
                if (aqiRes.data.status === 'ok') {
                    aqiData = aqiRes.data.data;
                }
            }
        } catch (e) {
            console.error('[AQI] All sources failed:', e.message);
            aqiData = { aqi: 'N/A', source: 'Unavailable' };
        }
    }

    // 3. IDSP Regional Alert
    let regionalAlert = { risk: 'Low', message: 'No specific alerts for your region.' };
    for (const [city, alert] of Object.entries(IDSP_ALERTS)) {
        if (locationName && locationName.toLowerCase().includes(city.toLowerCase())) {
            regionalAlert = alert;
            break;
        }
    }

    return {
        weather: weatherData,
        aqi: aqiData,
        regional_alert: regionalAlert,
        who_stats: WHO_STATS
    };
};
