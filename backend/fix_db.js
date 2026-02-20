const db = require('./db');
require('dotenv').config();

const queries = [
    "SET FOREIGN_KEY_CHECKS = 0",
    "DROP TABLE IF EXISTS users",
    "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, role ENUM('user', 'admin') DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    "SET FOREIGN_KEY_CHECKS = 1"
];

function runQueries(index) {
    if (index >= queries.length) {
        console.log("Database fixed successfully!");
        process.exit(0);
    }

    db.query(queries[index], (err, result) => {
        if (err) {
            console.error(`Error executing query ${index + 1}:`, err.message);
        } else {
            console.log(`Query ${index + 1} executed.`);
        }
        runQueries(index + 1);
    });
}

runQueries(0);
