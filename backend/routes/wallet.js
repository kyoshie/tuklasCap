import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { client } from '../database.js';

dotenv.config(); // Load environment variables

const router = express.Router();

// API endpoint to save wallet address with upsert
router.post('/saveWallet', async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }

    try {
        const adminWallet = '0x784a2430a204cCB93Fb9010008435e0A3cCA5675';
        let role = (walletAddress.toLowerCase() === adminWallet.toLowerCase()) ? 'admin' : 'user';

        // Upsert wallet address with role
        const upsertQuery = `
            INSERT INTO users (walletAddress, role)
            VALUES ($1, $2)
            ON CONFLICT (walletAddress) DO UPDATE
            SET role = EXCLUDED.role
            RETURNING *;
        `;
        const result = await client.query(upsertQuery, [walletAddress, role]);

        // Create JWT token
        const token = jwt.sign({ userId: result.rows[0].id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ success: true, user: result.rows[0], token });
    } catch (error) {
        console.error("Error saving wallet address:", error);
        res.status(500).json({ error: 'Failed to save wallet address' });
    }
});

// API endpoint to check if user is admin
router.post('/checkAdmin', async (req, res) => {
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


export default router;
