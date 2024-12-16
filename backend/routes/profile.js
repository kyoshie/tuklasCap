import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { prisma } from "../database.js";
import authMiddleware from "../auth.js";

const router = express.Router();

// file size limits and file types
const upload = multer({ 
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'));
        }
    }
});

// Protected route to update user profile
router.post("/updateProfile", authMiddleware(), upload.single("profilePic"), 
    async (req, res) => {
        try {
            const walletAddress = req.user.walletAddress;
            const { username, bio } = req.body;

            if (!username && !bio && !req.file) {
                return res.status(400).json({
                    message: "No changes provided"
                });
            }

            let imageData = null;
            if (req.file) {
                imageData = await fs.readFile(req.file.path);
            }

          
            const updateData = {};
            if (username) updateData.username = username;
            if (bio) updateData.bio = bio;
            if (imageData) updateData.profilePic = imageData;

           //for updating profile in the database
            const user = await prisma.user.update({
                where: { walletAddress },
                data: updateData,
                select: {
                    username: true,
                    bio: true
                }
            });

           
            if (req.file) {
                await fs.unlink(req.file.path);
            }

            res.json({
                message: "Profile updated successfully!",
                user
            });

        } catch (error) {
            
            if (req.file) {
                await fs.unlink(req.file.path);
            }

            res.status(500).json({
                message: "Error updating profile"
            });
        }
    }
);

// Protected route to get user profile info
router.get("/getProfile/:walletAddress", authMiddleware(), async (req, res) => {
    try {
     
        const walletAddress = req.params.walletAddress;
        const loggedInUserWallet = req.user.walletAddress;
        const isOwnProfile = walletAddress.toLowerCase() === loggedInUserWallet.toLowerCase();
        
        if (!isOwnProfile) {
            return res.status(403).json({
                message: "You can only view your own profile"
            });
        }

        // finding the user in the database
        const user = await prisma.user.findUnique({
            where: { 
                walletAddress: walletAddress 
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        let profilePicture = null;
        if (user.profilePic) {
            profilePicture = user.profilePic.toString("base64");
        }

        const username = user.username || '';
        const bio = user.bio || '';

        res.json({
            username: username,
            bio: bio,
            profilePic: profilePicture
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching profile"
        });
    }
});
export default router;