import express from "express";
import { prisma } from "../database.js";
import { verifyToken } from "../jwt.js";

const router = express.Router();

router.get("/arts", async (req, res) => {
    const token = req.headers.authorization; // Get the token from the headers

    if (!token) {
        return res
            .status(401)
            .json({ error: "Authorization token is required" });
    }

    const decoded = verifyToken(token); // Verify the token
    const user = await prisma.user.findFirst({
        where: { id: decoded.userId },
        include: { artworks: true },
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    try {
        res.status(200).json(user.artworks); // Return the arts
    } catch (error) {
        console.error("Error getting arts:", error);
        res.status(500).json({ error: "Failed to get arts" });
    }
});

router.get("/arts/listings", async (req, res) => {
    try {
        const approvals = await prisma.listApproval.findMany({
            where: { status: "APPROVED" },
            include: {
                listing: {
                    include: { artwork: true },
                },
            },
        });

        const data = [];

        for (const approval of approvals) {
            data.push({
                id: approval.listing.artwork.id,
                title: approval.listing.artwork.title,
                description: approval.listing.artwork.description,
                price: approval.listing.price,
                imageCID: approval.listing.artwork.imageCID,
            });
        }

        res.status(200).json(data); // Return the arts
    } catch (error) {
        console.error("Error getting arts:", error);
        res.status(500).json({ error: "Failed to get arts" });
    }
});

export default router;
