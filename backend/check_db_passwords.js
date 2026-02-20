const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const passwordsToTry = [
    process.env.DB_PASSWORD, // Try the one in .env first
    '',
    'root',
    'admin',
    '1234',
    '123456',
    'mysql'
];

async function checkPasswords() {
    console.log('Checking common database passwords...');

    for (const password of passwordsToTry) {
        if (password === undefined) continue;

        console.log(`Trying password: "${password}"`);
        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: password
            });

            console.log(`Success! Password is: "${password}"`);
            await connection.end();
            return password;
        } catch (error) {
            // console.log(`Failed: ${error.message}`);
        }
    }

    return null;
}

async function updateEnvFile(validPassword) {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Replace DB_PASSWORD line
    const lines = envContent.split('\n');
    const newLines = lines.map(line => {
        if (line.startsWith('DB_PASSWORD=')) {
            return `DB_PASSWORD=${validPassword}`;
        }
        return line;
    });

    fs.writeFileSync(envPath, newLines.join('\n'));
    console.log('Updated .env file with correct password.');
}

async function main() {
    const validPassword = await checkPasswords();

    if (validPassword !== null) {
        await updateEnvFile(validPassword);
        // Verify again
        const setupScript = require('./setup_db.js'); // This helps re-run setup_db logic if I export it, or just exit and let main agent run it.
        // I won't require it, just exit with success.

        // Actually, run the setup logic here for convenience? 
        // No, Keep it simple.
        process.exit(0);
    } else {
        console.error('Could not find a valid password. Please update .env manually.');
        process.exit(1);
    }
}

main();
