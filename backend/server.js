import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import walletRoute from "./routes/wallet.js";
import profileRoute from "./routes/profile.js";
import artsRoute from "./routes/arts.js";
import adminRoute from "./routes/admin.js"

// Load environment variables
dotenv.config();

const app = express();

// Middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", walletRoute);
app.use("/api", profileRoute);
app.use("/api/arts", artsRoute);
app.use("/api/admin", adminRoute)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!"
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});