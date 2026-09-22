const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '18515'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'defaultdb',
    waitForConnections: true,
    connectionLimit: 15,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initDb() {
    try {
        console.log('Verifying Aiven MySQL database connection...');
        const connection = await pool.getConnection();
        console.log('Connected to Aiven MySQL database: defaultdb');

        // Create fatwa_questions table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS fatwa_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(100) NOT NULL,
                madhhab VARCHAR(100) NOT NULL,
                isUrgent BOOLEAN DEFAULT FALSE,
                questionText TEXT NOT NULL,
                answerText TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Create fatwa_comments table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS fatwa_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                questionId INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                text TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (questionId) REFERENCES fatwa_questions(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Add performance indexes if they don't already exist
        try {
            await connection.query(`
                CREATE INDEX idx_fatwa_status_created ON fatwa_questions(status, createdAt DESC);
            `);
        } catch (idxErr) {
            // Index might already exist; continue
        }

        try {
            await connection.query(`
                CREATE INDEX idx_fatwa_status_madhhab ON fatwa_questions(status, madhhab, createdAt DESC);
            `);
        } catch (idxErr) {
            // Index might already exist; continue
        }

        connection.release();
    } catch (err) {
        console.error('Error initializing MySQL database:', err);
        throw err;
    }
}

module.exports = {
    pool,
    initDb
};
