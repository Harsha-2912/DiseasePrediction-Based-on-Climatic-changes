const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const predictRoutes = require('./routes/predictRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/precautions', require('./routes/precautionRoutes'));
app.use('/api/external', require('./routes/externalApiRoutes'));

app.get('/', (req, res) => {
    res.send('Climate Disease Predictor API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
