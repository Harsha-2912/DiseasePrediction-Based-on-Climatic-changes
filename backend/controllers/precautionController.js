const Precaution = require('../models/Precaution');

exports.getPrecautions = async (req, res) => {
    try {
        const { disease } = req.query;
        if (disease) {
            const precaution = await Precaution.findByDisease(disease);
            if (!precaution) return res.status(404).json({ message: 'Precautions not found' });
            return res.json(precaution);
        }

        const precautions = await Precaution.getAll();
        res.json(precautions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
