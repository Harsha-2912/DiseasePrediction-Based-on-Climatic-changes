const axios = require('axios');

// ==================== DISEASE OUTBREAK THRESHOLDS ====================
const OUTBREAK_THRESHOLDS = {
    'Malaria': {
        tempRange: [25, 40], humidityMin: 65, rainfallMin: 80,
        riskMultiplier: 1.3, incubation: '10-15 days',
        vector: 'Anopheles mosquito', transmission: 'Vector-borne',
        seasonalPeak: [6, 7, 8, 9, 10] // June - October
    },
    'Dengue': {
        tempRange: [25, 38], humidityMin: 60, rainfallMin: 50,
        riskMultiplier: 1.4, incubation: '4-10 days',
        vector: 'Aedes aegypti', transmission: 'Vector-borne',
        seasonalPeak: [7, 8, 9, 10, 11]
    },
    'Typhoid': {
        tempRange: [20, 40], humidityMin: 50, rainfallMin: 150,
        riskMultiplier: 1.2, incubation: '6-30 days',
        vector: 'Contaminated water/food', transmission: 'Waterborne',
        seasonalPeak: [6, 7, 8, 9]
    },
    'Cholera': {
        tempRange: [20, 42], humidityMin: 60, rainfallMin: 200,
        riskMultiplier: 1.5, incubation: '2-5 days',
        vector: 'Contaminated water', transmission: 'Waterborne',
        seasonalPeak: [6, 7, 8, 9]
    },
    'Asthma': {
        tempRange: [0, 50], humidityMin: 0, rainfallMin: 0, aqiMin: 120,
        riskMultiplier: 1.1, incubation: 'Immediate',
        vector: 'Airborne pollutants', transmission: 'Environmental',
        seasonalPeak: [10, 11, 12, 1, 2]
    },
    'Viral Fever': {
        tempRange: [0, 20, 35, 50], humidityMin: 40, rainfallMin: 0,
        riskMultiplier: 1.0, incubation: '1-5 days',
        vector: 'Person-to-person', transmission: 'Airborne/Contact',
        seasonalPeak: [11, 12, 1, 2, 3]
    },
    'Heat Stroke': {
        tempRange: [38, 55], humidityMin: 0, rainfallMin: 0,
        riskMultiplier: 1.6, incubation: 'Immediate',
        vector: 'Extreme heat', transmission: 'Environmental',
        seasonalPeak: [3, 4, 5, 6]
    }
};

// ==================== OUTBREAK ANALYSIS ENGINE ====================
function analyzeOutbreakRisk(weatherForecast, currentConditions) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;

    const warnings = [];
    const timeline = [];
    const trendData = [];

    for (const [disease, thresholds] of Object.entries(OUTBREAK_THRESHOLDS)) {
        let riskScore = 0;
        let triggers = [];
        const isSeasonal = thresholds.seasonalPeak.includes(currentMonth);

        // Current conditions analysis
        const temp = currentConditions.temperature;
        const hum = currentConditions.humidity;
        const rain = currentConditions.rainfall;
        const aqi = currentConditions.aqi;

        // Temperature match
        if (temp >= thresholds.tempRange[0] && temp <= thresholds.tempRange[1]) {
            riskScore += 20;
            triggers.push(`Temperature ${temp}°C within risk range`);
        }

        // Humidity match
        if (hum >= thresholds.humidityMin) {
            riskScore += 15;
            triggers.push(`Humidity ${hum}% exceeds threshold (${thresholds.humidityMin}%)`);
        }

        // Rainfall match
        if (rain >= thresholds.rainfallMin && thresholds.rainfallMin > 0) {
            riskScore += 20;
            triggers.push(`Rainfall ${rain}mm exceeds threshold (${thresholds.rainfallMin}mm)`);
        }

        // AQI match (for respiratory diseases)
        if (thresholds.aqiMin && aqi >= thresholds.aqiMin) {
            riskScore += 25;
            triggers.push(`AQI ${aqi} exceeds threshold (${thresholds.aqiMin})`);
        }

        // Seasonal boost
        if (isSeasonal) {
            riskScore += 15;
            triggers.push(`Currently in peak season for ${disease}`);
        }

        // Apply multiplier
        riskScore = Math.min(100, Math.round(riskScore * thresholds.riskMultiplier));

        // Determine alert level
        let alertLevel = 'Normal';
        let alertColor = '#10b981';
        if (riskScore >= 75) { alertLevel = 'CRITICAL'; alertColor = '#dc2626'; }
        else if (riskScore >= 55) { alertLevel = 'HIGH'; alertColor = '#ef4444'; }
        else if (riskScore >= 35) { alertLevel = 'ELEVATED'; alertColor = '#f59e0b'; }
        else if (riskScore >= 15) { alertLevel = 'ADVISORY'; alertColor = '#3b82f6'; }

        // Build warning object
        if (riskScore >= 15) {
            warnings.push({
                disease,
                riskScore,
                alertLevel,
                alertColor,
                triggers,
                incubation: thresholds.incubation,
                vector: thresholds.vector,
                transmission: thresholds.transmission,
                isSeasonal,
                recommendation: getRecommendation(disease, alertLevel)
            });
        }

        // Add to trend data
        trendData.push({
            disease,
            riskScore,
            alertLevel,
            isSeasonal
        });
    }

    // Forecast-based timeline (if weather forecast available)
    if (weatherForecast && weatherForecast.length > 0) {
        weatherForecast.forEach((day, index) => {
            const dayRisks = {};
            for (const [disease, thresholds] of Object.entries(OUTBREAK_THRESHOLDS)) {
                let dayScore = 0;
                if (day.temp >= thresholds.tempRange[0] && day.temp <= thresholds.tempRange[1]) dayScore += 25;
                if (day.humidity >= thresholds.humidityMin) dayScore += 20;
                if (day.rainfall >= thresholds.rainfallMin && thresholds.rainfallMin > 0) dayScore += 25;
                dayScore = Math.min(100, Math.round(dayScore * thresholds.riskMultiplier));
                dayRisks[disease] = dayScore;
            }

            const topDisease = Object.entries(dayRisks).sort((a, b) => b[1] - a[1])[0];
            timeline.push({
                date: day.date || `Day ${index + 1}`,
                risks: dayRisks,
                topDisease: topDisease[0],
                topScore: topDisease[1],
                temp: day.temp,
                humidity: day.humidity,
                rainfall: day.rainfall
            });
        });
    }

    // Sort warnings by risk score (highest first)
    warnings.sort((a, b) => b.riskScore - a.riskScore);

    // Generate overall threat level
    const maxRisk = warnings.length > 0 ? warnings[0].riskScore : 0;
    let overallThreat = 'LOW';
    if (maxRisk >= 75) overallThreat = 'CRITICAL';
    else if (maxRisk >= 55) overallThreat = 'HIGH';
    else if (maxRisk >= 35) overallThreat = 'MODERATE';

    return {
        overallThreat,
        maxRiskScore: maxRisk,
        totalWarnings: warnings.length,
        criticalCount: warnings.filter(w => w.alertLevel === 'CRITICAL').length,
        warnings,
        timeline,
        trendData,
        analyzedAt: new Date().toISOString(),
        conditions: currentConditions
    };
}

function getRecommendation(disease, alertLevel) {
    const recs = {
        'Malaria': {
            'CRITICAL': 'Immediate vector control measures needed. Distribute mosquito nets. Deploy fogging operations.',
            'HIGH': 'Intensify mosquito control. Advise use of repellents and long sleeves.',
            'ELEVATED': 'Monitor mosquito breeding sites. Issue public awareness notices.',
            'ADVISORY': 'Regular surveillance recommended. Check stagnant water sources.'
        },
        'Dengue': {
            'CRITICAL': 'Emergency: Eliminate all standing water. Hospital preparedness for dengue surge.',
            'HIGH': 'Active surveillance. Fumigation in affected areas. Stock platelet units.',
            'ELEVATED': 'Community clean-up drives. Awareness campaigns on Aedes prevention.',
            'ADVISORY': 'Monitor Aedes larvae indices. Regular inspection of water containers.'
        },
        'Typhoid': {
            'CRITICAL': 'Water supply contamination alert. Deploy emergency water purification.',
            'HIGH': 'Increase water quality testing frequency. Activate boil-water advisory.',
            'ELEVATED': 'Monitor water sources. Promote hand hygiene campaigns.',
            'ADVISORY': 'Routine water quality checks. Ensure sanitation facilities are functional.'
        },
        'Cholera': {
            'CRITICAL': 'Emergency: Contaminated water supply detected. Deploy ORS kits. Set up treatment centers.',
            'HIGH': 'Activate cholera preparedness plan. Pre-position oral rehydration supplies.',
            'ELEVATED': 'Strengthen water and sanitation surveillance. Community awareness on safe water.',
            'ADVISORY': 'Monitor flood-prone areas. Ensure drainage systems are clear.'
        },
        'Asthma': {
            'CRITICAL': 'Hazardous air quality. Advise all sensitive groups to stay indoors. Close schools if needed.',
            'HIGH': 'Unhealthy air. Issue health advisory for respiratory patients.',
            'ELEVATED': 'Moderate air quality concern. Advise limiting outdoor activities.',
            'ADVISORY': 'Monitor AQI trends. Remind patients to carry inhalers.'
        },
        'Viral Fever': {
            'CRITICAL': 'Widespread viral activity. Consider school closures. Ramp up health facility capacity.',
            'HIGH': 'Significant viral transmission. Promote isolation of symptomatic individuals.',
            'ELEVATED': 'Seasonal viral activity rising. Promote flu vaccination and hygiene.',
            'ADVISORY': 'Normal seasonal fluctuation. Standard precautions apply.'
        },
        'Heat Stroke': {
            'CRITICAL': 'Extreme heat emergency. Open cooling shelters. Issue emergency heat advisory.',
            'HIGH': 'Dangerous heat. Restrict outdoor labor between 11 AM-4 PM.',
            'ELEVATED': 'Heat stress risk. Advise frequent hydration and shade breaks.',
            'ADVISORY': 'Rising temperatures. Inform vulnerable populations (elderly, laborers).'
        }
    };

    return (recs[disease] && recs[disease][alertLevel]) || 'Standard health precautions recommended.';
}

module.exports = { analyzeOutbreakRisk };
