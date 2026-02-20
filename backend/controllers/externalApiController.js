const externalApiService = require('../services/externalApiService');

exports.getExternalContext = async (req, res) => {
    try {
        const { lat, lon, location } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and Longitude are required' });
        }

        const data = await externalApiService.fetchContextData(lat, lon, location);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching external context:', error);
        res.status(500).json({ message: 'Error fetching external data' });
    }
};
