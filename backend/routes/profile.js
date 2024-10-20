import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { client } from '../database.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Route to update user profile
router.post('/updateProfile', upload.single('profilePic'), async (req, res) => {
    const { walletAddress, username, bio } = req.body;
    const profilePicPath = req.file?.path;

    try {
        let imageData = null;
        if (profilePicPath) {
            imageData = await fs.readFile(profilePicPath);
        }

        const updateQuery = `
            UPDATE users
            SET username = $1, bio = $2, profilepic = $3
            WHERE walletaddress = $4
            RETURNING *
        `;

        const result = await client.query(updateQuery, [username, bio, imageData, walletAddress]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (profilePicPath) {
            await fs.unlink(profilePicPath);
        }

        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// Route to get user profile information
router.get('/getProfile/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;

    try {
        const selectQuery = `
            SELECT username, bio, profilepic
            FROM users
            WHERE walletaddress = $1
        `;

        const result = await client.query(selectQuery, [walletAddress]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        const profilePicBase64 = user.profilepic ? user.profilepic.toString('base64') : null;

        res.status(200).json({
            username: user.username,
            bio: user.bio,
            profilePic: profilePicBase64
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

export default router;