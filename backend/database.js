import pg from 'pg';
const { Client } = pg;

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'tuklasDB',
    password: 'joshua091021',
    port: 5432,
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to the database');
    } catch (err) {
        console.error('Connection error:', err.stack);
        process.exit(1);  // Exit the application if connection fails
    }
}

// Call this function to connect to the database
connectToDatabase();

// Function to close the database connection
async function closeConnection() {
    try {
        await client.end();
        console.log('Database connection closed');
    } catch (err) {
        console.error('Error closing database connection:', err.stack);
    }
}

export { client, closeConnection };