const express = require('express');
const router = express.Router();
const { auth, isTeacherOrAdmin } = require('../middleware/auth');
const db = require('../config/database');

// Mark attendance
router.post('/', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    const { scheduleId, studentId, date, status } = req.body;
    const result = await db.query(
      `INSERT INTO attendance (schedule_id, student_id, date, status, marked_by) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (schedule_id, student_id, date) 
       DO UPDATE SET status = $4, marked_by = $5, marked_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [scheduleId, studentId, date, status, req.user.id]
    );
    res.json({ attendance: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get student attendance
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM attendance WHERE student_id = $1 ORDER BY date DESC',
      [req.params.studentId]
    );
    res.json({ attendance: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
