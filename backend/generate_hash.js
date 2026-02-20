const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123'; // Default password if none provided

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`\nPassword: ${password}`);
    console.log(`Hashed Password (for DB): ${hash}\n`);
    console.log(`SQL Command:`);
    console.log(`INSERT INTO users (username, password, role) VALUES ('admin', '${hash}', 'admin');`);
});
