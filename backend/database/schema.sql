-- Alatoo University LMS Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS exam_students CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS schedule CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE, -- For students only (e.g., 240145121)
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    group_name VARCHAR(50), -- For students
    phone VARCHAR(50),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    credits INTEGER,
    semester VARCHAR(50),
    teacher_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course enrollments
CREATE TABLE course_enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- Exams table
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    group_name VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME NOT NULL,
    room VARCHAR(50),
    teacher_name VARCHAR(255),
    type VARCHAR(50) DEFAULT 'Экзамен',
    semester VARCHAR(50),
    max_grade INTEGER DEFAULT 100,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam students (many-to-many)
CREATE TABLE exam_students (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL,
    UNIQUE(exam_id, student_id)
);

-- Grades table
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL,
    grade INTEGER CHECK (grade >= 0 AND grade <= 100),
    graded_by INTEGER REFERENCES users(id),
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT,
    UNIQUE(exam_id, student_id)
);

-- Schedule table
CREATE TABLE schedule (
    id SERIAL PRIMARY KEY,
    day VARCHAR(20) NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    group_name VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    teacher VARCHAR(255),
    room VARCHAR(50),
    course_id INTEGER REFERENCES courses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    max_grade INTEGER DEFAULT 100,
    file_path VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignment submissions
CREATE TABLE assignment_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id),
    file_path VARCHAR(255),
    comments TEXT,
    grade INTEGER CHECK (grade >= 0 AND grade <= 100),
    graded_by INTEGER REFERENCES users(id),
    graded_at TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);

-- Announcements table
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    course_id INTEGER REFERENCES courses(id),
    created_by INTEGER REFERENCES users(id),
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES schedule(id),
    student_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by INTEGER REFERENCES users(id),
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(schedule_id, student_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_exams_date ON exams(exam_date);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_schedule_group ON schedule(group_name);
CREATE INDEX idx_assignments_due ON assignments(due_date);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
