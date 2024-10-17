const express = require('express');
const cors = require('cors');



const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

// PostgreSQL client setup

const walletRoute = require("./routes/wallet");
const profileRoute = require("./routes/profile")





app.use('/api', walletRoute)
app.use('/api', profileRoute)




// Start the server
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
