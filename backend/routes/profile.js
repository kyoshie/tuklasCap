import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import authMiddleware from '../auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Multer config for profilePic upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, and WEBP images are allowed.'));
  }
});

// Get profile by wallet address
router.get('/getProfile/:walletAddress', authMiddleware(), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: req.params.walletAddress },
      select: {
        username: true,
        bio: true,
        profilePic: true,
        Kyc: {
          select: {
            isApproved: true,
            status: true
          }
        }
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Only convert if profilePic exists and is a buffer
    if (user.profilePic && Buffer.isBuffer(user.profilePic)) {
      user.profilePic = user.profilePic.toString('base64');
    } else {
      user.profilePic = null;
    }
    
    // Check if user is verified through KYC
    const isApproved = user.Kyc?.isApproved || false;
    
    // Return user data with verification status
    res.json({
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
      isApproved: isApproved
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update profile
router.post('/updateProfile', authMiddleware(), upload.single('profilePic'), async (req, res) => {
  try {
    const { walletAddress, username, bio } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ message: 'walletAddress is required.' });
    }

    // Find user by walletAddress
    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prepare update data
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (req.file) updateData.profilePic = req.file.buffer;

    // Prevent empty username if updating username
    if ('username' in updateData && !updateData.username.trim()) {
      return res.status(400).json({ message: 'Username cannot be empty.' });
    }

    await prisma.user.update({
      where: { walletAddress },
      data: updateData,
    });

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.', error: err.message });
  }
});



export default router;