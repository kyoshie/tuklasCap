    import express from "express";
    import cors from "cors";
    import dotenv from "dotenv";
    import walletRoute from "./routes/wallet.js";
    import profileRoute from "./routes/profile.js";
    import kycRoutes from './routes/verify.js'
    import { publicRouter as artsPublicRoutes, protectedRouter as artsProtectedRoutes } from "./routes/arts.js";
    import authMiddleware from "./auth.js";
    import { protectedRouter as adminRoutes } from "./routes/admin.js";

    // Load environment variables
    dotenv.config();

    const app = express();

    app.use(express.json()); 
    app.use(express.urlencoded({ extended: true })); 

    // CORS Middleware
    app.use(cors({
        origin: (origin, callback) => {
            const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:5173"];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
    }));

    // Public routes
    app.use("/api", walletRoute); 
    app.use("/api/arts", artsPublicRoutes); 


    // Protected routes
    app.use("/api", authMiddleware(), profileRoute);
    app.use("/api/arts", authMiddleware(), artsProtectedRoutes); 
    app.use("/api/admin", adminRoutes);
    app.use('/api/verify', kycRoutes);

    // Error handling middleware
    app.use((err, res) => {
        console.error(err.stack);
        
        // Handle specific error types
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }

        // Default error response
        res.status(err.status || 500).json({
            success: false,
            message: process.env.NODE_ENV === 'production' 
                ? "Something went wrong!" 
                : err.message
        });
    });

    // Handle 404 routes
    app.use((res) => {
        res.status(404).json({
            success: false,
            message: "Route not found"
        });
    });

    const PORT = process.env.PORT || 5000;

    // Start the server
    const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

    //server close
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        server.close(() => {
            process.exit(1);
        });
    });

    process.on('unhandledRejection', (error) => {
        console.error('Unhandled Rejection:', error);
        server.close(() => {
            process.exit(1);
        });
    });