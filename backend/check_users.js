const db = require('./db');
require('dotenv').config();

const sql = "SELECT id, username, role, created_at FROM users";
db.query(sql, (err, results) => {
    if (err) {
        console.error("Error fetching users:", err);
        process.exit(1);
    }
    console.log("\n--- Current Users in DB ---");
    console.table(results);
    console.log("---------------------------\n");
    process.exit(0);
});
