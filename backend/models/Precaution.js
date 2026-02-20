const db = require('../config/db');

class Precaution {
    static async findByDisease(diseaseName) {
        const [rows] = await db.execute('SELECT * FROM precautions WHERE disease_name = ?', [diseaseName]);
        return rows[0];
    }

    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM precautions');
        return rows;
    }
}

module.exports = Precaution;
