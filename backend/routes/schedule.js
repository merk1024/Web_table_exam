const express = require('express');
const router = express.Router();
const { auth, isTeacherOrAdmin } = require('../middleware/auth');
const db = require('../config/database');

// Get schedule
router.get('/', auth, async (req, res) => {
  try {
    let query = 'SELECT * FROM schedule ORDER BY day, time_slot';
    let params = [];

    if (req.user.role === 'student') {
      query = 'SELECT * FROM schedule WHERE group_name = $1 ORDER BY day, time_slot';
      params = [req.user.group_name];
    }

    const result = await db.query(query, params);
    res.json({ schedule: result.rows });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create schedule entry
router.post('/', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    const { day, timeSlot, groupName, subject, teacher, room } = req.body;
    
    const result = await db.query(
      'INSERT INTO schedule (day, time_slot, group_name, subject, teacher, room) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [day, timeSlot, groupName, subject, teacher, room]
    );
    
    res.status(201).json({ message: 'Schedule created', schedule: result.rows[0] });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update schedule entry
router.put('/:id', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    const { day, timeSlot, groupName, subject, teacher, room } = req.body;
    
    const result = await db.query(
      'UPDATE schedule SET day = $1, time_slot = $2, group_name = $3, subject = $4, teacher = $5, room = $6 WHERE id = $7 RETURNING *',
      [day, timeSlot, groupName, subject, teacher, room, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ message: 'Schedule updated', schedule: result.rows[0] });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete schedule entry
router.delete('/:id', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM schedule WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
