const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Helper to format a question record with _id and comments
function formatQuestion(q, comments = []) {
    return {
        _id: q.id.toString(),
        id: q.id,
        name: q.name,
        phone: q.phone,
        madhhab: q.madhhab,
        isUrgent: Boolean(q.isUrgent),
        questionText: q.questionText,
        answerText: q.answerText || '',
        status: q.status,
        createdAt: q.createdAt,
        comments: comments.map(c => ({
            _id: c.id.toString(),
            id: c.id,
            name: c.name,
            text: c.text,
            createdAt: c.createdAt
        }))
    };
}

// --- PUBLIC ROUTES --- //

// Submit a new question
router.post('/questions', async (req, res) => {
    try {
        const { name, phone, madhhab, questionText } = req.body;

        if (!name || !phone || !madhhab || !questionText) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO fatwa_questions (name, phone, madhhab, questionText, status) VALUES (?, ?, ?, ?, ?)',
            [name, phone, madhhab, questionText, 'Pending']
        );

        res.status(201).json({ message: 'Question submitted successfully', id: result.insertId, _id: result.insertId.toString() });
    } catch (error) {
        console.error('Error submitting question:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get public answered questions
router.get('/questions/public', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0;
        let query = "SELECT * FROM fatwa_questions WHERE status = 'Answered'";
        const params = [];

        if (req.query.madhhab && req.query.madhhab !== 'All') {
            query += ' AND madhhab = ?';
            params.push(req.query.madhhab);
        }

        query += ' ORDER BY createdAt DESC';

        if (limit > 0) {
            query += ' LIMIT ?';
            params.push(limit);
        }

        const [questions] = await pool.query(query, params);

        // Fetch comments for all these questions
        const questionIds = questions.map(q => q.id);
        let comments = [];
        if (questionIds.length > 0) {
            const [cRows] = await pool.query(
                'SELECT * FROM fatwa_comments WHERE questionId IN (?) ORDER BY createdAt ASC',
                [questionIds]
            );
            comments = cRows;
        }

        const formatted = questions.map(q => {
            const qComments = comments.filter(c => c.questionId === q.id);
            return formatQuestion(q, qComments);
        });

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching public questions:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a single public answered question by ID
router.get('/questions/public/:id', async (req, res) => {
    try {
        const [questions] = await pool.query(
            "SELECT * FROM fatwa_questions WHERE id = ? AND status = 'Answered'",
            [req.params.id]
        );

        if (questions.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const question = questions[0];
        const [comments] = await pool.query(
            'SELECT * FROM fatwa_comments WHERE questionId = ? ORDER BY createdAt ASC',
            [req.params.id]
        );

        res.json(formatQuestion(question, comments));
    } catch (error) {
        console.error('Error fetching question detail:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit a comment to an answered question
router.post('/questions/:id/comments', async (req, res) => {
    try {
        const { name, text } = req.body;
        if (!name || !text) {
            return res.status(400).json({ error: 'Name and text are required' });
        }

        const [questions] = await pool.query(
            "SELECT * FROM fatwa_questions WHERE id = ? AND status = 'Answered'",
            [req.params.id]
        );

        if (questions.length === 0) {
            return res.status(404).json({ error: 'Question not found or not answered' });
        }

        await pool.query(
            'INSERT INTO fatwa_comments (questionId, name, text) VALUES (?, ?, ?)',
            [req.params.id, name, text]
        );

        res.status(201).json({ message: 'Comment submitted successfully' });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- ADMIN ROUTES --- //

// Basic Auth Login
router.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'fake-jwt-token' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Simple middleware to mock auth check
const authCheck = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Get all questions (Admin)
router.get('/admin/questions', authCheck, async (req, res) => {
    try {
        const [questions] = await pool.query('SELECT * FROM fatwa_questions ORDER BY createdAt DESC');
        
        const questionIds = questions.map(q => q.id);
        let comments = [];
        if (questionIds.length > 0) {
            const [cRows] = await pool.query(
                'SELECT * FROM fatwa_comments WHERE questionId IN (?) ORDER BY createdAt ASC',
                [questionIds]
            );
            comments = cRows;
        }

        const formatted = questions.map(q => {
            const qComments = comments.filter(c => c.questionId === q.id);
            return formatQuestion(q, qComments);
        });

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching admin questions:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Answer a question (Admin)
router.put('/admin/questions/:id', authCheck, async (req, res) => {
    try {
        const { answerText } = req.body;
        await pool.query(
            "UPDATE fatwa_questions SET answerText = ?, status = 'Answered' WHERE id = ?",
            [answerText, req.params.id]
        );

        const [questions] = await pool.query('SELECT * FROM fatwa_questions WHERE id = ?', [req.params.id]);
        if (questions.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const [comments] = await pool.query('SELECT * FROM fatwa_comments WHERE questionId = ?', [req.params.id]);
        res.json(formatQuestion(questions[0], comments));
    } catch (error) {
        console.error('Error answering question:', error);
        res.status(500).json({ message: error.message });
    }
});

// Toggle urgency (Admin)
router.put('/admin/questions/:id/urgent', authCheck, async (req, res) => {
    try {
        await pool.query(
            'UPDATE fatwa_questions SET isUrgent = NOT isUrgent WHERE id = ?',
            [req.params.id]
        );

        const [questions] = await pool.query('SELECT * FROM fatwa_questions WHERE id = ?', [req.params.id]);
        if (questions.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const [comments] = await pool.query('SELECT * FROM fatwa_comments WHERE questionId = ?', [req.params.id]);
        res.json(formatQuestion(questions[0], comments));
    } catch (error) {
        console.error('Error toggling urgency:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create question as Admin
router.post('/admin/questions', authCheck, async (req, res) => {
    try {
        const { name, phone, madhhab, questionText, answerText } = req.body;
        const status = answerText ? 'Answered' : 'Pending';

        const [result] = await pool.query(
            'INSERT INTO fatwa_questions (name, phone, madhhab, questionText, answerText, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name, phone, madhhab || 'General / No Preference', questionText, answerText || '', status]
        );

        const [questions] = await pool.query('SELECT * FROM fatwa_questions WHERE id = ?', [result.insertId]);
        res.status(201).json(formatQuestion(questions[0], []));
    } catch (error) {
        console.error('Error creating admin question:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete a question (Admin)
router.delete('/admin/questions/:id', authCheck, async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM fatwa_questions WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
