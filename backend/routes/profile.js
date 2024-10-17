const express = require('express');
const router = express.Router();
const client = require('../database');
const multer = require('multer'); // For handling file uploads
const fs = require('fs');

const upload = multer({ dest: 'uploads/' }); // Temporary directory for storing images

// Route to update user profile
router.post('/updateProfile', upload.single('profilePic'), async (req, res) => {
    const { walletAddress, username, bio } = req.body;
    const profilePicPath = req.file ? req.file.path : null;

    try {
        let imageData = null;
        if (profilePicPath) {
            // Convert the image to binary data
            imageData = fs.readFileSync(profilePicPath);
        }

        // Update the user's profile in the database
        const updateQuery = `
            UPDATE users
            SET username = $1, bio = $2, profilepic = $3
            WHERE walletaddress = $4
        `;

        await client.query(updateQuery, [username, bio, imageData, walletAddress]);

        // Remove the uploaded image after saving to the database
        if (profilePicPath) {
            fs.unlinkSync(profilePicPath); // Delete file after saving to DB
        }

        res.status(200).send({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send({ message: 'Error updating profile' });
    }
});

// Route to get user profile information
router.get('/getProfile/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;

    try {
        // Fetch the user's profile from the database
        const selectQuery = `
            SELECT username, bio, profilepic
            FROM users
            WHERE walletaddress = $1
        `;

        const result = await client.query(selectQuery, [walletAddress]);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Convert the binary image data to a base64 string
        let profilePicBase64 = null;
        if (user.profilepic) {
            profilePicBase64 = user.profilepic.toString('base64');
        }

        res.status(200).send({
            username: user.username,
            bio: user.bio,
            profilePic: profilePicBase64
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).send({ message: 'Error fetching profile' });
    }
});

module.exports = router;
