import express from "express";
import { prisma } from "../database.js";
import { verifyToken } from "../jwt.js";

const router = express.Router();

router.get("/transactions", async (req, res) => {
    const token = req.headers.authorization; // Get the token from the headers

    if (!token) {
        return res
            .status(401)
            .json({ error: "Authorization token is required" });
    }

    const decoded = verifyToken(token); // Verify the token
    const user = await prisma.user.findFirst({
        where: { id: decoded.userId },
        include: {
            transactions: {
                include: {
                    listing: {
                        include: {
                            artwork: {
                                include: { owner: true },
                            },
                        },
                    },
                    buyer: true,
                },
            },
        },
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const data = [];

    for (const transaction of user.transactions) {
        data.push({
            id: transaction.id,
            title: transaction.listing.artwork.title,
            description: transaction.listing.artwork.description,
            price: transaction.listing.price,
            imageCID: transaction.listing.artwork.imageCID,
            buyer: transaction.buyer.walletAddress,
            seller: transaction.listing.artwork.owner.walletAddress,
            status: transaction.status,
        });

        try {
            res.status(200).json(data); // Return the transactions
        } catch (error) {
            console.error("Error getting transactions:", error);
            res.status(500).json({ error: "Failed to get transactions" });
        }
    }
});

export default router;
