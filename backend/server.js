import express from "express";
import cors from "cors";

import walletRoute from "./routes/wallet.js";
import profileRoute from "./routes/profile.js";

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

app.use("/api", walletRoute);
app.use("/api", profileRoute);

// Start the server
app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});
