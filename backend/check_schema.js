const db = require('./db');
require('dotenv').config();

const sql = "DESCRIBE users";
db.query(sql, (err, results) => {
    if (err) {
        console.error("Error describing table:", err);
        process.exit(1);
    }
    console.log("\n--- Users Table Schema ---");
    console.table(results);
    console.log("---------------------------\n");
    process.exit(0);
});
