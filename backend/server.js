const compression = require('compression');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { initDb } = require('./db');

const app = express();

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// Health check endpoint for uptime monitoring & keep-alive
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

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

