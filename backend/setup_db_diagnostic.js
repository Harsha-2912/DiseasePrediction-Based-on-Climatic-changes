const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

async function setupDatabase() {
    try {
        console.log('Trying with password from .env...');
        // Create connection without database selected
        await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        console.log('Connected to MySQL server successfully with provided password.');
    } catch (error) {
        console.log('Failed with .env password. Trying with empty password...');
        try {
            await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: ''
            });
            console.log('Connected to MySQL server successfully with EMPTY password.');
            console.log('Please update your .env file to have DB_PASSWORD= (empty)');
        } catch (err) {
            console.error('Error connecting to database:', err.message);
            console.error('Please verify your DB_PASSWORD in .env matches your MySQL root password.');
        }
    }
}

setupDatabase();
