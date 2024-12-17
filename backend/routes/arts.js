import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import authMiddleware from '../auth.js';


dotenv.config();
const prisma = new PrismaClient();
const publicRouter = express.Router();
const protectedRouter = express.Router();

//file size limit
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});


protectedRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const { title, description, price, contractId } = req.body;
      const walletAddress = req.user.walletAddress; 

      // Pinata upload api
      const pinataFormData = new FormData();
      pinataFormData.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
      });

      const pinataRes = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          pinataFormData,
          {
              maxBodyLength: Infinity,
              headers: {
                  ...pinataFormData.getHeaders(),
                  'pinata_api_key': process.env.PINATA_API_KEY,
                  'pinata_secret_api_key': process.env.PINATA_API_SECRET,
              }
          }
      );

      // save the artwork to database
      const artwork = await prisma.artwork.create({
          data: {
              contractId: parseInt(contractId),
              title,
              description,
              imageCID: pinataRes.data.IpfsHash,
              price: parseFloat(price),
              isApproved: false,
              isMinted: false,
              isSold: false,
              pendingApproval: false,
              transactionHash: req.body.transactionHash,
              owner: { connect: { id: req.user.id } }
          }
      });

      res.status(200).json({
          success: true,
          artwork,
          ipfsHash: pinataRes.data.IpfsHash,
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


//api to fetch the user wallet address
protectedRouter.get('/fetch/:walletAddress', async (req, res) => {
  try {
      const { walletAddress } = req.params;

   
      if (walletAddress.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
          return res.status(403).json({
              success: false,
              message: "You can only view your own artworks"
          });
      }

      // Find user by wallet address
      const user = await prisma.user.findUnique({
          where: { walletAddress }
      });

      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found"
          });
      }

      // Debug: Log user found
      console.log('Found user:', user);

      // Get created artworks
      const createdArtworks = await prisma.artwork.findMany({
          where: {
              ownerId: user.id
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
              },
              marketplace: true
          },
          orderBy: {
              createdAt: 'desc'
          }
      });

      // Debug: Log created artworks
      console.log('Found created artworks:', createdArtworks);

      // Get purchased artworks through Sales table
      const purchasedArtworks = await prisma.sale.findMany({
          where: {
              buyerAddress: walletAddress,
          },
          select: {
              artwork: {
                  include: {
                      owner: {
                          select: {
                              username: true,
                              walletAddress: true
                          }
                      }
                  }
              },
              price: true,
              transactionHash: true,
              soldAt: true
          }
      });

      // Format the artworks for response
      const formattedCreated = createdArtworks.map(artwork => ({
          dbId: artwork.dbId,
          contractId: artwork.contractId,
          title: artwork.title,
          description: artwork.description,
          imageCID: artwork.imageCID,
          price: artwork.price.toString(),
          isApproved: artwork.isApproved,
          approval: artwork.approval,
          isMinted: artwork.isMinted,
          isSold: artwork.isSold,
          pendingApproval: artwork.pendingApproval,
          transactionHash: artwork.transactionHash,
          mintTransactionHash: artwork.mintTransactionHash,
          marketplace: artwork.marketplace,
          createdAt: artwork.createdAt,
          artist: artwork.owner.username || artwork.owner.walletAddress.slice(0, 6),
          artistWallet: artwork.owner.walletAddress,
          approvalStatus: artwork.approval?.status || null,
          approvalDate: artwork.approval?.createdAt || null,
          status:artwork.status
      }));

      // Format purchased artworks
      const formattedPurchased = purchasedArtworks.map(purchase => {
          const artwork = purchase.artwork;
          return {
              dbId: artwork.dbId,
              contractId: artwork.contractId,
              title: artwork.title,
              description: artwork.description,
              imageCID: artwork.imageCID,
              price: purchase.price.toString(),
              isApproved: artwork.isApproved,
              isMinted: artwork.isMinted,
              isSold: artwork.isSold,
              transactionHash: purchase.transactionHash,
              purchasedAt: purchase.soldAt,
              artist: artwork.owner.username || artwork.owner.walletAddress.slice(0, 6),
              artistWallet: artwork.owner.walletAddress
          };
      });

      res.status(200).json({
          success: true,
          artworks: {
              created: formattedCreated,
              purchased: formattedPurchased
          },
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

protectedRouter.post('/update-hash', authMiddleware(), async (req, res) => {
  try {
      const { artworkId, transactionHash } = req.body;

      // Verify ownership
      const artwork = await prisma.artwork.findUnique({
          where: { dbId: parseInt(artworkId) },
          include: { owner: true }
      });

      if (artwork.owner.walletAddress.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
          return res.status(403).json({
              success: false,
              message: "You can only update your own artworks"
          });
      }

      const updatedArtwork = await prisma.artwork.update({
          where: { dbId: parseInt(artworkId) },
          data: { transactionHash }
      });

      res.json({
          success: true,
          artwork: updatedArtwork,
          message: "Transaction hash updated successfully"
      });

  } catch (error) {
      console.error('Error updating hash:', error);
      res.status(500).json({
          success: false,
          message: "Failed to update transaction hash",
          error: error.message
      });
  }
});

protectedRouter.put('/approval/:artworkId', async (req, res) => {
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

    const admin = await prisma.user.findFirst({
      where: {
        role: "ADMIN"
      }
    })

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
      
      // Create approval record 
      prisma.approval.create({
        data: {
          artwork: {
            connect: {
              dbId: artworkId 
            }
          },
          admin: {
            connect: {
              id: admin.id 
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

publicRouter.get('/marketplace', async (req, res) => {
  try {
    const listings = await prisma.marketplace.findMany({
      where: {
        status: 'LISTED',
        artwork: {
          isSold: false
        }
      },
      include: {
        artwork: {
          include: {
            owner: {
              select: {
                username: true,
                walletAddress: true
              }
            },
            Sale: {
              orderBy: {
                soldAt: 'desc'
              },
              take: 1
            }
          }
        }
      },
      orderBy: {
        listedAt: 'desc'
      }
    });

    res.json({
      success: true,
      listings: listings.map(listing => ({
        id: listing.id,
        tokenId: listing.tokenId,
        price: listing.price.toString(),
        listedAt: listing.listedAt,
        artwork: {
          id: listing.artwork.dbId,
          title: listing.artwork.title,
          description: listing.artwork.description,
          imageCID: listing.artwork.imageCID,
          artist: listing.artwork.owner.username || 'Unknown',
          artistWallet: listing.artwork.owner.walletAddress,
          lastSalePrice: listing.artwork.Sale[0]?.price.toString() || null,
          status:listing.status
        }
      }))
    });

  } catch (error) {
    console.error('Error fetching marketplace listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketplace listings',
      error: error.message
    });
  }
});

protectedRouter.post('/marketplace/buy/:marketplaceId',  async (req, res) => {
  try {
    const { marketplaceId } = req.params;
    const { walletAddress, transactionHash } = req.body;
    const marketId = parseInt(marketplaceId);

    console.log('Processing purchase:', {
      marketId,
      walletAddress,
      transactionHash
    });

    // Validate wallet address
    if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address"
      });
    }

    // Check if transactionHash is provided
    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: "Transaction hash is required"
      });
    }

    // Get marketplace listing with artwork details
    const listing = await prisma.marketplace.findUnique({
      where: { id: marketId },
      include: {
        artwork: {
          include: {
            owner: true
          }
        }
      }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    // Check if buyer is the artist
    if (listing.artwork.owner.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Artists cannot purchase their own artworks"
      });
    }

    // Verify transaction using the specified provider
    const provider = new ethers.providers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_URL);
    
    try {
      const receipt = await provider.getTransactionReceipt(transactionHash);

      if (!receipt || !receipt.status) {
        return res.status(400).json({
          success: false,
          message: "Transaction not found or failed"
        });
      }

      console.log('Transaction verified, processing database updates...');

      // Process the purchase in a transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Update artwork status
        const updatedArtwork = await prisma.artwork.update({
          where: { dbId: listing.artwork.dbId },
          data: {
            isSold: true,
            soldAt: new Date()
          }
        });

        // Create sale record
        const sale = await prisma.sale.create({
          data: {
            artworkId: listing.artwork.dbId,
            buyerAddress: walletAddress,
            price: listing.price,
            transactionHash: transactionHash,
          }
        });

        // Delete the marketplace listing
        await prisma.marketplace.delete({
          where: { id: marketId }
        });

        return { updatedArtwork, sale };
      });

      console.log('Purchase completed successfully:', result);

      res.json({
        success: true,
        message: 'NFT purchased successfully',
        saleDetails: {
          artworkId: result.updatedArtwork.dbId,
          price: result.sale.price.toString(),
          buyer: walletAddress,
          transactionHash: result.sale.transactionHash
        }
      });

    } catch (receiptError) {
      console.error('Error fetching transaction receipt:', receiptError);
      return res.status(400).json({
        success: false,
        message: 'Failed to verify transaction hash',
        error: receiptError.message
      });
    }

  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process purchase',
      error: error.message
    });
  }
});


protectedRouter.delete('/marketplace/cancel/:marketplaceId', authMiddleware(), async (req, res) => {
  try {
    const { marketplaceId } = req.params;
    const { walletAddress } = req.body;
    const marketId = parseInt(marketplaceId);

    // Validate wallet address
    if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address"
      });
    }

    // Fetch the marketplace listing with artwork and owner details
    const listing = await prisma.marketplace.findUnique({
      where: { id: marketId },
      include: {
        artwork: {
          include: {
            owner: true 
          }
        }
      }
    });

    // Check if listing exists
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Marketplace listing not found',
      });
    }

    // Check if the wallet address matches the artwork owner
    if (listing.artwork.owner.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this listing',
      });
    }

    // Process the cancellation in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update artwork
      const updatedArtwork = await prisma.artwork.update({
        where: { dbId: listing.artwork.dbId },
        data: {
          isSold: false,
          pendingApproval: false
        }
      });

      // Delete the marketplace listing
      await prisma.marketplace.delete({
        where: { id: marketId }
      });

      return { updatedArtwork };
    });

    res.json({
      success: true,
      message: 'Marketplace listing cancelled successfully',
      details: {
        artworkId: result.updatedArtwork.dbId,
        cancelledAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error cancelling listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel listing',
      error: error.message
    });
  }
});

protectedRouter.post('/marketplace/relist/:artworkId', authMiddleware(), async (req, res) => {
  try {
    const { artworkId } = req.params;
    const { walletAddress, price } = req.body;
    const artId = parseInt(artworkId);

    // Validate inputs
    if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address"
      });
    }

    if (!price || isNaN(parseFloat(price))) {
      return res.status(400).json({
        success: false,
        message: "Invalid price"
      });
    }

    // Find the artwork and verify ownership
    const artwork = await prisma.artwork.findUnique({
      where: { dbId: artId },
      include: {
        owner: true,
        marketplace: true
      }
    });

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: "Artwork not found"
      });
    }

    if (artwork.owner.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to relist this artwork"
      });
    }

    // Check if the an artwork can be relisted
    if (!artwork.isMinted || !artwork.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Artwork must be minted and approved to be listed"
      });
    }

    // Check if artwork is already listed
    if (artwork.marketplace) {
      return res.status(400).json({
        success: false,
        message: "Artwork is already listed in the marketplace"
      });
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Create marketplace listing
      const listing = await prisma.marketplace.create({
        data: {
          artwork: {
            connect: { dbId: artId }
          },
          price: parseFloat(price),
          tokenId: artwork.contractId,
          status: 'LISTED'
        }
      });

      // Update artwork
      const updatedArtwork = await prisma.artwork.update({
        where: { dbId: artId },
        data: {
          price: parseFloat(price),
          listedAt: new Date()
        }
      });

      return { listing, updatedArtwork };
    });

    res.json({
      success: true,
      listing: result.listing,
      message: "Artwork relisted successfully"
    });

  } catch (error) {
    console.error('Error relisting artwork:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to relist artwork',
      error: error.message
    });
  }
});

export { publicRouter, protectedRouter };