import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import TuklasArtMarketplaceABI from '../artifacts/contracts/Tuklas.sol/TuklasArtMarketplace.json' assert {type: 'json'};
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

// Provider setup
const provider = new ethers.providers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;

// Get all pending artworks for admin review
router.get('/artworks', async (req, res) => {
  try {
    const pendingArtworks = await prisma.artwork.findMany({
      where: { 
        pendingApproval: true,
        isApproved: false
      },
      include: {
        owner: {
          select: {
            username: true,
            walletAddress: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      artworks: pendingArtworks.map(artwork => ({
        dbId: artwork.dbId,
        contractId: artwork.contractId,
        title: artwork.title,
        description: artwork.description,
        imageCID: artwork.imageCID,
        price: artwork.price.toString(),
        artist: artwork.owner.username || 'Anonymous',
        pendingApproval: artwork.pendingApproval,
        isApproved: artwork.isApproved,
        isMinted: artwork.isMinted,
        createdAt: artwork.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching pending artworks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending artworks'
    });
  }
});

// Handle artwork approval/rejection
router.patch('/approve/:dbId', async (req, res) => {
  try {
    const { dbId } = req.params;
    const { approved, adminId, reason } = req.body;
    const artworkDbId = parseInt(dbId);

    // Find the artwork
    const artwork = await prisma.artwork.findUnique({
      where: { dbId: artworkDbId },
      include: {
        approval: true,
        owner:  {
          select: {
            username: true,
            walletAddress: true
          }
        }
      }
    });

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    // Start approval transaction
    const updatedArtwork = await prisma.$transaction(async (prisma) => {
      // Update artwork status
      const updatedArtwork = await prisma.artwork.update({
        where: { dbId: artworkDbId },
        data: {
          isApproved: approved,
          pendingApproval: false,
          approvedAt: approved ? new Date() : null
        }
      });

      // Create/update approval record
      if (artwork.approval) {
        await prisma.approval.update({
          where: { artworkId: artworkDbId },
          data: {
            status: approved ? 'approved' : 'rejected',
            reason,
            approvedAt: approved ? new Date() : null
          }
        });
      } else {
        await prisma.approval.create({
          data: {
            artworkId: artworkDbId,
            adminId: adminId,
            status: approved ? 'approved' : 'rejected',
            reason,
            approvedAt: approved ? new Date() : null
          }
        });
      }

      return updatedArtwork;
    });

    // If approved, proceed with minting and marketplace listing
    if (approved) {
      try {
        const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(contractAddress, TuklasArtMarketplaceABI.abi, wallet);

        console.log('Minting artwork:', {
          dbId: artworkDbId,
          contractId: artwork.contractId
        });

        // Mint the NFT
        const mintTx = await contract.approveAndMintArt(
          artwork.contractId,
          artwork.owner.walletAddress,
          {
            gasLimit: 500000,
            gasPrice: (await provider.getGasPrice()).mul(12).div(10)
          }
        );

        const receipt = await mintTx.wait();
        console.log('Minting successful:', receipt.transactionHash);

        // Use contractId as tokenId since they should match
        const tokenId = artwork.contractId;

        // Start post-minting transaction
        await prisma.$transaction(async (prisma) => {
          // Update artwork with minting info
          await prisma.artwork.update({
            where: { dbId: artworkDbId },
            data: {
              isMinted: true,
              mintTransactionHash: receipt.transactionHash,
              mintedAt: new Date(),
              listedAt: new Date()
            }
          });

          // Create marketplace listing with explicit tokenId
          await prisma.marketplace.create({
            data: {
              artworkId: artworkDbId,
              tokenId: tokenId, // Using the tokenId we got from contractId
              price: artwork.price, // This is already a Decimal
              status: "LISTED"
            }
          });
        });

        console.log('Created marketplace listing with tokenId:', tokenId);

      } catch (mintError) {
        console.error('Minting or marketplace error:', mintError);
        return res.status(500).json({
          success: false,
          message: 'Artwork approved but minting/listing failed: ' + mintError.message
        });
      }
    }

    res.json({
      success: true,
      message: approved ? 'Artwork approved, minted, and listed in marketplace' : 'Artwork rejected',
      artwork: {
        ...updatedArtwork,
        price: updatedArtwork.price.toString()
      }
    });

  } catch (error) {
    console.error('Error in approval process:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
export default router;