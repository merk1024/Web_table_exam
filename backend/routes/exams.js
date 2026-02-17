const express = require('express');
const router = express.Router();
const { auth, isTeacherOrAdmin } = require('../middleware/auth');
const db = require('../config/database');

// @route   GET /api/exams
// @desc    Get all exams (filtered by user role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === 'student') {
      // Students see only their exams
      query = `
        SELECT e.*, array_agg(es.student_id) as students
        FROM exams e
        LEFT JOIN exam_students es ON e.id = es.exam_id
        WHERE es.student_id = $1
        GROUP BY e.id
        ORDER BY e.exam_date DESC
      `;
      params = [req.user.student_id];
    } else {
      // Teachers and admins see all exams
      query = `
        SELECT e.*, array_agg(es.student_id) as students
        FROM exams e
        LEFT JOIN exam_students es ON e.id = es.exam_id
        GROUP BY e.id
        ORDER BY e.exam_date DESC
      `;
      params = [];
    }

    const result = await db.query(query, params);
    
    // Get grades for each exam
    const examsWithGrades = await Promise.all(result.rows.map(async (exam) => {
      const gradesResult = await db.query(
        'SELECT student_id, grade, graded_at, comments FROM grades WHERE exam_id = $1',
        [exam.id]
      );
      
      const grades = {};
      gradesResult.rows.forEach(g => {
        grades[g.student_id] = {
          grade: g.grade,
          date: g.graded_at,
          comments: g.comments
        };
      });
      
      return { ...exam, grades };
    }));

    res.json({ exams: examsWithGrades });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/exams
// @desc    Create new exam
// @access  Private (Teacher/Admin)
router.post('/', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    const {
      groupName,
      subject,
      examDate,
      examTime,
      room,
      type,
      semester,
      students
    } = req.body;

    // Insert exam
    const examResult = await db.query(
      `INSERT INTO exams (group_name, subject, exam_date, exam_time, room, teacher_name, type, semester, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [groupName, subject, examDate, examTime, room, req.user.name, type || 'Экзамен', semester, req.user.id]
    );

    const exam = examResult.rows[0];

    // Insert students
    if (students && students.length > 0) {
      const studentValues = students.map(studentId => `(${exam.id}, '${studentId}')`).join(',');
      await db.query(`INSERT INTO exam_students (exam_id, student_id) VALUES ${studentValues}`);
    }

    res.status(201).json({
      message: 'Exam created successfully',
      exam: { ...exam, students: students || [] }
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private (Teacher/Admin)
router.put('/:id', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      groupName,
      subject,
      examDate,
      examTime,
      room,
      type
    } = req.body;

    const result = await db.query(
      `UPDATE exams 
       SET group_name = $1, subject = $2, exam_date = $3, exam_time = $4, room = $5, type = $6
       WHERE id = $7
       RETURNING *`,
      [groupName, subject, examDate, examTime, room, type, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({
      message: 'Exam updated successfully',
      exam: result.rows[0]
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam
// @access  Private (Teacher/Admin)
router.delete('/:id', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM exams WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
