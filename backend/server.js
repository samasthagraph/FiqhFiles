const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { initDb } = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5001;

async function startServer() {
    try {
        await initDb();
        app.listen(PORT, () => {
            console.log(`Backend server running on port ${PORT} with Aiven MySQL database`);
        });
    } catch (err) {
        console.error('Failed to initialize database and start server:', err);
        process.exit(1);
    }
}

startServer();

