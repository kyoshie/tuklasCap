import express from "express";
import { prisma } from "../database.js";
import { generateToken } from "../jwt.js";
import { ethers } from "ethers";
import authMiddleware from "../auth.js";

const router = express.Router();

// Store nonces temporarily (in production, use a database or Redis)
const nonceStore = new Map();

// Generate and store nonce for wallet authentication
router.get("/auth/nonce/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;
    console.log("Nonce requested for wallet:", walletAddress);

    if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
    }

    // Generate a unique nonce
    const nonce = Math.floor(Math.random() * 1000000).toString();
    const message = `Welcome to Tuklas Art Gallery! Please sign this message to verify your wallet ownership. Nonce: ${nonce}`;
    
    // Store the nonce
    nonceStore.set(walletAddress.toLowerCase(), { nonce, message });
    console.log("Stored nonce for wallet:", { walletAddress, nonce });
    
    res.json({ message, nonce });
});

// Login/Authentication endpoint
router.post("/auth/login", async (req, res) => {
    console.log("Headers received:", req.headers);
    console.log("Raw body:", req.body);
    console.log("Content-Type:", req.headers['application/json']);

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ 
            error: "Request body is missing",
            headers: req.headers
        });
    }

    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
        return res.status(400).json({ 
            error: "Missing required parameters",
            received: req.body,
            missing: {
                walletAddress: !walletAddress,
                signature: !signature,
                message: !message
            }
        });
    }

    try {
        console.log("Verifying signature for wallet:", walletAddress);
        
        // Get stored nonce data
        const storedData = nonceStore.get(walletAddress.toLowerCase());
        console.log("Stored nonce data:", storedData);

        // Verify signature
        const { verifyMessage } = ethers.utils;
        const recoveredAddress = verifyMessage(message, signature);
        
        console.log("Recovered address:", recoveredAddress);

        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(401).json({ error: "Invalid signature" });
        }

        // Check nonce
        if (!storedData || !message.includes(storedData.nonce)) {
            return res.status(401).json({ error: "Invalid or expired nonce" });
        }

        // Clear used nonce
        nonceStore.delete(walletAddress.toLowerCase());

        // Check if wallet is admin
        const adminWallet = process.env.ADMIN_WALLET_ADDRESS;
        const role = walletAddress.toLowerCase() === adminWallet.toLowerCase() ? "ADMIN" : "USER";
        console.log("Assigned role:", role);

        // Create or update user
        const user = await prisma.user.upsert({
            where: { walletAddress: walletAddress },
            update: { role: role },
            create: { walletAddress: walletAddress, role: role },
        });
        console.log("User upserted:", user);

        // Generate token
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            user,
            token,
            isAdmin: role === "ADMIN"
        });
    } catch (error) {
        console.error("Authentication error details:", {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: "Authentication failed", 
            details: error.message 
        });
    }
});

// Protected route to check admin status
router.post("/checkAdmin", authMiddleware(), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { walletAddress: req.user.walletAddress },
            select: { role: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ 
            isAdmin: user.role === "ADMIN",
            role: user.role
        });
    } catch (error) {
        console.error("Admin check error:", error);
        res.status(500).json({ error: "Failed to check admin status" });
    }
});

export default router;