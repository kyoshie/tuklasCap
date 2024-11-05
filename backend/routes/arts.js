import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';


dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();


const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});


router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { title, description, price, walletAddress, transactionHash, contractId } = req.body;

    // Validate the wallet address format
    if (!ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({ success: false, message: "Invalid wallet address" });
    }

    // Create or retrieve user
    let user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      user = await prisma.user.create({ data: { walletAddress, role: 'USER' } });
    }

    // Pinata upload
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

    // Save to database
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
        transactionHash: transactionHash, // From frontend transaction
        owner: { connect: { id: user.id } }
      }
    });

    res.status(200).json({
      success: true,
      artwork,
      ipfsHash: pinataRes.data.IpfsHash,
      message: "Artwork uploaded successfully and posted in the gallery"
    });

  } catch (error) {
    console.error('Error handling upload:', error.message);
    res.status(500).json({
      success: false,
      message: "Failed to process upload",
      error: error.message
    });
  }
});

router.get('/fetch/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    console.log('Fetching data for wallet:', walletAddress);

    // Validate wallet address
    if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address"
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Debug: Log created artworks
    console.log('Found created artworks:', createdArtworks.length);

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

    // Debug: Log purchased artworks
    console.log('Found purchased artworks:', purchasedArtworks.length);
    console.log('Purchase details:', purchasedArtworks);

    // Format the artworks for response
    const formattedCreated = createdArtworks.map(artwork => ({
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
      artist: artwork.owner.username || artwork.owner.walletAddress.slice(0, 6),
      artistWallet: artwork.owner.walletAddress,
      approvalStatus: artwork.approval?.status || null,
      approvalDate: artwork.approval?.createdAt || null
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

    // Debug: Log formatted response
    console.log('Sending response with:', {
      created: formattedCreated.length,
      purchased: formattedPurchased.length
    });

    // Send response
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
router.post('/update-hash', async (req, res) => {
  try {
    const { artworkId, transactionHash } = req.body;

    const artwork = await prisma.artwork.update({
      where: { dbId: parseInt(artworkId) },
      data: { transactionHash }
    });

    res.json({
      success: true,
      artwork,
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

router.get('/marketplace', async (req, res) => {
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
          lastSalePrice: listing.artwork.Sale[0]?.price.toString() || null
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

router.post('/marketplace/buy/:dbId', async (req, res) => {
  try {
    const { dbId } = req.params;
    const { walletAddress, transactionHash } = req.body;
    const marketplaceId = parseInt(dbId); // Correctly parse `dbId`

    console.log('Processing purchase:', {
      marketplaceId,
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

    // Check if transactionHash is provided and valid
    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: "Transaction hash is required"
      });
    }

    // Get marketplace listing with artwork details
    const listing = await prisma.marketplace.findUnique({
      where: { id: marketplaceId },
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

    // Verify artwork status
    if (!listing.artwork.isApproved || !listing.artwork.isMinted) {
      return res.status(400).json({
        success: false,
        message: "Artwork is not ready for sale"
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
        // 1. Update artwork status
        const updatedArtwork = await prisma.artwork.update({
          where: { dbId: listing.artwork.dbId },
          data: {
            isSold: true,
            soldAt: new Date()
          }
        });

        // 2. Create sale record
        const sale = await prisma.sale.create({
          data: {
            artworkId: listing.artwork.dbId,
            buyerAddress: walletAddress,
            price: listing.price,
            transactionHash: transactionHash,
          }
        });

        // 3. Remove marketplace listing
        await prisma.marketplace.delete({
          where: { id: marketplaceId }
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


export default router;