import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import walletRoute from "./routes/wallet.js";
import profileRoute from "./routes/profile.js";
import transactionsRoute from "./routes/transactions.js";
import artsRoute from "./routes/arts.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Register the routes with the appropriate path
app.use("/api", walletRoute);
app.use("/api", profileRoute);
app.use("/api", transactionsRoute);
app.use("/api", artsRoute);

// Start the server
app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});
