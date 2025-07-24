import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import TuklasArtMarketplaceABI from '../artifacts/contracts/Tuklas.sol/TuklasArtMarketplace.json' assert {type: 'json'};
import dotenv from 'dotenv';
import authMiddleware from '../auth.js';

dotenv.config();
const prisma = new PrismaClient();
const protectedRouter = express.Router();

const provider = new ethers.providers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;

// api for getting the pending artworks to be reviewed by the admin
protectedRouter.get('/artworks', authMiddleware(['ADMIN']), async (req, res) => {
  try {
    const pendingArtworks = await prisma.artwork.findMany({
      where: {
        pendingApproval: true,
        isApproved: false,
      },
      select: {
        dbId: true,
        contractId: true,
        title: true,
        description: true,
        imageCID: true,
        price: true,
        owner: {
          select: {
            username: true,
          },
        },
        pendingApproval: true,
        isApproved: true,
        isMinted: true,
        createdAt: true,
        approval: {
          select: {
            status: true,
            reason: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transformedArtworks = pendingArtworks.map((artwork) => ({
      ...artwork,
      rejectionReason: artwork.approval?.status === 'rejected' ? artwork.approval?.reason || 'No reason provided' : null,
    }));

    res.json({
      success: true,
      artworks: transformedArtworks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending artworks',
    });
  }
});
// api for approval
protectedRouter.patch('/approve/:dbId', authMiddleware(['ADMIN']), async (req, res) => {
    try {
      const dbId = req.params.dbId;
      const approved = req.body.approved;
      const adminId = req.body.adminId;
      const reason = req.body.reason || 'No reason provided';  
  
      const artworkDbId = parseInt(dbId);
  
      const artwork = await prisma.artwork.findUnique({
        where: { dbId: artworkDbId },
        include: {
          approval: true,
          owner: {
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
  
      const updatedArtwork = await prisma.$transaction(async (prisma) => {
        let approvedAt = null;
        let rejectedAt = null;
        
        if (approved) {
          approvedAt = new Date();
        } else {
          rejectedAt = new Date();
        }
  
        const updatedArtwork = await prisma.artwork.update({
          where: { dbId: artworkDbId },
          data: {
            isApproved: approved,
            pendingApproval: false,
            approvedAt: approvedAt,
            isRejected: !approved,
            rejectedAt: rejectedAt
          }
        });
  
        if (artwork.approval) {
          let status = approved ? 'approved' : 'rejected';
  
          await prisma.approval.update({
            where: { artworkId: artworkDbId },
            data: {
              status: status,
              reason: reason,
              approvedAt: approvedAt,
              rejectedAt: rejectedAt
            }
          });
        } else {
          let status = approved ? 'approved' : 'rejected';
  
          await prisma.approval.create({
            data: {
              artworkId: artworkDbId,
              adminId: adminId,
              status: status,
              reason: reason,
              approvedAt: approvedAt,
              rejectedAt: rejectedAt
            }
            
          });
        }
  
        return updatedArtwork;
      });
  
      if (approved) {
        try {
          const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
          const contract = new ethers.Contract(contractAddress, TuklasArtMarketplaceABI.abi, wallet);
  
          let gasPrice = await provider.getGasPrice();
          if (gasPrice) {
            gasPrice = gasPrice.mul(12).div(10);
          }
  
          const mintTx = await contract.approveAndMintArt(
            artwork.contractId,
            {
              gasLimit: 500000,
              gasPrice: gasPrice
            }
          );
  
          const receipt = await mintTx.wait();
          console.log('Minting successful:', receipt.transactionHash);
  
          const tokenId = artwork.contractId;
  
          await prisma.$transaction(async (prisma) => {
            await prisma.artwork.update({
              where: { dbId: artworkDbId },
              data: {
                isMinted: true,
                mintTransactionHash: receipt.transactionHash,
                mintedAt: new Date(),
                listedAt: new Date(),
                isRejected: false
              }
            });
  
            await prisma.marketplace.create({
              data: {
                artworkId: artworkDbId,
                tokenId: tokenId,
                price: artwork.price,
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
  
      let responseMessage = '';
      if (approved) {
        responseMessage = 'Artwork approved, minted, and listed in marketplace';
      } else {
        responseMessage = `Artwork rejected. Reason: ${reason}`;
      }
  
      const responseData = {
        success: true,
        message: responseMessage,
        artwork: { ...updatedArtwork,
          rejectionReason:  !approved ? reason :null
        } 
       
      };
  
      res.json(responseData);
  
    } catch (error) {
      console.error('Error in approval process:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
  

export { protectedRouter };