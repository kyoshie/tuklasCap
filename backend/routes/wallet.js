import express from "express";
import { prisma } from "../database.js";
import { generateToken } from "../jwt.js";

const router = express.Router();

// API endpoint to save wallet address with upsert
router.post("/saveWallet", async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
    }

    try {
        const adminWallet = "0x784a2430a204cCB93Fb9010008435e0A3cCA5675";
        let role =
            walletAddress.toLowerCase() === adminWallet.toLowerCase()
                ? "ADMIN"
                : "USER";

        const user = await prisma.user.upsert({
            // Save the wallet address with role if not exists and update if it does
            where: { walletAddress: walletAddress },
            update: { role: role },
            create: { walletAddress: walletAddress, role: role },
        });

        const token = generateToken(user); // Generate a JWT token
        res.status(200).json({ success: true, user, token });
    } catch (error) {
        console.error("Error saving wallet address:", error);
        res.status(500).json({ error: "Failed to save wallet address" });
    }
});

router.post("/checkAdmin", async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
    }

    try {
        const user = await prisma.user.findFirst({
            // Check if the user exists, return the role
            where: { walletAddress: walletAddress },
            select: { role: true },
        });

        if (user && user.role === "ADMIN") {
            return res.status(200).json({ isAdmin: true });
        }

        res.status(200).json({ isAdmin: false });
    } catch (error) {
        console.error("Error checking admin status:", error);
        res.status(500).json({ error: "Failed to check admin status" });
    }
});

export default router;
