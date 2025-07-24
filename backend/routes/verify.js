import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../auth.js';

const prisma = new PrismaClient();
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}. Only JPEG, PNG, and WEBP are allowed.`));
    }
  }
});

router.post(
  '/submit-kyc',
  authMiddleware(),
  upload.single("validIdPhoto"),
  async (req, res) => {
    try {
      console.log('Received KYC submission request');

      const requiredFields = [
        'firstName',
        'lastName',
        'birthDate',
        'birthPlace',
        'address',
        'gender',
        'municipality'
      ];
      
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        console.log('Missing required fields:', missingFields);
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          code: 'MISSING_FIELDS'
        });
      }

      const validIdPhoto = req.file;
      if (!validIdPhoto) {
        console.log('Missing required file: validIdPhoto');
        return res.status(400).json({
          success: false,
          message: 'valid ID photo is required',
          code: 'MISSING_FILES'
        });
      }

      // Check if a KYC record already exists for this user
      const existingKyc = await prisma.kyc.findFirst({
        where: { userId: req.user.id }
      });

      if (existingKyc) {
        // If the record exists and is not approved, allow resubmission by updating the record
        if (!existingKyc.isApproved) {
          console.log('Resubmitting KYC for user:', req.user.id);
          const updatedKyc = await prisma.kyc.update({
            where: { id: existingKyc.id },
            data: {
              firstName: req.body.firstName,
              middleName: req.body.middleName || null,
              lastName: req.body.lastName,
              birthDate: new Date(req.body.birthDate),
              birthPlace: req.body.birthPlace,
              address: req.body.address,
              validIdPhoto: validIdPhoto.buffer,
              gender: req.body.gender,
              municipality: req.body.municipality,
              status: 'pending',
              isRejected: false,       // Reset rejection flag if applicable
              rejectionReason: null,   // Clear any previous rejection reason
              submittedAt: new Date(), // Optionally update the submission time
            }
          });
          console.log('KYC record updated (resubmitted):', updatedKyc.id);
          return res.status(200).json({
            success: true,
            message: 'KYC resubmitted successfully',
            data: {
              kycId: updatedKyc.id,
              status: updatedKyc.status,
              submittedAt: updatedKyc.submittedAt
            }
          });
        } else {
          // If the record is already approved, do not allow resubmission
          console.log('KYC submission already exists and is approved for user:', req.user.id);
          return res.status(409).json({
            success: false,
            message: 'KYC submission already exists and is approved for this user',
            code: 'KYC_EXISTS'
          });
        }
      }
      
      // No existing record found; create a new one
      console.log('Creating new KYC record');
      const kycRecord = await prisma.kyc.create({
        data: {
          firstName: req.body.firstName,
          middleName: req.body.middleName || null,
          lastName: req.body.lastName,
          birthDate: new Date(req.body.birthDate),
          birthPlace: req.body.birthPlace,
          address: req.body.address,
          validIdPhoto: validIdPhoto.buffer,
          gender: req.body.gender,
          municipality: req.body.municipality,
          status: 'pending',
          userId: req.user.id
        }
      });

      console.log('KYC record created:', kycRecord.id);

      return res.status(201).json({
        success: true,
        message: 'KYC submitted successfully',
        data: {
          kycId: kycRecord.id,
          status: kycRecord.status,
          submittedAt: kycRecord.createdAt
        }
      });
    } catch (error) {
      console.error('[KYC Submission Error]', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error during KYC submission',
        code: 'SERVER_ERROR',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);


router.get('/submissions', authMiddleware(), async (req, res) => {
  try {
    const submissions = await prisma.kyc.findMany({
      where: {
        isApproved:false,
      },
      select: {
        id: true,
        firstName: true,
        middleName:true,
        birthDate: true,
        birthPlace: true,
        gender: true,
        lastName: true,
        municipality: true,
        address:true,
        validIdPhoto: true,
        status: true,
        rejectionReason: true,
      }
    });

    const formattedSubmissions = submissions.map((submission) => ({
      kycId: submission.id,
      firstName: submission.firstName,
      middleName: submission.middleName,
      lastName: submission.lastName,
      gender: submission.gender,
      birthDate: submission.birthDate,
      birthPlace: submission.birthPlace,
      municipality: submission.municipality,
      address:submission.address,
      validIdPhoto: submission.validIdPhoto ? submission.validIdPhoto.toString('base64') : null,
      status: submission.status,
      rejectionReason: submission.rejectionReason
  
    }));

    res.status(200).json({ success: true, data: formattedSubmissions });
  } catch (error) {
    console.error('[KYC Fetch Error]', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching KYC submissions',
      code: 'SERVER_ERROR'
    });
  }
});

router.patch('/approve/:kycId', authMiddleware(), async (req, res) => {
  const { approved, reason } = req.body;
  const kycId = req.params.kycId;
  const kyccId = parseInt(kycId, 10);

  let updateData;
  if (approved) {
    updateData = {
      status: "approved",
      isApproved: true,
      approvedAt: new Date(),
    };
  } else {
    updateData = {
      status: "rejected",
      isApproved: false,
      isRejected: true,
      rejectionReason: reason,
    };
  }

  try {
    const submission = await prisma.kyc.update({
      where: { id: kyccId },
      data: updateData,
    });
    return res.json({
      success: true,
      submission,
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }
    console.error("Update error:", err);
    return res.status(500).json({
      success: false,
      message: "Error updating submission.",
    });
  }
});

router.get('/verifiedStatus', authMiddleware(), async (req, res) => {
  try {
    const submission = await prisma.kyc.findFirst({
      where: { userId: req.user.id },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        birthDate: true,
        birthPlace: true,
        gender: true,
        municipality: true,
        address: true,
        validIdPhoto: true,
        status: true,
        isApproved: true,
        rejectionReason:true,
      }
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'No KYC record found' });
    }

    const formattedSubmission = {
      kycId: submission.id,
      firstName: submission.firstName,
      middleName: submission.middleName,
      lastName: submission.lastName,
      birthDate: submission.birthDate,
      birthPlace: submission.birthPlace,
      gender: submission.gender,
      municipality: submission.municipality,
      address: submission.address,
      validIdPhoto: submission.validIdPhoto ? submission.validIdPhoto.toString('base64') : null,
      status: submission.status,
      isApproved: submission.isApproved,
      rejectionReason: submission.rejectionReason,
    };

    res.status(200).json({ success: true, data: formattedSubmission });
  } catch (error) {
    console.error('[KYC Fetch Error]', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching KYC submission',
      code: 'SERVER_ERROR'
    });
  }
});



export default router;