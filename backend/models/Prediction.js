const db = require('../config/db');

class Prediction {
    static async create(data) {
        const { user_id, temperature, humidity, rainfall, aqi, location, predicted_disease, accuracy } = data;
        const [result] = await db.execute(
            'INSERT INTO predictions (user_id, temperature, humidity, rainfall, aqi, location, predicted_disease, accuracy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, temperature, humidity, rainfall, aqi, location, predicted_disease, accuracy]
        );
        return result.insertId;
    }

    static async findByUserId(userId) {
        const [rows] = await db.execute('SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return rows;
    }
}

module.exports = Prediction;
