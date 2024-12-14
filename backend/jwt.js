import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            walletAddress: user.walletAddress,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export const verifySignature = (message, signature, walletAddress) => {
    try {
        const recoveredAddress = ethers.utils.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
        console.error('Signature verification failed:', error);
        return false;
    }
};