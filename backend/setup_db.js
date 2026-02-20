const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

async function setupDatabase() {
    try {
        // Create connection without database selected
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Connected to MySQL server successfully.');

        // Read schema file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split schema into individual queries
        const queries = schema.split(';').filter(query => query.trim() !== '');

        for (const query of queries) {
            if (query.trim()) {
                await connection.query(query);
                console.log(`Executed: ${query.substring(0, 50)}...`);
            }
        }

        console.log('Database and tables setup completed successfully.');
        await connection.end();

    } catch (error) {
        console.error('Error setting up database:', error.message);
        console.error('Please verify your DB_PASSWORD in .env matches your MySQL root password.');
    }
}

setupDatabase();
