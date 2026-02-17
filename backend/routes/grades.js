const express = require('express');
const router = express.Router();
const { auth, isTeacherOrAdmin } = require('../middleware/auth');
const db = require('../config/database');

// @route   POST /api/grades
// @desc    Add or update grade
// @access  Private (Teacher/Admin)
router.post('/', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    const { examId, studentId, grade, comments } = req.body;

    // Check if grade exists
    const existing = await db.query(
      'SELECT id FROM grades WHERE exam_id = $1 AND student_id = $2',
      [examId, studentId]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing grade
      result = await db.query(
        `UPDATE grades 
         SET grade = $1, comments = $2, graded_by = $3, graded_at = CURRENT_TIMESTAMP
         WHERE exam_id = $4 AND student_id = $5
         RETURNING *`,
        [grade, comments, req.user.id, examId, studentId]
      );
    } else {
      // Insert new grade
      result = await db.query(
        `INSERT INTO grades (exam_id, student_id, grade, comments, graded_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [examId, studentId, grade, comments, req.user.id]
      );
    }

    res.json({
      message: 'Grade saved successfully',
      grade: result.rows[0]
    });
  } catch (error) {
    console.error('Save grade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/grades/student/:studentId
// @desc    Get student grades
// @access  Private
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check permission
    if (req.user.role === 'student' && req.user.student_id !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `SELECT g.*, e.subject, e.exam_date, e.type, u.name as graded_by_name
       FROM grades g
       JOIN exams e ON g.exam_id = e.id
       LEFT JOIN users u ON g.graded_by = u.id
       WHERE g.student_id = $1
       ORDER BY e.exam_date DESC`,
      [studentId]
    );

    res.json({ grades: result.rows });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/grades/stats/:studentId
// @desc    Get student statistics
// @access  Private
router.get('/stats/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check permission
    if (req.user.role === 'student' && req.user.student_id !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `SELECT 
        COUNT(*) as total_exams,
        AVG(grade) as average_grade,
        MAX(grade) as highest_grade,
        MIN(grade) as lowest_grade,
        COUNT(CASE WHEN grade >= 90 THEN 1 END) as excellent_count,
        COUNT(CASE WHEN grade >= 70 AND grade < 90 THEN 1 END) as good_count,
        COUNT(CASE WHEN grade >= 50 AND grade < 70 THEN 1 END) as satisfactory_count,
        COUNT(CASE WHEN grade < 50 THEN 1 END) as fail_count
       FROM grades
       WHERE student_id = $1`,
      [studentId]
    );

    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
