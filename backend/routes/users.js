const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const db = require('../config/database');

// Get all users (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, role, student_id, group_name, phone, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, role, student_id, group_name, phone, avatar FROM users WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    // Users can only update their own profile (unless admin)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, phone, avatar } = req.body;
    
    const result = await db.query(
      'UPDATE users SET name = $1, phone = $2, avatar = $3 WHERE id = $4 RETURNING id, name, phone, avatar',
      [name, phone, avatar, req.params.id]
    );
    
    res.json({ message: 'Profile updated', user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
