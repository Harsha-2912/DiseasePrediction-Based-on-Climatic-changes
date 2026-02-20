const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function fixTable() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME // climate_disease_db
        });

        console.log(`Connected to database: ${process.env.DB_NAME}`);

        const createPredictionsTable = `
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
            );
        `;

        await connection.query(createPredictionsTable);
        console.log("Table 'predictions' created or already exists.");

        await connection.end();
    } catch (error) {
        console.error("Error creating table:", error);
    }
}

fixTable();
