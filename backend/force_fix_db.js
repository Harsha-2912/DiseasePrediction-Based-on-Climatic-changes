const mysql = require('mysql2/promise');
require('dotenv').config();

async function forceFix() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD, // Reads from .env
        database: 'climate_disease_db'
    };

    console.log(`Connecting to ${config.database} at ${config.host}...`);

    try {
        const connection = await mysql.createConnection(config);

        console.log('Connected! Creating `predictions` table if not exists...');

        const query = `
            CREATE TABLE IF NOT EXISTS predictions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                temperature FLOAT,
                humidity FLOAT,
                rainfall FLOAT,
                aqi FLOAT,
                location VARCHAR(255),
                predicted_disease VARCHAR(255),
                accuracy FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB;
        `;

        await connection.query(query);
        console.log('✅ Table `predictions` created successfully.');

        const [rows] = await connection.query('SHOW TABLES');
        console.log('Current tables:', rows);

        await connection.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

forceFix();
