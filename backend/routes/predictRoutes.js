const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predictController');
const auth = require('../middleware/auth');
const { analyzeOutbreakRisk } = require('../services/outbreakService');

router.post('/forecast', auth, predictController.getForecast);
router.post('/', auth, predictController.predictDisease);
router.get('/history', auth, predictController.getHistory);

// AI Early Warning & Outbreak Detection
router.post('/outbreak-analysis', auth, async (req, res) => {
    try {
        const { temperature, humidity, rainfall, aqi, lat, lon, forecastData } = req.body;

        if (!temperature || !humidity || !rainfall || !aqi) {
            return res.status(400).json({ message: 'Climate parameters required for outbreak analysis' });
        }

        const currentConditions = {
            temperature: parseFloat(temperature),
            humidity: parseFloat(humidity),
            rainfall: parseFloat(rainfall),
            aqi: parseFloat(aqi)
        };

        const analysis = analyzeOutbreakRisk(forecastData || [], currentConditions);
        console.log(`[Outbreak] Analysis complete. Threat: ${analysis.overallThreat}, Warnings: ${analysis.totalWarnings}`);
        res.json(analysis);
    } catch (error) {
        console.error('[Outbreak] Error:', error);
        res.status(500).json({ message: 'Outbreak analysis failed', error: error.message });
    }
});

module.exports = router;
