const { spawn } = require('child_process');
const path = require('path');
const Prediction = require('../models/Prediction');
const externalApiService = require('../services/externalApiService');

exports.getForecast = async (req, res) => {
    try {
        const { lat, lon, location } = req.body;

        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and Longitude required' });
        }

        console.log(`[Forecast] Fetching 7-day forecast for ${lat}, ${lon}`);

        // 1. Fetch Weather Forecast from Open-Meteo
        const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,relative_humidity_2m_mean,rain_sum,precipitation_sum&timezone=auto`;
        const axios = require('axios');
        const weatherRes = await axios.get(weatherApiUrl);
        const daily = weatherRes.data.daily;

        if (!daily) {
            throw new Error('No weather data received');
        }

        // 2. Prepare Batch Input for Python
        // Mapping Open-Meteo data to our model inputs
        // Note: Open-Meteo gives arrays.
        const batchInput = [];

        for (let i = 0; i < 7; i++) { // Next 7 days
            batchInput.push({
                date: daily.time[i],
                temp: daily.temperature_2m_max[i],
                humidity: daily.relative_humidity_2m_mean[i] || 60, // Default if null
                rainfall: daily.rain_sum[i] || daily.precipitation_sum[i] || 0,
                aqi: 100 // Forecasting AQI is hard, assuming moderate constant for now or could fetch forecasted AQI if available
            });
        }

        // 3. Call Python in Batch Mode
        const pythonScriptPath = path.join(__dirname, '../../ml/predict.py');
        console.log(`[Forecast] Running batch prediction for ${batchInput.length} days`);

        const pythonProcess = spawn('python', [
            pythonScriptPath,
            '--batch',
            JSON.stringify(batchInput),
            'Low' // Default risk for forecast
        ]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`[Forecast] Python script exited with code ${code}: ${errorString}`);
                return res.status(500).json({ message: 'Forecast generation failed', error: errorString });
            }

            try {
                const forecastResults = JSON.parse(dataString);

                // Merge with input data for frontend chart
                const finalData = forecastResults.map((pred, index) => ({
                    ...pred,
                    ...batchInput[index], // formatting date, temp, etc.
                }));

                res.json(finalData);
            } catch (err) {
                console.error('[Forecast] JSON error:', err);
                res.status(500).json({ message: 'Error processing forecast' });
            }
        });

    } catch (error) {
        console.error('[Forecast] Error:', error);
        res.status(500).json({ message: 'Server error during forecast' });
    }
};

exports.predictDisease = async (req, res) => {
    try {
        const { temperature, humidity, rainfall, aqi, location } = req.body;
        const user_id = req.user ? req.user.id : null;
        // ... (rest of the original predictDisease function)

        console.log(`[Predict] Request from User ID: ${user_id}`);

        // Validate inputs
        if (!temperature || !humidity || !rainfall || !aqi) {
            return res.status(400).json({ message: 'All environmental parameters are required' });
        }

        // Fetch External Context (IDSP/WHO/Weather)
        let riskLevel = 'Low';
        try {
            // Using location for looking up alerts
            const context = await externalApiService.fetchContextData(0, 0, location);
            riskLevel = context.regional_alert.risk;
            console.log(`[Predict] Context fetched. Location: ${location}, Risk: ${riskLevel}`);
        } catch (e) {
            console.log('[Predict] Context fetch failed or skipped, defaulting to Low risk');
        }

        // Path to python script
        const pythonScriptPath = path.join(__dirname, '../../ml/predict.py');

        // Call Python script
        const pythonProcess = spawn('python', [
            pythonScriptPath,
            temperature,
            humidity,
            rainfall,
            aqi,
            location || 'Unknown',
            riskLevel // Passing risk level
        ]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`[Predict] Python script exited with code ${code}: ${errorString}`);
                return res.status(500).json({ message: 'Prediction failed', error: errorString });
            }

            try {
                const predictionResult = JSON.parse(dataString);
                console.log("[Predict] Python result:", predictionResult);

                // Save to database
                if (user_id) {
                    try {
                        const savedPrediction = await Prediction.create({
                            user_id,
                            temperature,
                            humidity,
                            rainfall,
                            aqi,
                            location: location || 'Unknown',
                            predicted_disease: predictionResult.disease,
                            accuracy: predictionResult.accuracy
                        });
                        console.log(`[Predict] Saved to DB. Insert ID: ${savedPrediction}`);
                    } catch (dbError) {
                        console.error("[Predict] DB Save Error:", dbError);
                        // Using console.error to make sure it shows up in logs
                    }
                } else {
                    console.log("[Predict] No User ID, skipping DB save.");
                }

                // Attach risk context to response
                predictionResult.risk_context = riskLevel;
                res.json(predictionResult);
            } catch (err) {
                console.error('[Predict] JSON Parse/Process Error:', err);
                res.status(500).json({ message: 'Error processing prediction result' });
            }
        });

    } catch (error) {
        console.error('[Predict] Server Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const user_id = req.user.id;
        console.log(`[History] Fetching for User ID: ${user_id}`);
        const history = await Prediction.findByUserId(user_id);
        console.log(`[History] Found ${history.length} records`);
        res.json(history);
    } catch (error) {
        console.error('[History] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
