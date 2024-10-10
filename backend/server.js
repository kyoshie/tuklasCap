const express = require('express');
const { Client } = require('pg'); // PostgreSQL client
const cors = require ('cors');

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

// PostgreSQL client setup
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'tuklasDB',
    password: 'joshua091021',
    port: 5432,
});

client.connect();

// API endpoint to save wallet address
app.post('/api/saveWallet', async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }

    try {
        const query = 'INSERT INTO users (walletAddress) VALUES ($1) RETURNING *';
        const values = [walletAddress];
        const result = await client.query(query, values);

        res.status(200).json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error("Error saving wallet address:", error);
        res.status(500).json({ error: 'Failed to save wallet address' });
    }
});

app.post('/api/checkAdmin', async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }

    try {
        const query = 'SELECT role FROM users WHERE walletAddress = $1';
        const values = [walletAddress];
        const result = await client.query(query, values);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (user.role === 'admin') {
                return res.status(200).json({ isAdmin: true });
            }
        }
        res.status(200).json({ isAdmin: false });
    } catch (error) {
        console.error("Error checking admin status:", error);
        res.status(500).json({ error: 'Failed to check admin status' });
    }
});


// Start the server
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});




