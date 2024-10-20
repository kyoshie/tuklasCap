import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { prisma } from "../database.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Route to update user profile
router.post("/updateProfile", upload.single("profilePic"), async (req, res) => {
    const { walletAddress, username, bio } = req.body;
    const profilePicPath = req.file?.path;

    try {
        let imageData = null;

        if (profilePicPath) {
            imageData = await fs.readFile(profilePicPath);
        }

        const user = await prisma.user.findFirst({
            // Check if the user exists
            where: { walletAddress: walletAddress },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await prisma.user.update({
            // Update the user profile
            where: { walletAddress: walletAddress },
            data: {
                username,
                bio,
                profilePic: imageData,
            },
        });

        if (profilePicPath) {
            await fs.unlink(profilePicPath);
        }

        res.status(200).json({ message: "Profile updated successfully!" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            message: "Error updating profile",
            error: error.message,
        });
    }
});

// Route to get user profile information
router.get("/getProfile/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;

    try {
        const user = await prisma.user.findFirst({
            // Check if the user exists
            where: { walletAddress: walletAddress },
        });

        const profilePicBase64 = user.profilePic
            ? user.profilePic.toString("base64")
            : null;

        res.status(200).json({
            username: user.username,
            bio: user.bio,
            profilePic: profilePicBase64,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({
            message: "Error fetching profile",
            error: error.message,
        });
    }
});

export default router;
