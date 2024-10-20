import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );

    return token;
};

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return {};
    }
};
