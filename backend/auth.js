// middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        // Get token from the request headers
        const token = req.headers['authorization']?.split(' ')[1]; // Bearer token

        if (!token) {
            return res.status(403).json({ error: 'Access denied. No token provided.' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Store user info in request

            // Check if the user role is allowed
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Access denied. You do not have the right role.' });
            }

            next(); // User is authenticated and has the required role
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
    };
};

export default authMiddleware;
