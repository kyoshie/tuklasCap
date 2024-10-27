import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import TuklasArtMarketplaceABI from '../artifacts/contracts/Tuklas.sol/TuklasArtMarketplace.json' assert {type: 'json'};
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';


dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_URL);

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Get contract instance
if (!ethers.utils.isAddress(CONTRACT_ADDRESS)) {
  throw new Error("Invalid CONTRACT_ADDRESS in .env file");
}

const getContract = () => {
  const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  
  if (!ethers.utils.isAddress(wallet.address)) {
    throw new Error("Invalid ADMIN_PRIVATE_KEY in .env file");
  }
  
  return new ethers.Contract(CONTRACT_ADDRESS, TuklasArtMarketplaceABI.abi, wallet);
};

router.get('/fetch/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Validate wallet address
    if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address"
      });
    }

    // Find user by wallet address
    const user = await prisma.user.findUnique({
      where: {
        walletAddress: walletAddress
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Fetch all artworks owned by the user
    const artworks = await prisma.artwork.findMany({
      where: {
        ownerId: user.id
      },
      orderBy: {
        createdAt: 'desc' // Most recent first
      },
      include: {
        owner: {
          select: {
            username: true,
            walletAddress: true
          }
        },
        approval: {
          select: {
            status: true,
            createdAt: true,
            reason: true
          }
        }
      }
    });

    // Format the response
    const formattedArtworks = artworks.map(artwork => ({
      dbId: artwork.dbId,
      contractId: artwork.contractId,
      title: artwork.title,
      description: artwork.description,
      imageCID: artwork.imageCID,
      price: artwork.price.toString(),
      isApproved: artwork.isApproved,
      isMinted: artwork.isMinted,
      isSold: artwork.isSold,
      pendingApproval: artwork.pendingApproval,
      transactionHash: artwork.transactionHash,
      mintTransactionHash: artwork.mintTransactionHash,
      createdAt: artwork.createdAt,
      artist: artwork.owner.username || 'Unknown',
      approvalStatus: artwork.approval?.status || null,
      approvalDate: artwork.approval?.createdAt || null
    }));

    res.status(200).json({
      success: true,
      artworks: formattedArtworks,
      message: "Artworks fetched successfully"
    });

  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch artworks",
      error: error.message
    });
  }
});


// Artwork Upload Endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { title, description, price, walletAddress } = req.body;

    if (!ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({ success: false, message: "Invalid wallet address" });
    }

    // Create or retrieve user
    let user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      user = await prisma.user.create({ data: { walletAddress, role: 'USER' } });
    }

    // Pinata upload
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const pinataRes = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_API_SECRET,
        }
      }
    );

    // Get contract instance
    const contract = getContract();

    // Get current art count before submission
    const currentArtCount = await contract.artCount();
    console.log('Current art count:', currentArtCount.toString());

    // Submit to smart contract
    const tx = await contract.submitArt(
      title,
      pinataRes.data.IpfsHash,
      ethers.utils.parseEther(price.toString()),
      description
    );
    const receipt = await tx.wait();

    // The new art ID will be currentArtCount + 1
    const newArtId = currentArtCount.add(1);
    console.log('New art ID:', newArtId.toString());

    // Save to database with both IDs
    const artwork = await prisma.artwork.create({
      data: {
        contractId: newArtId.toNumber(),
        title,
        description,
        imageCID: pinataRes.data.IpfsHash,
        price: parseFloat(price),
        isApproved: false,
        isMinted: false,
        isSold: false,
        pendingApproval: false,
        transactionHash: receipt.transactionHash,
        owner: { connect: { id: user.id } }
      }
    });

    res.status(200).json({
      success: true,
      artwork,
      transactionHash: receipt.transactionHash,
      message: "Artwork uploaded successfully and posted in the gallery"
    });

  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({
      success: false,
      message: "Failed to process upload",
      error: error.message
    });
  }
});

router.put('/approval/:artworkId', async (req, res) => {
  try {
    const artworkId = parseInt(req.params.artworkId);
    const { walletAddress } = req.body;

    // Validate artwork ID
    if (isNaN(artworkId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid artwork ID"
      });
    }

    // Validate wallet address
    if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address"
      });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        walletAddress
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find and validate the artwork using dbId
    const artwork = await prisma.artwork.findUnique({
      where: {
        dbId: artworkId
      }
    });

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: "Artwork not found"
      });
    }

    // Verify ownership
    if (artwork.ownerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to submit this artwork for approval"
      });
    }

    // Check if already pending approval
    if (artwork.pendingApproval) {
      return res.status(400).json({
        success: false,
        message: "Artwork is already pending approval"
      });
    }

    // Start a transaction to update both artwork and create approval
    const [updatedArtwork, approval] = await prisma.$transaction([
      // Update artwork pendingApproval status
      prisma.artwork.update({
        where: {
          dbId: artworkId
        },
        data: {
          pendingApproval: true
        },
        include: {
          owner: {
            select: {
              username: true,
              walletAddress: true
            }
          }
        }
      }),
      
      // Create approval record with proper connection
      prisma.approval.create({
        data: {
          artwork: {
            connect: {
              dbId: artworkId // Connect to existing artwork
            }
          },
          admin: {
            connect: {
              id: 4// Connect to admin user - make sure this ID exists
            }
          },
          status: 'pending'
        }
      })
    ]);

    res.status(200).json({
      success: true,
      artwork: {
        ...updatedArtwork,
        price: updatedArtwork.price.toString(),
        approval: {
          status: approval.status,
          createdAt: approval.createdAt
        }
      },
      message: "Artwork submitted for approval successfully"
    });

  } catch (error) {
    console.error('Error submitting artwork for approval:', error);
    res.status(500).json({
      success: false,
      message: "Failed to submit artwork for approval",
      error: error.message
    });
  }
});

export default router;