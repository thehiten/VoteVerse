const express = require('express');
const app = express();
const db = require('./db');


const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

require('dotenv').config();
// Import router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Use routes
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes); // Requires authentication middleware for candidate routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
