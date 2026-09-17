const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '18515'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'defaultdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

const initialQuestions = [
    {
        name: "Ahmed Al-Mansoor",
        phone: "+1 555-0192",
        madhhab: "Shafi'i",
        isUrgent: false,
        questionText: "What is the ruling regarding combining prayers during severe rain or storm according to the Shafi'i school?",
        answerText: "In the Shafi'i school, it is permissible to combine (Jam') Dhuhr with 'Asr at the time of Dhuhr (Taqdim), and Maghrib with 'Isha at the time of Maghrib (Taqdim) due to rain, snow, or hail that wets one's clothes, provided that the person intends to pray in congregation at a distant mosque and the rain is present at the start of both prayers and during the salam of the first.",
        status: "Answered",
        comments: [
            {
                name: "Zaid Khan",
                text: "Barakallahu feek for the clear explanation on the conditions of Taqdim."
            },
            {
                name: "Omar Farooq",
                text: "Does this apply to praying at home? (Answer: No, it is specific to reaching the congregation at the masjid according to the standard mu'tamad view)."
            }
        ]
    },
    {
        name: "Fatima Zahra",
        phone: "+1 555-0143",
        madhhab: "Hanafi",
        isUrgent: false,
        questionText: "How should missed fasts from previous years of Ramadan be made up in the Hanafi madhhab?",
        answerText: "According to the Hanafi madhhab, missed fasts of Ramadan (Qada) must be made up day for day as soon as reasonably possible. There is no monetary expiation (Fidya) required simply for delaying Qada past the next Ramadan, though making them up promptly is strongly recommended.",
        status: "Answered",
        comments: [
            {
                name: "Maryam Siddiqui",
                text: "Very helpful and straightforward ruling, thank you."
            }
        ]
    },
    {
        name: "Bilal Tariq",
        phone: "+1 555-0188",
        madhhab: "Maliki",
        isUrgent: false,
        questionText: "What is the ruling on Sadl (praying with hands at the sides) versus Qabd in the Maliki school?",
        answerText: "In the Maliki school, Sadl (leaving hands at the sides during standing in obligatory prayers) is the well-known position (Mashhur) based on the continuous practice of the people of Madinah ('Amal Ahl al-Madinah). However, placing the right hand over the left (Qabd) is also permissible and acknowledged in the school for voluntary prayers and accepted across schools.",
        status: "Answered",
        comments: []
    },
    {
        name: "Yusuf Hassan",
        phone: "+1 555-0129",
        madhhab: "Hanbali",
        isUrgent: true,
        questionText: "Is it permissible to pay Zakat al-Fitr in monetary currency instead of grain according to the Hanbali school?",
        answerText: "",
        status: "Pending",
        comments: []
    },
    {
        name: "Khadija Noor",
        phone: "+1 555-0176",
        madhhab: "General / No Preference",
        isUrgent: false,
        questionText: "What are the core etiquettes of making Du'a during the last third of the night?",
        answerText: "",
        status: "Pending",
        comments: []
    }
];

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

        // Check if seeding is needed
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM fatwa_questions');
        if (rows[0].count === 0) {
            console.log('Seeding initial fatwas in MySQL database...');
            for (const q of initialQuestions) {
                const [result] = await connection.query(
                    'INSERT INTO fatwa_questions (name, phone, madhhab, isUrgent, questionText, answerText, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [q.name, q.phone, q.madhhab, q.isUrgent, q.questionText, q.answerText || '', q.status]
                );
                const questionId = result.insertId;
                if (q.comments && q.comments.length > 0) {
                    for (const c of q.comments) {
                        await connection.query(
                            'INSERT INTO fatwa_comments (questionId, name, text) VALUES (?, ?, ?)',
                            [questionId, c.name, c.text]
                        );
                    }
                }
            }
            console.log('Initial fatwas seeded successfully in MySQL!');
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
