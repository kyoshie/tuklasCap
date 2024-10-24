import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

// Configure multer for file upload
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Endpoint to fetch all artworks
router.get('/fetch', async (req, res) => {
  try {
    const artworks = await prisma.artwork.findMany({
      include: {
        owner: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    res.status(200).json({ artworks }); // Return the artworks array
  } catch (error) {
    console.error("Error fetching artworks:", error);
    res.status(500).json({ message: "Failed to fetch artworks." });
  }
});

// Endpoint to upload artwork
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file uploaded" 
      });
    }

    const { title, description, price, walletAddress } = req.body;

    // Find the user by wallet address
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Parse the price to a float or decimal
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price",
      });
    }

    // Create form data for Pinata
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Upload to Pinata
    const pinataRes = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_API_SECRET,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    // Save artwork data to database
    const artwork = await prisma.artwork.create({
      data: {
        title,
        description,
        imageCID: pinataRes.data.IpfsHash,
        price: parsedPrice,
        isApproved: false,
        isMinted: false,
        isSold: false,
        owner: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        owner: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      artwork,
      message: "Artwork uploaded successfully",
    });

  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Failed to process upload",
    });
  }
});

export default router;
