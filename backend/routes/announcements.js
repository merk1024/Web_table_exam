const express = require('express');
const router = express.Router();
const { auth, isTeacherOrAdmin } = require('../middleware/auth');
const db = require('../config/database');

// Get announcements
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, u.name as author_name 
       FROM announcements a
       JOIN users u ON a.created_by = u.id
       ORDER BY a.is_pinned DESC, a.created_at DESC
       LIMIT 50`
    );
    res.json({ announcements: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create announcement
router.post('/', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    const { title, content, type, isPinned } = req.body;
    const result = await db.query(
      'INSERT INTO announcements (title, content, type, is_pinned, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content, type || 'general', isPinned || false, req.user.id]
    );
    res.status(201).json({ announcement: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete announcement
router.delete('/:id', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
