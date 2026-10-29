const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// In-Memory Fast Cache with TTL
const cache = new Map();

function getCached(key) {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
        cache.delete(key);
        return null;
    }
    return item.data;
}

function setCached(key, data, ttlMs = 120000) { // 2 minutes default TTL
    cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function clearPublicCache() {
    cache.clear();
}

// Helper to format a question record with _id and comments
function formatQuestion(q, comments = []) {
    return {
        _id: q.id.toString(),
        id: q.id,
        name: q.name,
        phone: q.phone,
        madhhab: q.madhhab,
        isUrgent: Boolean(q.isUrgent),
        hasVideo: Boolean(q.hasVideo),
        videoUrl: q.videoUrl || '',
        isDownloaded: Boolean(q.isDownloaded),
        downloadedAt: q.downloadedAt || null,
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

// Get public answered questions (High Performance with Cache)
router.get('/questions/public', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0;
        const madhhab = req.query.madhhab || 'All';
        const cacheKey = `public_questions_${limit}_${madhhab}`;

        const cached = getCached(cacheKey);
        if (cached) {
            res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
            res.set('X-Cache', 'HIT');
            return res.json(cached);
        }

        let query = "SELECT * FROM fatwa_questions WHERE status = 'Answered'";
        const params = [];

        if (madhhab !== 'All') {
            query += ' AND madhhab = ?';
            params.push(madhhab);
        }

        query += ' ORDER BY createdAt DESC';

        if (limit > 0) {
            query += ' LIMIT ?';
            params.push(limit);
        }

        const [questions] = await pool.query(query, params);

        // Fetch comments for all returned questions efficiently
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

        setCached(cacheKey, formatted, 120000); // 2 minutes

        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        res.set('X-Cache', 'MISS');
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching public questions:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a single public answered question by ID (High Performance with Cache)
router.get('/questions/public/:id', async (req, res) => {
    try {
        const cacheKey = `public_question_${req.params.id}`;
        const cached = getCached(cacheKey);
        if (cached) {
            res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
            res.set('X-Cache', 'HIT');
            return res.json(cached);
        }

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

        const formatted = formatQuestion(question, comments);
        setCached(cacheKey, formatted, 120000);

        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        res.set('X-Cache', 'MISS');
        res.json(formatted);
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

        clearPublicCache();
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
    const adminUser = process.env.ADMIN_USERNAME || 'graphadmin';
    const adminPass = process.env.ADMIN_PASSWORD || 'graph951';

    if (username === adminUser && password === adminPass) {
        res.json({ success: true, token: 'graph-admin-secure-token' });
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

// Answer or update a question (Admin)
router.put('/admin/questions/:id', authCheck, async (req, res) => {
    try {
        const { questionText, name, phone, madhhab, status, answerText, hasVideo, videoUrl, isDownloaded } = req.body;
        
        const updates = [];
        const params = [];

        if (questionText !== undefined) {
            updates.push("questionText = ?");
            params.push(questionText);
        }
        if (name !== undefined) {
            updates.push("name = ?");
            params.push(name);
        }
        if (phone !== undefined) {
            updates.push("phone = ?");
            params.push(phone);
        }
        if (madhhab !== undefined) {
            updates.push("madhhab = ?");
            params.push(madhhab);
        }
        if (status !== undefined) {
            updates.push("status = ?");
            params.push(status);
        }
        if (answerText !== undefined) {
            updates.push("answerText = ?");
            params.push(answerText);
            if (!status && answerText.trim() !== '') {
                updates.push("status = 'Answered'");
            }
        }
        if (hasVideo !== undefined) {
            updates.push("hasVideo = ?");
            params.push(Boolean(hasVideo));
        }
        if (videoUrl !== undefined) {
            updates.push("videoUrl = ?");
            params.push(videoUrl);
        }
        if (isDownloaded !== undefined) {
            updates.push("isDownloaded = ?");
            params.push(Boolean(isDownloaded));
            if (isDownloaded) {
                updates.push("downloadedAt = NOW()");
            } else {
                updates.push("downloadedAt = NULL");
            }
        }

        if (updates.length > 0) {
            params.push(req.params.id);
            await pool.query(
                `UPDATE fatwa_questions SET ${updates.join(', ')} WHERE id = ?`,
                params
            );
        }

        const [questions] = await pool.query('SELECT * FROM fatwa_questions WHERE id = ?', [req.params.id]);
        if (questions.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const [comments] = await pool.query('SELECT * FROM fatwa_comments WHERE questionId = ?', [req.params.id]);
        clearPublicCache();
        res.json(formatQuestion(questions[0], comments));
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: error.message });
    }
});

// Toggle video published status (Admin)
router.put('/admin/questions/:id/video', authCheck, async (req, res) => {
    try {
        const { videoUrl, hasVideo } = req.body;
        if (hasVideo !== undefined) {
            await pool.query(
                'UPDATE fatwa_questions SET hasVideo = ?, videoUrl = COALESCE(?, videoUrl) WHERE id = ?',
                [Boolean(hasVideo), videoUrl || null, req.params.id]
            );
        } else {
            await pool.query(
                'UPDATE fatwa_questions SET hasVideo = NOT hasVideo WHERE id = ?',
                [req.params.id]
            );
        }

        const [questions] = await pool.query('SELECT * FROM fatwa_questions WHERE id = ?', [req.params.id]);
        if (questions.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const [comments] = await pool.query('SELECT * FROM fatwa_comments WHERE questionId = ?', [req.params.id]);
        clearPublicCache();
        res.json(formatQuestion(questions[0], comments));
    } catch (error) {
        console.error('Error toggling video status:', error);
        res.status(500).json({ message: error.message });
    }
});

// Toggle downloaded status (Admin)
router.put('/admin/questions/:id/downloaded', authCheck, async (req, res) => {
    try {
        const { isDownloaded } = req.body;
        if (isDownloaded !== undefined) {
            if (isDownloaded) {
                await pool.query(
                    'UPDATE fatwa_questions SET isDownloaded = TRUE, downloadedAt = NOW() WHERE id = ?',
                    [req.params.id]
                );
            } else {
                await pool.query(
                    'UPDATE fatwa_questions SET isDownloaded = FALSE, downloadedAt = NULL WHERE id = ?',
                    [req.params.id]
                );
            }
        } else {
            await pool.query(
                'UPDATE fatwa_questions SET isDownloaded = NOT isDownloaded, downloadedAt = IF(isDownloaded = FALSE, NOW(), NULL) WHERE id = ?',
                [req.params.id]
            );
        }

        const [questions] = await pool.query('SELECT * FROM fatwa_questions WHERE id = ?', [req.params.id]);
        if (questions.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const [comments] = await pool.query('SELECT * FROM fatwa_comments WHERE questionId = ?', [req.params.id]);
        clearPublicCache();
        res.json(formatQuestion(questions[0], comments));
    } catch (error) {
        console.error('Error toggling downloaded status:', error);
        res.status(500).json({ message: error.message });
    }
});

// Bulk mark questions as downloaded (Admin)
router.post('/admin/questions/mark-downloaded', authCheck, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'IDs array required' });
        }

        await pool.query(
            'UPDATE fatwa_questions SET isDownloaded = TRUE, downloadedAt = NOW() WHERE id IN (?)',
            [ids]
        );

        clearPublicCache();
        res.json({ success: true, count: ids.length });
    } catch (error) {
        console.error('Error bulk marking downloaded:', error);
        res.status(500).json({ error: 'Server error' });
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
        clearPublicCache();
        res.json(formatQuestion(questions[0], comments));
    } catch (error) {
        console.error('Error toggling urgency:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create question as Admin
router.post('/admin/questions', authCheck, async (req, res) => {
    try {
        const { name, phone, madhhab, questionText, answerText, hasVideo, videoUrl } = req.body;
        const status = answerText ? 'Answered' : 'Pending';

        const [result] = await pool.query(
            'INSERT INTO fatwa_questions (name, phone, madhhab, questionText, answerText, status, hasVideo, videoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, phone, madhhab || 'General / No Preference', questionText, answerText || '', status, Boolean(hasVideo), videoUrl || null]
        );

        const [questions] = await pool.query('SELECT * FROM fatwa_questions WHERE id = ?', [result.insertId]);
        clearPublicCache();
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

        clearPublicCache();
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
