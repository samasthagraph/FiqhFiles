const compression = require('compression');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { initDb } = require('./db');

const app = express();

// Middleware
app.use(compression());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Lazy DB initialization for Serverless & Traditional runtimes
let isDbInitialized = false;
let dbInitPromise = null;

async function ensureDbInit() {
    if (isDbInitialized) return;
    if (!dbInitPromise) {
        dbInitPromise = initDb()
            .then(() => {
                isDbInitialized = true;
            })
            .catch(err => {
                console.error('Database initialization warning:', err.message);
                dbInitPromise = null; // Allow retry on subsequent request
            });
    }
    await dbInitPromise;
}

// Ensure DB is initialized before processing requests on serverless cold starts
app.use(async (req, res, next) => {
    try {
        await ensureDbInit();
    } catch (err) {
        // Proceed even if schema check had a warning
    }
    next();
});

// Root informational endpoint
app.get('/', (req, res) => res.json({
    message: "Fiqh File API is running on Vercel",
    status: "healthy",
    endpoints: {
        publicQuestions: "/api/questions/public",
        health: "/api/health"
    }
}));

// Health check endpoint for uptime monitoring & keep-alive
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Mount routes at both /api and / to handle direct and rewritten requests seamlessly
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

const PORT = process.env.PORT || 5001;

async function startServer() {
    try {
        await ensureDbInit();
        app.listen(PORT, () => {
            console.log(`Backend server running on port ${PORT} with Aiven MySQL database`);
        });
    } catch (err) {
        console.error('Failed to initialize database and start server:', err);
        process.exit(1);
    }
}

// Only start the HTTP listener when run directly (e.g. node server.js or npm start)
// When imported on Vercel Serverless, export the app instance without app.listen()
if (require.main === module) {
    startServer();
}

module.exports = app;
