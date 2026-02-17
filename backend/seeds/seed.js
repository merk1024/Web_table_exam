const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const studentPass = await bcrypt.hash('1234', salt);
    const teacherPass = await bcrypt.hash('5678', salt);
    const adminPass = await bcrypt.hash('admin', salt);

    // Insert users
    console.log('👥 Creating users...');
    await db.query(`
      INSERT INTO users (student_id, email, password, name, role, group_name, phone, avatar) VALUES
      ('240145121', 'azamat@alatoo.edu.kg', $1, 'Азамат Студентов', 'student', 'COMSE-25', '+996555123456', '👨‍🎓'),
      ('240145122', 'aizhan@alatoo.edu.kg', $1, 'Айжан Студенткина', 'student', 'COMSE-25', '+996555123457', '👩‍🎓'),
      (NULL, 'maria@alatoo.edu.kg', $2, 'Мария Преподавателева', 'teacher', NULL, '+996555123458', '👩‍🏫'),
      (NULL, 'admin@alatoo.edu.kg', $3, 'Админ Системы', 'admin', NULL, '+996555123459', '👨‍💼')
      ON CONFLICT (email) DO NOTHING
    `, [studentPass, teacherPass, adminPass]);

    // Insert exams
    console.log('📝 Creating exams...');
    await db.query(`
      INSERT INTO exams (group_name, subject, exam_date, exam_time, room, teacher_name, type, semester, created_by) VALUES
      ('COMSE-25', 'Programming Language 2', '2026-02-20', '10:00', 'BIGLAB', 'Azhar Kazakbaeva', 'Экзамен', 'Spring 2025-2026', 3),
      ('COMSE-25', 'Calculus 2', '2026-02-25', '14:00', 'B107', 'Hussien Chebsi', 'Экзамен', 'Spring 2025-2026', 3),
      ('COMSE-25', 'Data Structures', '2026-03-05', '09:00', 'A201', 'Azhar Kazakbaeva', 'Экзамен', 'Spring 2025-2026', 3),
      ('COMSE-25', 'Web Development', '2026-03-10', '11:00', 'B205', 'Мария Преподавателева', 'Зачёт', 'Spring 2025-2026', 3)
    `);

    // Link students to exams
    console.log('🔗 Linking students to exams...');
    await db.query(`
      INSERT INTO exam_students (exam_id, student_id) VALUES
      (1, '240145121'), (1, '240145122'),
      (2, '240145121'), (2, '240145122'),
      (3, '240145121'), (3, '240145122'),
      (4, '240145121'), (4, '240145122')
    `);

    // Insert grades
    console.log('📊 Creating grades...');
    await db.query(`
      INSERT INTO grades (exam_id, student_id, grade, graded_by) VALUES
      (1, '240145121', 85, 3),
      (1, '240145122', 78, 3),
      (2, '240145121', 92, 3),
      (2, '240145122', 88, 3),
      (3, '240145121', 78, 3),
      (3, '240145122', 95, 3)
    `);

    // Insert schedule
    console.log('📅 Creating schedule...');
    await db.query(`
      INSERT INTO schedule (day, time_slot, group_name, subject, teacher, room) VALUES
      ('Понедельник', '09:00', 'COMSE-25', 'Programming Language 2', 'Azhar Kazakbaeva', 'BIGLAB'),
      ('Понедельник', '11:00', 'COMSE-25', 'Calculus 2', 'Hussien Chebsi', 'B107'),
      ('Вторник', '09:00', 'COMSE-25', 'Data Structures', 'Azhar Kazakbaeva', 'A201'),
      ('Вторник', '14:00', 'COMSE-25', 'Web Development', 'Мария Преподавателева', 'B205'),
      ('Среда', '10:00', 'COMSE-25', 'Algorithms', 'John Smith', 'A105'),
      ('Четверг', '09:00', 'COMSE-25', 'Databases', 'Maria Johnson', 'B301')
    `);

    // Insert announcements
    console.log('📢 Creating announcements...');
    await db.query(`
      INSERT INTO announcements (title, content, type, is_pinned, created_by) VALUES
      ('Добро пожаловать!', 'Добро пожаловать в систему управления обучением Alatoo University. Здесь вы можете следить за своими оценками, расписанием и заданиями.', 'general', true, 4),
      ('Изменение расписания', 'Внимание! Занятие по Programming Language 2 в понедельник перенесено с 9:00 на 10:00.', 'important', false, 3),
      ('Экзаменационная сессия', 'Экзаменационная сессия начнется 20 февраля 2026. Не забудьте подготовиться!', 'exam', true, 4)
    `);

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📝 Test accounts:');
    console.log('   Student 1: azamat@alatoo.edu.kg / 1234');
    console.log('   Student 2: aizhan@alatoo.edu.kg / 1234');
    console.log('   Teacher:   maria@alatoo.edu.kg / 5678');
    console.log('   Admin:     admin@alatoo.edu.kg / admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
