const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function verifyTables() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables:', tables);

        if (tables.length > 0) {
            const tableName = tables[0][Object.keys(tables[0])[0]]; // Get first table name dynamic key
            // Check users table specifically
            try {
                const [columns] = await connection.query('DESCRIBE users');
                console.log('Users table columns:', columns.map(c => c.Field));
            } catch (err) {
                console.log('Users table error:', err.message);
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Error verifying tables:', error);
    }
}

verifyTables();
