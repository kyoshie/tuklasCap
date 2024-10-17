const { Client } = require('pg'); // PostgreSQL client

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'tuklasDB',
    password: 'joshua091021',
    port: 5432,
});

client.connect(err => {
    if (err) {
        console.error('Connection error:', err.stack);
        process.exit(1);  // Exit the application if connection fails
    } else {
        console.log('Connected to the database');
    }
});

module.exports = client;