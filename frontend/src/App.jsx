import { useState, useEffect } from 'react';
import './App.css';
import ScheduleManager from './ScheduleManager';
import CoursesPage from './CoursesPage';
import './CoursesPage.css';



// USERS DATABASE с ID студентов
const USERS_DB = [
  { 
    id: 1, 
    studentId: '240145121',
    name: 'Азамат Студентов', 
    role: 'student', 
    login: 'student', 
    password: '1234', 
    group: 'COMSE-25',
    email: 'azamat.studentov@alatoo.edu.kg',
    phone: '+996 555 123 456',
    avatar: '👨‍🎓'
  },
  { 
    id: 2, 
    studentId: '240145122',
    name: 'Айжан Студенткина', 
    role: 'student', 
    login: 'student2', 
    password: '1234', 
    group: 'COMSE-25',
    email: 'aizhan.studentkina@alatoo.edu.kg',
    phone: '+996 555 123 457',
    avatar: '👩‍🎓'
  },
  { 
    id: 3, 
    name: 'Мария Преподавателева', 
    role: 'teacher', 
    login: 'teacher', 
    password: '5678',
    email: 'maria.teacher@alatoo.edu.kg',
    avatar: '👩‍🏫'
  },
  { 
    id: 4, 
    name: 'Админ Системы', 
    role: 'admin', 
    login: 'admin', 
    password: 'admin',
    email: 'admin@alatoo.edu.kg',
    avatar: '👨‍💼'
  },
];

// Расширенные начальные экзамены
const INITIAL_EXAMS = [
  { 
    id: 1, 
    group: 'COMSE-25', 
    subject: 'Programming Language 2', 
    date: '2026-02-20', 
    time: '10:00',
    room: 'BIGLAB',
    teacher: 'Azhar Kazakbaeva', 
    type: 'Экзамен',
    semester: 'Spring 2025-2026',
    maxGrade: 100,
    students: ['240145121', '240145122'],
    grades: { 
      '240145121': { grade: '85', date: '2026-02-20', teacher: 'Azhar Kazakbaeva' },
      '240145122': { grade: '78', date: '2026-02-20', teacher: 'Azhar Kazakbaeva' }
    }
  },
  { 
    id: 2, 
    group: 'COMSE-25', 
    subject: 'Calculus 2', 
    date: '2026-02-25', 
    time: '14:00',
    room: 'B107',
    teacher: 'Hussien Chebsi', 
    type: 'Экзамен',
    semester: 'Spring 2025-2026',
    maxGrade: 100,
    students: ['240145121', '240145122'],
    grades: { 
      '240145121': { grade: '92', date: '2026-02-25', teacher: 'Hussien Chebsi' },
      '240145122': { grade: '88', date: '2026-02-25', teacher: 'Hussien Chebsi' }
    }
  },
  { 
    id: 3, 
    group: 'COMSE-25', 
    subject: 'Data Structures', 
    date: '2026-03-05', 
    time: '09:00',
    room: 'A201',
    teacher: 'Azhar Kazakbaeva', 
    type: 'Экзамен',
    semester: 'Spring 2025-2026',
    maxGrade: 100,
    students: ['240145121', '240145122'],
    grades: { 
      '240145121': { grade: '78', date: '2026-03-05', teacher: 'Azhar Kazakbaeva' },
      '240145122': { grade: '95', date: '2026-03-05', teacher: 'Azhar Kazakbaeva' }
    }
  },
  { 
    id: 4, 
    group: 'COMSE-25', 
    subject: 'Web Development', 
    date: '2026-03-10', 
    time: '11:00',
    room: 'B205',
    teacher: 'Мария Преподавателева', 
    type: 'Зачёт',
    semester: 'Spring 2025-2026',
    maxGrade: 100,
    students: ['240145121', '240145122'],
    grades: { 
      '240145121': { grade: '90', date: '2026-03-10', teacher: 'Мария Преподавателева' }
    }
  },
];

// Реальные временные слоты
const TIME_SLOTS = [
  { hour: '1st Hour', time: '08:00-08:40', start: '08:00' },
  { hour: '2nd Hour', time: '08:45-09:25', start: '08:45' },
  { hour: '3rd Hour', time: '09:30-10:10', start: '09:30' },
  { hour: '4th Hour', time: '10:15-10:55', start: '10:15' },
  { hour: '5th Hour', time: '11:00-11:40', start: '11:00' },
  { hour: '6th Hour', time: '11:45-12:25', start: '11:45' },
  { hour: '7th Hour', time: '12:30-13:10', start: '12:30' },
  { hour: '8th Hour', time: '13:15-13:55', start: '13:15' },
  { hour: '9th Hour', time: '14:00-14:40', start: '14:00' },
  { hour: '10th Hour', time: '14:45-15:25', start: '14:45' },
  { hour: '11th Hour', time: '15:30-16:10', start: '15:30' },
  { hour: '12th Hour', time: '16:15-16:55', start: '16:15' },
  { hour: '13th Hour', time: '17:00-17:40', start: '17:00' },
  { hour: '14th Hour', time: '17:45-18:25', start: '17:45' },
];

const WEEKDAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

// Toast компонент
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type} toast-enter`}>
      <span className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'info' && 'ℹ'}
        {type === 'warning' && '⚠'}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}

// Календарь
function Calendar({ exams, onDateClick, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  
  const getExamsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return exams.filter(exam => exam.date === dateStr);
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day calendar-day-empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayExams = getExamsForDate(day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    days.push(
      <div 
        key={day} 
        className={`calendar-day ${isToday(day) ? 'calendar-day-today' : ''} ${isSelected(day) ? 'calendar-day-selected' : ''} ${dayExams.length > 0 ? 'calendar-day-has-exam' : ''}`}
        onClick={() => onDateClick(dateStr)}
      >
        <div className="calendar-day-number">{day}</div>
        {dayExams.length > 0 && (
          <div className="calendar-day-dots">
            {dayExams.slice(0, 3).map((exam, idx) => (
              <div key={idx} className="calendar-day-dot" title={exam.subject}></div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>◄</button>
        <h3 className="calendar-month-title">{monthNames[month]} {year}</h3>
        <button className="calendar-nav-btn" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>►</button>
      </div>
      <div className="calendar-weekdays">
        {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">{days}</div>
    </div>
  );
}

// Улучшенный график оценок
function GradesChart({ exams, studentId }) {
  const gradesData = exams
    .filter(exam => exam.grades && exam.grades[studentId])
    .map(exam => ({
      subject: exam.subject,
      grade: Number(exam.grades[studentId].grade),
      date: exam.date,
      type: exam.type
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (gradesData.length === 0) {
    return (
      <div className="empty-state">
        <p>📊 Нет оценок для отображения</p>
      </div>
    );
  }

  const avgGrade = (gradesData.reduce((sum, d) => sum + d.grade, 0) / gradesData.length).toFixed(1);
  const highestGrade = Math.max(...gradesData.map(d => d.grade));
  const lowestGrade = Math.min(...gradesData.map(d => d.grade));

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>📊 Динамика оценок</h3>
        <div className="chart-stats">
          <div className="chart-stat-item">
            <span className="chart-stat-label">Средний:</span>
            <span className="chart-stat-value">{avgGrade}</span>
          </div>
          <div className="chart-stat-item">
            <span className="chart-stat-label">Макс:</span>
            <span className="chart-stat-value success">{highestGrade}</span>
          </div>
          <div className="chart-stat-item">
            <span className="chart-stat-label">Мин:</span>
            <span className="chart-stat-value danger">{lowestGrade}</span>
          </div>
        </div>
      </div>
      <div className="chart-content">
        <div className="chart-bars">
          {gradesData.map((data, idx) => {
            let barClass = 'chart-bar';
            if (data.grade >= 90) barClass += ' chart-bar-excellent';
            else if (data.grade >= 70) barClass += ' chart-bar-good';
            else if (data.grade >= 50) barClass += ' chart-bar-pass';
            else barClass += ' chart-bar-fail';

            return (
              <div key={idx} className="chart-bar-container">
                <div 
                  className={barClass}
                  style={{ height: `${data.grade}%` }}
                  title={`${data.subject}: ${data.grade}`}
                >
                  <div className="chart-bar-value">{data.grade}</div>
                </div>
                <div className="chart-bar-label">{data.subject.substring(0, 10)}</div>
                <div className="chart-bar-type">{data.type}</div>
              </div>
            );
          })}
        </div>
        <div className="chart-legend">
          <div className="chart-legend-item">
            <div className="chart-legend-color chart-legend-excellent"></div>
            <span>Отлично (90-100)</span>
          </div>
          <div className="chart-legend-item">
            <div className="chart-legend-color chart-legend-good"></div>
            <span>Хорошо (70-89)</span>
          </div>
          <div className="chart-legend-item">
            <div className="chart-legend-color chart-legend-pass"></div>
            <span>Удовл. (50-69)</span>
          </div>
          <div className="chart-legend-item">
            <div className="chart-legend-color chart-legend-fail"></div>
            <span>Неуд. (&lt;50)</span>
          </div>
        </div>
      </div>
    </div>
  );
}


// Студенческий профиль
function StudentProfile({ user, exams }) {
  const studentExams = exams.filter(exam => exam.students?.includes(user.studentId));
  const completedExams = studentExams.filter(exam => exam.grades && exam.grades[user.studentId]);
  
  const grades = completedExams.map(exam => Number(exam.grades[user.studentId].grade));
  const avgGrade = grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1) : 0;
  
  const excellentCount = grades.filter(g => g >= 90).length;
  const goodCount = grades.filter(g => g >= 70 && g < 90).length;
  
  return (
    <div className="student-profile">
      <div className="profile-header">
        <div className="profile-avatar">{user.avatar}</div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <div className="profile-meta">
            <span className="profile-id">🎫 ID: {user.studentId}</span>
            <span className="profile-group">📚 {user.group}</span>
          </div>
          <div className="profile-contacts">
            <span>📧 {user.email}</span>
            <span>📱 {user.phone}</span>
          </div>
        </div>
        <div className="profile-qr">
          <div className="qr-code">
            <div className="qr-placeholder">QR</div>
          </div>
          <span className="qr-label">Студ. билет</span>
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="profile-stat-card">
          <div className="profile-stat-icon">📊</div>
          <div className="profile-stat-content">
            <div className="profile-stat-value">{avgGrade}</div>
            <div className="profile-stat-label">Средний балл</div>
          </div>
        </div>
        
        <div className="profile-stat-card">
          <div className="profile-stat-icon">🎯</div>
          <div className="profile-stat-content">
            <div className="profile-stat-value">{completedExams.length}/{studentExams.length}</div>
            <div className="profile-stat-label">Сдано экзаменов</div>
          </div>
        </div>
        
        <div className="profile-stat-card">
          <div className="profile-stat-icon">🏆</div>
          <div className="profile-stat-content">
            <div className="profile-stat-value">{excellentCount}</div>
            <div className="profile-stat-label">Отлично</div>
          </div>
        </div>
        
        <div className="profile-stat-card">
          <div className="profile-stat-icon">⭐</div>
          <div className="profile-stat-content">
            <div className="profile-stat-value">{goodCount}</div>
            <div className="profile-stat-label">Хорошо</div>
          </div>
        </div>
      </div>
      
      {avgGrade >= 90 && (
        <div className="profile-achievements">
          <h3>🏅 Достижения</h3>
          <div className="achievement-badges">
            <div className="achievement-badge">
              <div className="badge-icon">🌟</div>
              <div className="badge-name">Отличник</div>
            </div>
            {excellentCount >= 3 && (
              <div className="achievement-badge">
                <div className="badge-icon">🔥</div>
                <div className="badge-name">Эксперт</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Рейтинг студентов (для преподавателей)
function StudentsRanking({ exams }) {
  const studentStats = {};
  
  exams.forEach(exam => {
    Object.entries(exam.grades || {}).forEach(([studentId, gradeInfo]) => {
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          studentId,
          grades: [],
          totalGrade: 0,
          count: 0
        };
      }
      const grade = Number(gradeInfo.grade);
      studentStats[studentId].grades.push(grade);
      studentStats[studentId].totalGrade += grade;
      studentStats[studentId].count += 1;
    });
  });
  
  const ranking = Object.values(studentStats)
    .map(stat => ({
      ...stat,
      avgGrade: (stat.totalGrade / stat.count).toFixed(1)
    }))
    .sort((a, b) => b.avgGrade - a.avgGrade);
  
  if (ranking.length === 0) {
    return (
      <div className="empty-state">
        <p>📊 Нет данных для рейтинга</p>
      </div>
    );
  }
  
  return (
    <div className="ranking-container">
      <h3>🏆 Рейтинг студентов</h3>
      <div className="ranking-list">
        {ranking.map((student, idx) => {
          const user = USERS_DB.find(u => u.studentId === student.studentId);
          return (
            <div key={student.studentId} className="ranking-item">
              <div className="ranking-position">
                {idx === 0 && '🥇'}
                {idx === 1 && '🥈'}
                {idx === 2 && '🥉'}
                {idx > 2 && `#${idx + 1}`}
              </div>
              <div className="ranking-avatar">{user?.avatar || '👤'}</div>
              <div className="ranking-info">
                <div className="ranking-name">{user?.name || student.studentId}</div>
                <div className="ranking-meta">ID: {student.studentId} • {student.count} экзаменов</div>
              </div>
              <div className="ranking-grade">{student.avgGrade}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function App() {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterDay, setFilterDay] = useState('all');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(null);
  const [toasts, setToasts] = useState([]);
  
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    id: null,
    day: 'Понедельник',
    timeSlot: TIME_SLOTS[0].start,
    group: '',
    subject: '',
    teacher: '',
    room: '',
  });

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.dataset.theme = savedTheme;

    const savedExams = localStorage.getItem('exams_db');
    if (savedExams) {
      try {
        setExams(JSON.parse(savedExams));
      } catch (e) {
        setExams(INITIAL_EXAMS);
        localStorage.setItem('exams_db', JSON.stringify(INITIAL_EXAMS));
      }
    } else {
      setExams(INITIAL_EXAMS);
      localStorage.setItem('exams_db', JSON.stringify(INITIAL_EXAMS));
    }

    const savedSchedule = localStorage.getItem('schedule_db');
    if (savedSchedule) {
      try {
        setSchedule(JSON.parse(savedSchedule));
      } catch (e) {
        setSchedule([]);
      }
    }
  }, []);

  useEffect(() => {
    if (exams.length > 0) {
      localStorage.setItem('exams_db', JSON.stringify(exams));
    }
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('schedule_db', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [form, setForm] = useState({
    group: '',
    subject: '',
    date: '',
    time: '',
    room: '',
    type: 'Экзамен',
    semester: 'Spring 2025-2026',
    students: '',
  });

  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowConfirm(false);
        setDeleteTarget(null);
        setShowScheduleForm(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = USERS_DB.find(
      u => u.login === loginForm.login && u.password === loginForm.password
    );
    if (foundUser) {
      setUser(foundUser);
      setLoginError('');
      showToast(`Добро пожаловать, ${foundUser.name}!`, 'success');
    } else {
      setLoginError('❌ Неверный логин или пароль');
      showToast('Неверный логин или пароль', 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLoginForm({ login: '', password: '' });
    setActiveTab('profile');
    showToast('Вы вышли из системы', 'info');
  };

  const addExam = (e) => {
    e.preventDefault();
    const studentIds = form.students.split(',').map(s => s.trim()).filter(Boolean);
    const newExam = {
      id: Date.now(),
      group: form.group,
      subject: form.subject,
      date: form.date,
      time: form.time,
      room: form.room,
      teacher: user.name,
      type: form.type,
      semester: form.semester,
      maxGrade: 100,
      students: studentIds,
      grades: {}
    };
    setExams([...exams, newExam]);
    setForm({
      group: '',
      subject: '',
      date: '',
      time: '',
      room: '',
      type: 'Экзамен',
      semester: 'Spring 2025-2026',
      students: '',
    });
    showToast(`Экзамен "${newExam.subject}" добавлен`, 'success');
  };

  const handleExamEdit = (id, field, value) => {
    setExams(exams.map(exam => 
      exam.id === id ? { ...exam, [field]: value } : exam
    ));
  };

  const handleGradeChange = (examId, studentId, grade) => {
    setExams(exams.map(exam => {
      if (exam.id === examId) {
        return {
          ...exam,
          grades: { 
            ...exam.grades, 
            [studentId]: {
              grade: grade,
              date: new Date().toISOString().split('T')[0],
              teacher: user.name
            }
          }
        };
      }
      return exam;
    }));
    showToast('Оценка обновлена', 'success');
  };

  const addScheduleClass = (e) => {
    e.preventDefault();
    
    if (scheduleForm.id) {
      setSchedule(schedule.map(cls => 
        cls.id === scheduleForm.id ? { ...scheduleForm } : cls
      ));
      showToast('Занятие обновлено', 'success');
    } else {
      const newClass = {
        ...scheduleForm,
        id: Date.now()
      };
      setSchedule([...schedule, newClass]);
      showToast('Занятие добавлено', 'success');
    }
    
    setScheduleForm({
      id: null,
      day: 'Понедельник',
      timeSlot: TIME_SLOTS[0].start,
      group: '',
      subject: '',
      teacher: '',
      room: '',
    });
    setShowScheduleForm(false);
  };

  const deleteScheduleClass = (id) => {
    setSchedule(schedule.filter(cls => cls.id !== id));
    showToast('Занятие удалено', 'info');
  };

  const allGroups = [...new Set(exams.map(e => e.group))];
  const scheduleGroups = [...new Set(schedule.map(s => s.group))];
  const allScheduleGroups = user?.role === 'student' 
    ? [user.group] 
    : scheduleGroups.length > 0 
      ? scheduleGroups 
      : ['COMSE-25', 'COMSE-26', 'COMSE-27'];

  const filteredExams = exams.filter(exam => {
    if (!user) return false;
    
    let groupMatch, searchMatch;
    
    if (user.role === 'student') {
      groupMatch = exam.students?.includes(user.studentId);
    } else {
      groupMatch = filterGroup === 'all' ? true : exam.group === filterGroup;
    }
    
    searchMatch = exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  exam.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (searchQuery && exam.students?.some(id => id.includes(searchQuery)));
                        
    const dateMatch = selectedDate ? exam.date === selectedDate : true;
    return groupMatch && searchMatch && dateMatch;
  });

  const mySchedule = user ? schedule.filter(cls => cls.group === user.group) : [];
  const filteredSchedule = schedule.filter(cls => {
    const groupMatch = filterGroup === 'all' ? true : cls.group === filterGroup;
    const dayMatch = filterDay === 'all' ? true : cls.day === filterDay;
    return groupMatch && dayMatch;
  });

  const exportToCSV = () => {
    const headers = ['Группа', 'Предмет', 'Дата', 'Время', 'Аудитория', 'Тип', 'Преподаватель'];
    const rows = filteredExams.map(e => [
      e.group, e.subject, e.date, e.time, e.room, e.type, e.teacher
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exams.csv';
    a.click();
    showToast('Экзамены экспортированы', 'success');
  };

  const exportScheduleToCSV = () => {
    const headers = ['День', 'Время', 'Группа', 'Предмет', 'Преподаватель', 'Аудитория'];
    const rows = (user.role === 'student' ? mySchedule : filteredSchedule).map(c => [
      c.day, c.timeSlot, c.group, c.subject, c.teacher, c.room
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.csv';
    a.click();
    showToast('Расписание экспортировано', 'success');
  };

  const upcomingExams = user ? filteredExams.filter(e => new Date(e.date) >= new Date()).length : 0;
  const passedExams = user?.role === 'student' 
    ? filteredExams.filter(e => e.grades && e.grades[user.studentId]).length 
    : 0;
    
  const avgGrade = user?.role === 'student' && passedExams > 0
    ? (filteredExams.reduce((sum, e) => {
        if (e.grades && e.grades[user.studentId]) {
          return sum + Number(e.grades[user.studentId].grade);
        }
        return sum;
      }, 0) / passedExams).toFixed(1)
    : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const examToday = user ? filteredExams.find(e => e.date === todayStr) : null;

  const getClassForCell = (day, timeSlot, group) => {
    return schedule.find(cls => 
      cls.day === day && cls.timeSlot === timeSlot && cls.group === group
    );
  };

  const getTimeSlotDisplay = (timeSlot) => {
    const slot = TIME_SLOTS.find(s => s.start === timeSlot);
    return slot ? slot.time : timeSlot;
  };

  const getStudentName = (studentId) => {
    const student = USERS_DB.find(u => u.studentId === studentId);
    return student ? student.name : studentId;
  };

  if (!user) {
    return (
      <div className="container login-container">
        <div className="login-header">
          <h1>🎓 Alatoo University</h1>
          <p>Система управления экзаменами и расписанием</p>
        </div>

        <div className="info-box">
          <h3>📝 Демо аккаунты:</h3>
          <div className="accounts-list">
            {USERS_DB.map(acc => (
              <div key={acc.id} className="account-item">
                <div className="account-header">
                  <div className="account-avatar-small">{acc.avatar}</div>
                  <div>
                    <span className="account-name">{acc.name}</span>
                    <span className="account-role">{acc.role}</span>
                  </div>
                </div>
                {acc.studentId && <div className="account-id">ID: {acc.studentId}</div>}
                <div className="account-creds">
                  <span>Логин: <code>{acc.login}</code></span>
                  <span>Пароль: <code>{acc.password}</code></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <input 
            type="text"
            placeholder="Логин"
            value={loginForm.login}
            onChange={e => setLoginForm({...loginForm, login: e.target.value})}
            required
          />
          <input 
            type="password"
            placeholder="Пароль"
            value={loginForm.password}
            onChange={e => setLoginForm({...loginForm, password: e.target.value})}
            required
          />
          <button type="submit">Войти</button>
          {loginError && <p className="login-error">{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <div>
          <h1>🎓 Alatoo University</h1>
          <p className="user-info">
            <span className="user-avatar">{user.avatar}</span>
            {user.name} <span className="role-badge">{user.role}</span>
            {user.studentId && <span className="student-id-badge">ID: {user.studentId}</span>}
            {user.group && <span> • {user.group}</span>}
          </p>
        </div>
        <div className="header-actions">
          <button className="theme-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>Выйти</button>
        </div>
      </header>

      <div className="tabs">
  <button className={`tab ${activeTab==='profile'?'tab-active':''}`} onClick={()=>setActiveTab('profile')}>👤 Профиль</button>
  <button className={`tab ${activeTab==='exams'?'tab-active':''}`} onClick={()=>setActiveTab('exams')}>📝 Экзамены</button>
  <button className={`tab ${activeTab==='schedule'?'tab-active':''}`} onClick={()=>setActiveTab('schedule')}>📅 Расписание</button>
  <button className={`tab ${activeTab==='courses'?'tab-active':''}`} onClick={()=>setActiveTab('courses')}>📚 Courses</button>
</div>


      <main>
        {/* ПРОФИЛЬ СТУДЕНТА */}
        {activeTab === 'profile' && user.role === 'student' && (
          <>
            <StudentProfile user={user} exams={exams} />
            
            <section className="stats-section">
              <h2>📊 Статистика</h2>
              <div className="stats-grid">
                <div className="stat-card animate-in">
                  <div className="stat-label">Предстоящие экзамены</div>
                  <div className="stat-value">{upcomingExams}</div>
                </div>
                <div className="stat-card animate-in" style={{animationDelay: '0.1s'}}>
                  <div className="stat-label">Сданные экзамены</div>
                  <div className="stat-value">{passedExams}</div>
                </div>
                <div className="stat-card animate-in" style={{animationDelay: '0.2s'}}>
                  <div className="stat-label">Средний балл</div>
                  <div className="stat-value">{avgGrade}</div>
                </div>
              </div>
            </section>
            {activeTab === 'courses' && <CoursesPage user={user} />}
            <GradesChart exams={filteredExams} studentId={user.studentId} />
            {activeTab === 'schedule' && (
            <ScheduleManager userRole={user?.role} />)}
            {activeTab === 'courses' && (<CoursesPage user={user} />)}
          </>
        )}

        {/* ЭКЗАМЕНЫ */}
        {activeTab === 'exams' && (
          <>
            {user.role !== 'student' && (
              <section>
                <h2>➕ Добавить экзамен</h2>
                <form onSubmit={addExam} className="add-form">
                  <input placeholder="Группа" value={form.group} onChange={e => setForm({...form, group: e.target.value})} required />
                  <input placeholder="Предмет" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                  <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
                  <input placeholder="Аудитория" value={form.room} onChange={e => setForm({...form, room: e.target.value})} required />
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="Экзамен">Экзамен</option>
                    <option value="Зачёт">Зачёт</option>
                    <option value="Курсовая">Курсовая</option>
                  </select>
                  <input 
                    placeholder="ID студентов (через запятую)" 
                    value={form.students} 
                    onChange={e => setForm({...form, students: e.target.value})} 
                  />
                  <button type="submit">Добавить</button>
                </form>
              </section>
            )}

            <section>
              <div className="section-header">
                <h2>{user.role === 'student' ? '📝 Мои экзамены' : '📋 Управление экзаменами'}</h2>
                <div className="section-actions">
                  {user.role === 'student' && (
                    <div className="view-switcher">
                      <button 
                        className={`view-btn ${viewMode === 'list' ? 'view-btn-active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="Список"
                      >
                        📋
                      </button>
                      <button 
                        className={`view-btn ${viewMode === 'calendar' ? 'view-btn-active' : ''}`}
                        onClick={() => setViewMode('calendar')}
                        title="Календарь"
                      >
                        📅
                      </button>
                    </div>
                  )}
                  {viewMode === 'list' && (
                    <>
                      <input 
                        type="text"
                        placeholder="🔍 Поиск по предмету, преподавателю или ID..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                      {user.role !== 'student' && (
                        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="filter-select">
                          <option value="all">Все группы</option>
                          {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      )}
                      <button onClick={exportToCSV}>💾 Экспорт</button>
                    </>
                  )}
                  {selectedDate && (
                    <button onClick={() => setSelectedDate(null)} className="btn-secondary">
                      Сбросить дату
                    </button>
                  )}
                </div>
              </div>

              {viewMode === 'calendar' && user.role === 'student' && (
                <Calendar 
                  exams={filteredExams} 
                  onDateClick={setSelectedDate}
                  selectedDate={selectedDate}
                />
              )}

              {(viewMode === 'list' || user.role !== 'student') && (
                <>
                  {examToday && user.role === 'student' && (
                    <div className="exam-today-alert animate-in">
                      ⚠️ Сегодня экзамен: <strong>{examToday.subject}</strong> в {examToday.time}, аудитория {examToday.room}
                    </div>
                  )}
                  
                  {selectedDate && (
                    <div className="date-filter-info">
                      📅 Показаны экзамены на: <strong>{new Date(selectedDate).toLocaleDateString('ru-RU')}</strong>
                    </div>
                  )}

                  {filteredExams.length === 0 ? (
                    <div className="empty-state">
                      <p>📭 {selectedDate ? 'Нет экзаменов на выбранную дату' : 'Нет назначенных экзаменов'}</p>
                    </div>
                  ) : user.role === 'student' ? (
                    <div className="cards">
                      {filteredExams
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((exam, idx) => {
                          const isUpcoming = new Date(exam.date) >= new Date();
                          const myGrade = exam.grades[user.studentId];
                          return (
                            <div key={exam.id} className="card-exam animate-in" style={{animationDelay: `${idx * 0.05}s`}}>
                              <div className="card-row">
                                <h3 className="card-title">{exam.subject}</h3>
                                {isUpcoming && <span className="badge-upcoming">Скоро</span>}
                              </div>
                              <p className="card-meta">
                                <span className="badge-type">{exam.type}</span>
                              </p>
                              <p className="card-date">📅 {new Date(exam.date).toLocaleDateString('ru-RU')} • ⏰ {exam.time}</p>
                              <p className="card-meta">📍 {exam.room}</p>
                              <p className="card-teacher">👨‍🏫 {exam.teacher}</p>
                              {myGrade && (
                                <div className={`card-grade ${Number(myGrade.grade) >= 50 ? 'card-grade-pass' : 'card-grade-fail'}`}>
                                  Оценка: {myGrade.grade} / 100
                                  <div className="grade-date">Дата: {new Date(myGrade.date).toLocaleDateString('ru-RU')}</div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Группа</th>
                            <th>Предмет</th>
                            <th>Дата</th>
                            <th>Время</th>
                            <th>Аудитория</th>
                            <th>Тип</th>
                            <th>Студенты</th>
                            <th>Оценки</th>
                            <th>Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredExams.map(exam => (
                            <tr key={exam.id}>
                              <td><input value={exam.group} onChange={e => handleExamEdit(exam.id, 'group', e.target.value)} /></td>
                              <td><input value={exam.subject} onChange={e => handleExamEdit(exam.id, 'subject', e.target.value)} style={{minWidth: '150px'}} /></td>
                              <td><input type="date" value={exam.date} onChange={e => handleExamEdit(exam.id, 'date', e.target.value)} /></td>
                              <td><input type="time" value={exam.time} onChange={e => handleExamEdit(exam.id, 'time', e.target.value)} /></td>
                              <td><input value={exam.room} onChange={e => handleExamEdit(exam.id, 'room', e.target.value)} /></td>
                              <td>
                                <select value={exam.type} onChange={e => handleExamEdit(exam.id, 'type', e.target.value)}>
                                  <option value="Экзамен">Экзамен</option>
                                  <option value="Зачёт">Зачёт</option>
                                  <option value="Курсовая">Курсовая</option>
                                </select>
                              </td>
                              <td>
                                <div className="students-list">
                                  {exam.students?.map(studentId => (
                                    <div key={studentId} className="student-chip">
                                      {getStudentName(studentId)}
                                      <span className="student-chip-id">{studentId}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <div className="grades-cell">
                                  {exam.students?.map(studentId => (
                                    <div key={studentId} className="grade-input-row">
                                      <span title={studentId}>{getStudentName(studentId).substring(0, 15)}:</span>
                                      <input 
                                        type="number" 
                                        min="0" 
                                        max="100" 
                                        value={exam.grades[studentId]?.grade || ''} 
                                        onChange={e => handleGradeChange(exam.id, studentId, e.target.value)}
                                        placeholder="—"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <button 
                                  className="delete-btn" 
                                  onClick={() => { setDeleteTarget(exam); setShowConfirm(true); }}
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

        {/* РАСПИСАНИЕ */}
        {activeTab === 'schedule' && (
          <>
            {user.role !== 'student' && (
              <section>
                <ScheduleManager userRole={user.role} />
                <div className="section-header">
                  <h2>➕ Создание расписания</h2>
                  <button onClick={() => {
                    setScheduleForm({
                      id: null,
                      day: 'Понедельник',
                      timeSlot: TIME_SLOTS[0].start,
                      group: '',
                      subject: '',
                      teacher: '',
                      room: '',
                    });
                    setShowScheduleForm(true);
                  }}>Добавить занятие</button>
                </div>
              </section>
            )}

            <section>
              <div className="section-header">
                <h2>📅 {user.role === 'student' ? 'Моё расписание' : 'Расписание занятий'}</h2>
                <div className="section-actions">
                  <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="filter-select">
                    <option value="all">Все дни</option>
                    {WEEKDAYS.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                  {user.role !== 'student' && (
                    <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="filter-select">
                      <option value="all">Все группы</option>
                      {allScheduleGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  )}
                  {schedule.length > 0 && <button onClick={exportScheduleToCSV}>💾 Экспорт</button>}
                </div>
              </div>

              {schedule.length === 0 ? (
                <div className="empty-state">
                  <p>📅 Расписание пусто</p>
                  <p className="empty-hint">
                    {user.role === 'student' 
                      ? 'Администратор должен создать расписание' 
                      : 'Нажмите "Добавить занятие" чтобы начать'}
                  </p>
                </div>
              ) : user.role === 'student' ? (
                <div className="schedule-grid">
                  {mySchedule
                    .sort((a, b) => {
                      const dayDiff = WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day);
                      if (dayDiff !== 0) return dayDiff;
                      return a.timeSlot.localeCompare(b.timeSlot);
                    })
                    .map((cls, idx) => (
                      <div key={cls.id} className="schedule-card animate-in" style={{animationDelay: `${idx * 0.03}s`}}>
                        <div className="schedule-day">{cls.day}</div>
                        <div className="schedule-time">⏰ {getTimeSlotDisplay(cls.timeSlot)}</div>
                        <div className="schedule-subject">{cls.subject}</div>
                        <div className="schedule-info">
                          <span>👨‍🏫 {cls.teacher}</span>
                          <span>📍 {cls.room}</span>
                        </div>
                        <div className="schedule-group">{cls.group}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="schedule-table-container">
                  <div className="schedule-table">
                    <div className="schedule-header">
                      <div className="schedule-cell schedule-corner">Время / День</div>
                      {(filterDay === 'all' ? WEEKDAYS : [filterDay]).map(day => (
                        <div key={day} className="schedule-cell schedule-day-header">{day}</div>
                      ))}
                    </div>

                    {allScheduleGroups.map(group => {
                      if (filterGroup !== 'all' && filterGroup !== group) return null;
                      
                      return (
                        <div key={group} className="schedule-group-section">
                          <div className="schedule-group-label">{group}</div>
                          
                          {TIME_SLOTS.map((slot) => (
                            <div key={slot.start} className="schedule-row">
                              <div className="schedule-cell schedule-time-cell">
                                <div className="time-hour">{slot.hour}</div>
                                <div className="time-range">{slot.time}</div>
                              </div>
                              
                              {(filterDay === 'all' ? WEEKDAYS : [filterDay]).map(day => {
                                const cls = getClassForCell(day, slot.start, group);
                                
                                return (
                                  <div key={day} className="schedule-cell schedule-data-cell">
                                    {cls ? (
                                      <div className="schedule-class-box">
                                        <div className="schedule-class-subject">{cls.subject}</div>
                                        <div className="schedule-class-info">
                                          <span>👨‍🏫 {cls.teacher}</span>
                                          <span>📍 {cls.room}</span>
                                        </div>
                                        <div className="schedule-class-actions">
                                          <button 
                                            className="schedule-edit-btn"
                                            onClick={() => {
                                              setScheduleForm(cls);
                                              setShowScheduleForm(true);
                                            }}
                                            title="Редактировать"
                                          >
                                            ✏️
                                          </button>
                                          <button 
                                            className="schedule-delete-btn"
                                            onClick={() => deleteScheduleClass(cls.id)}
                                            title="Удалить"
                                          >
                                            🗑️
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button 
                                        className="schedule-add-btn"
                                        onClick={() => {
                                          setScheduleForm({
                                            id: null,
                                            day,
                                            timeSlot: slot.start,
                                            group,
                                            subject: '',
                                            teacher: '',
                                            room: '',
                                          });
                                          setShowScheduleForm(true);
                                        }}
                                      >
                                        +
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* РЕЙТИНГ */}
        {activeTab === 'ranking' && user.role !== 'student' && (
          <StudentsRanking exams={exams} />
        )}
      </main>

      {/* Toast уведомления */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {showConfirm && (
        <div className="modal-backdrop" onClick={() => { setShowConfirm(false); setDeleteTarget(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>⚠️ Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить экзамен <strong>"{deleteTarget?.subject}"</strong>?</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => { setShowConfirm(false); setDeleteTarget(null); }}
              >
                Отмена
              </button>
              <button 
                className="btn-danger"
                onClick={() => { 
                  setExams(exams.filter(x => x.id !== deleteTarget.id)); 
                  setShowConfirm(false); 
                  setDeleteTarget(null);
                  showToast('Экзамен удалён', 'info');
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleForm && (
        <div className="modal-backdrop" onClick={() => setShowScheduleForm(false)}>
          <div className="modal schedule-form-modal" onClick={e => e.stopPropagation()}>
            <h3>{scheduleForm.id ? '✏️ Редактировать занятие' : '➕ Добавить занятие'}</h3>
            <form onSubmit={addScheduleClass} className="schedule-form">
              <div className="form-row">
                <select value={scheduleForm.day} onChange={e => setScheduleForm({...scheduleForm, day: e.target.value})}>
                  {WEEKDAYS.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <select value={scheduleForm.timeSlot} onChange={e => setScheduleForm({...scheduleForm, timeSlot: e.target.value})}>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot.start} value={slot.start}>
                      {slot.hour} ({slot.time})
                    </option>
                  ))}
                </select>
              </div>
              
              <input 
                placeholder="Группа" 
                value={scheduleForm.group} 
                onChange={e => setScheduleForm({...scheduleForm, group: e.target.value})}
                required 
              />
              
              <input 
                placeholder="Предмет" 
                value={scheduleForm.subject} 
                onChange={e => setScheduleForm({...scheduleForm, subject: e.target.value})}
                required 
              />
              
              <input 
                placeholder="Преподаватель" 
                value={scheduleForm.teacher} 
                onChange={e => setScheduleForm({...scheduleForm, teacher: e.target.value})}
                required 
              />
              
              <input 
                placeholder="Аудитория" 
                value={scheduleForm.room} 
                onChange={e => setScheduleForm({...scheduleForm, room: e.target.value})}
                required 
              />

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowScheduleForm(false)}>
                  Отмена
                </button>
                <button type="submit">
                  {scheduleForm.id ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default App;
