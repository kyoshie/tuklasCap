import jwt from 'jsonwebtoken';
import { prisma } from './database.js';
import dotenv from 'dotenv';

dotenv.config();


// auth.js
const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        console.log('Auth Debug:', {
            authHeader: req.headers.authorization,
            path: req.path,
            method: req.method
        });

        // Get token from the request headers
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(403).json({ error: 'Access denied. No token provided.' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded); // Add this debug log
            
            // Verify user exists in database
            const user = await prisma.user.findUnique({
                where: { walletAddress: decoded.walletAddress }
            });

            if (!user) {
                return res.status(401).json({ error: 'User not found.' });
            }

            // Check if the user role is allowed (if roles are specified)
            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
            }

            req.user = user; // Store full user object in request
            next();
        } catch (error) {
            console.error('Auth Error:', error);
            return res.status(401).json({ error: 'Invalid token.' });
        }
    };
};

export default authMiddleware;