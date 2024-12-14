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
router.post("/updateProfile",
    authMiddleware(),
    upload.single("profilePic"),
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
                try {
                    imageData = await fs.readFile(req.file.path);
                } catch (error) {
                    console.error("Error reading uploaded file:", error);
                    return res.status(500).json({ 
                        message: "Error processing uploaded image" 
                    });
                }
            }

            const updateData = {
                ...(username && { username }),
                ...(bio && { bio }),
                ...(imageData && { profilePic: imageData })
            };

            const user = await prisma.user.update({
                where: { walletAddress },
                data: updateData,
                select: {
                    username: true,
                    bio: true
                }
            });

            // Clean up uploaded file
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (error) {
                    console.error("Error deleting uploaded file:", error);
                }
            }

            res.status(200).json({
                message: "Profile updated successfully!",
                user
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            
            // Clean up uploaded file on error
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error("Error deleting uploaded file:", unlinkError);
                }
            }

            res.status(500).json({
                message: "Error updating profile",
                error: error.message
            });
        }
    }
);

// Protected route to get user profile information
router.get("/getProfile/:walletAddress",
    authMiddleware(),
    async (req, res) => {
        try {
            const { walletAddress } = req.params;
            
            // Optional: Add check if user is requesting their own profile
            // or has permission to view others' profiles
            if (walletAddress.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
                return res.status(403).json({ 
                    message: "You can only view your own profile" 
                });
            }

            const user = await prisma.user.findUnique({
                where: { walletAddress }
            });

            if (!user) {
                return res.status(404).json({ 
                    message: "User not found" 
                });
            }

            const profilePicBase64 = user.profilePic
                ? user.profilePic.toString("base64")
                : null;

            res.status(200).json({
                username: user.username || '',
                bio: user.bio || '',
                profilePic: profilePicBase64
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
            res.status(500).json({
                message: "Error fetching profile",
                error: error.message
            });
        }
    }
);

export default router;