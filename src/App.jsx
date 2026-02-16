import { useState, useEffect } from 'react';
import './App.css';

// USERS DATABASE - В продакшене это будет из backend
const USERS_DB = [
  { id: 1, name: 'Азамат Студентов', role: 'student', login: 'student', password: '1234', group: 'COMSE-25' },
  { id: 2, name: 'Мария Преподавателева', role: 'teacher', login: 'teacher', password: '5678' },
  { id: 3, name: 'Админ Системы', role: 'admin', login: 'admin', password: 'admin' },
];

// Начальные экзамены для демо
const INITIAL_EXAMS = [
  { 
    id: 1, 
    group: 'COMSE-25', 
    subject: 'Programming Language 2', 
    date: '2026-02-10', 
    time: '10:00',
    room: 'BIGLAB',
    teacher: 'Azhar Kazakbaeva', 
    type: 'Экзамен',
    semester: 'Spring 2025-2026',
    students: ['Азамат Студентов'],
    grades: {}
  },
  { 
    id: 2, 
    group: 'COMSE-25', 
    subject: 'Calculus 2', 
    date: '2026-02-15', 
    time: '14:00',
    room: 'B107',
    teacher: 'Hussien Chebsi', 
    type: 'Экзамен',
    semester: 'Spring 2025-2026',
    students: ['Азамат Студентов'],
    grades: {}
  },
];

// Временные слоты для расписания (8:00 - 18:00)
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
  '17:00', '17:30', '18:00'
];

// Дни недели
const WEEKDAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

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
  const [activeTab, setActiveTab] = useState('exams');
  
  // Форма для создания занятия
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    day: 'Понедельник',
    time: '09:00',
    group: '',
    subject: '',
    teacher: '',
    room: '',
    duration: 90 // длительность в минутах
  });

  // ============ ЛОКАЛЬНАЯ БАЗА ДАННЫХ (localStorage) ============
  
  // Загрузка всех данных при старте
  useEffect(() => {
    // Загрузить тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.dataset.theme = savedTheme;

    // Загрузить экзамены
    const savedExams = localStorage.getItem('exams_db');
    if (savedExams) {
      try {
        setExams(JSON.parse(savedExams));
      } catch (e) {
        setExams(INITIAL_EXAMS);
      }
    } else {
      setExams(INITIAL_EXAMS);
    }

    // Загрузить расписание
    const savedSchedule = localStorage.getItem('schedule_db');
    if (savedSchedule) {
      try {
        setSchedule(JSON.parse(savedSchedule));
      } catch (e) {
        setSchedule([]);
      }
    }
  }, []);

  // Сохранить экзамены при изменении
  useEffect(() => {
    if (exams.length > 0) {
      localStorage.setItem('exams_db', JSON.stringify(exams));
    }
  }, [exams]);

  // Сохранить расписание при изменении
  useEffect(() => {
    if (schedule.length >= 0) {
      localStorage.setItem('schedule_db', JSON.stringify(schedule));
    }
  }, [schedule]);

  // Сохранить тему
  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Форма добавления экзамена
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

  // Форма логина
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Закрывать модал по Escape
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

  // ============ ФУНКЦИИ ЛОГИНА ============
  
  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = USERS_DB.find(
      u => u.login === loginForm.login && u.password === loginForm.password
    );
    if (foundUser) {
      setUser(foundUser);
      setLoginError('');
    } else {
      setLoginError('❌ Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLoginForm({ login: '', password: '' });
  };

  // ============ ФУНКЦИИ ЭКЗАМЕНОВ ============
  
  const addExam = (e) => {
    e.preventDefault();
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
      students: form.students.split(',').map(s => s.trim()).filter(Boolean),
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
  };

  const handleExamEdit = (id, field, value) => {
    setExams(exams.map(exam => 
      exam.id === id ? { ...exam, [field]: value } : exam
    ));
  };

  const handleGradeChange = (examId, studentName, grade) => {
    setExams(exams.map(exam => {
      if (exam.id === examId) {
        return {
          ...exam,
          grades: { ...exam.grades, [studentName]: grade }
        };
      }
      return exam;
    }));
  };

  // ============ ФУНКЦИИ РАСПИСАНИЯ ============
  
  const addScheduleClass = (e) => {
    e.preventDefault();
    const newClass = {
      id: Date.now(),
      ...scheduleForm
    };
    setSchedule([...schedule, newClass]);
    setScheduleForm({
      day: 'Понедельник',
      time: '09:00',
      group: '',
      subject: '',
      teacher: '',
      room: '',
      duration: 90
    });
    setShowScheduleForm(false);
  };

  const deleteScheduleClass = (id) => {
    setSchedule(schedule.filter(cls => cls.id !== id));
  };

  const editScheduleClass = (id, field, value) => {
    setSchedule(schedule.map(cls => 
      cls.id === id ? { ...cls, [field]: value } : cls
    ));
  };

  // ============ ФИЛЬТРАЦИЯ ============
  
  const allGroups = [...new Set(exams.map(e => e.group))];
  const scheduleGroups = [...new Set(schedule.map(s => s.group))];
  const allScheduleGroups = user?.role === 'student' 
    ? [user.group] 
    : scheduleGroups.length > 0 
      ? scheduleGroups 
      : ['COMSE-25', 'COMSE-26', 'COMSE-27'];

  const filteredExams = exams.filter(exam => {
    if (!user) return false;
    const groupMatch = user.role === 'student' ? exam.group === user.group : 
                       filterGroup === 'all' ? true : exam.group === filterGroup;
    const searchMatch = exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        exam.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    return groupMatch && searchMatch;
  });

  const mySchedule = user ? schedule.filter(cls => cls.group === user.group) : [];
  const filteredSchedule = schedule.filter(cls => {
    const groupMatch = filterGroup === 'all' ? true : cls.group === filterGroup;
    const dayMatch = filterDay === 'all' ? true : cls.day === filterDay;
    return groupMatch && dayMatch;
  });

  // ============ ЭКСПОРТ ============
  
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
  };

  const exportScheduleToCSV = () => {
    const headers = ['День', 'Время', 'Группа', 'Предмет', 'Преподаватель', 'Аудитория'];
    const rows = (user.role === 'student' ? mySchedule : filteredSchedule).map(c => [
      c.day, c.time, c.group, c.subject, c.teacher, c.room
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.csv';
    a.click();
  };

  // ============ СТАТИСТИКА ============
  
  const upcomingExams = user ? filteredExams.filter(e => new Date(e.date) >= new Date()).length : 0;
  const passedExams = user ? filteredExams.filter(e => e.grades && Object.keys(e.grades).length > 0).length : 0;
  const avgGrade = passedExams > 0 
    ? (filteredExams.reduce((sum, e) => {
        const grades = Object.values(e.grades).filter(g => g).map(Number);
        return sum + (grades.length > 0 ? grades.reduce((a,b) => a+b, 0) / grades.length : 0);
      }, 0) / passedExams).toFixed(1)
    : 0;

  // Проверка, есть ли экзамен сегодня
  const todayStr = new Date().toISOString().split('T')[0];
  const examToday = user ? filteredExams.find(e => e.date === todayStr) : null;

  // Получить занятия на ячейку сетки
  const getClassForCell = (day, time, group) => {
    return schedule.find(cls => 
      cls.day === day && cls.time === time && cls.group === group
    );
  };

  // ============ RENDER ============
  
  if (!user) {
    return (
      <div className="container login-container">
        <div className="login-header">
          <h1>🎓 Система управления экзаменами</h1>
          <p>Войдите в систему для продолжения</p>
        </div>

        <div className="info-box">
          <h3>📝 Демо аккаунты:</h3>
          <div className="accounts-list">
            {USERS_DB.map(acc => (
              <div key={acc.id} className="account-item">
                <div className="account-header">
                  <span className="account-name">{acc.name}</span>
                  <span className="account-role">{acc.role}</span>
                </div>
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
          <h1>🎓 Экзамены и Расписание</h1>
          <p className="user-info">
            {user.name} <span className="role-badge">{user.role}</span>
            {user.group && ` • ${user.group}`}
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
        <button 
          className={`tab ${activeTab === 'exams' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          📝 Экзамены
        </button>
        <button 
          className={`tab ${activeTab === 'schedule' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Расписание
        </button>
      </div>

      <main>
        {/* ============ ЭКЗАМЕНЫ ============ */}
        {activeTab === 'exams' && (
          <>
            {user.role === 'student' && (
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
            )}

            {user.role !== 'student' && (
              <>
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
                    <input placeholder="Студенты (через запятую)" value={form.students} onChange={e => setForm({...form, students: e.target.value})} />
                    <button type="submit">Добавить</button>
                  </form>
                </section>
              </>
            )}

            {user.role === 'student' ? (
              <section>
                <h2>📝 Мои экзамены</h2>
                {examToday && (
                  <div className="exam-today-alert animate-in">
                    ⚠️ Сегодня экзамен: <strong>{examToday.subject}</strong> в {examToday.time}, аудитория {examToday.room}
                  </div>
                )}
                {filteredExams.length === 0 ? (
                  <div className="empty-state">
                    <p>📭 Нет назначенных экзаменов</p>
                  </div>
                ) : (
                  <div className="cards">
                    {filteredExams
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map((exam, idx) => {
                        const isUpcoming = new Date(exam.date) >= new Date();
                        const myGrade = exam.grades[user.name];
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
                              <div className={`card-grade ${Number(myGrade) >= 50 ? 'card-grade-pass' : 'card-grade-fail'}`}>
                                Оценка: {myGrade} / 100
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </section>
            ) : (
              <>
                <section>
                  <div className="section-header">
                    <h2>📋 Управление экзаменами</h2>
                    <div className="section-actions">
                      <input 
                        type="text"
                        placeholder="🔍 Поиск..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                      <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="filter-select">
                        <option value="all">Все группы</option>
                        {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <button onClick={exportToCSV}>💾 Экспорт</button>
                    </div>
                  </div>

                  {filteredExams.length === 0 ? (
                    <div className="empty-state">
                      <p>📭 Нет экзаменов</p>
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
                            <th>Преподаватель</th>
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
                              <td><input value={exam.teacher} onChange={e => handleExamEdit(exam.id, 'teacher', e.target.value)} /></td>
                              <td>
                                <div className="grades-cell">
                                  {exam.students.map(student => (
                                    <div key={student} className="grade-input-row">
                                      <span>{student.substring(0, 15)}:</span>
                                      <input 
                                        type="number" 
                                        min="0" 
                                        max="100" 
                                        value={exam.grades[student] || ''} 
                                        onChange={e => handleGradeChange(exam.id, student, e.target.value)}
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
                </section>
              </>
            )}
          </>
        )}

        {/* ============ РАСПИСАНИЕ ============ */}
        {activeTab === 'schedule' && (
          <>
            {user.role !== 'student' && (
              <section>
                <div className="section-header">
                  <h2>➕ Создание расписания</h2>
                  <button onClick={() => setShowScheduleForm(true)}>Добавить занятие</button>
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
                // Карточки для студента
                <div className="schedule-grid">
                  {mySchedule
                    .sort((a, b) => {
                      const dayDiff = WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day);
                      if (dayDiff !== 0) return dayDiff;
                      return a.time.localeCompare(b.time);
                    })
                    .map((cls, idx) => (
                      <div key={cls.id} className="schedule-card animate-in" style={{animationDelay: `${idx * 0.03}s`}}>
                        <div className="schedule-day">{cls.day}</div>
                        <div className="schedule-time">⏰ {cls.time}</div>
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
                // Визуальная сетка для админа/препода
                <div className="schedule-table-container">
                  <div className="schedule-table">
                    {/* Заголовок с днями недели */}
                    <div className="schedule-header">
                      <div className="schedule-cell schedule-corner">Время / День</div>
                      {(filterDay === 'all' ? WEEKDAYS : [filterDay]).map(day => (
                        <div key={day} className="schedule-cell schedule-day-header">{day}</div>
                      ))}
                    </div>

                    {/* Группы и временные слоты */}
                    {allScheduleGroups.map(group => {
                      if (filterGroup !== 'all' && filterGroup !== group) return null;
                      
                      return (
                        <div key={group} className="schedule-group-section">
                          <div className="schedule-group-label">{group}</div>
                          
                          {TIME_SLOTS.filter((_, i) => i % 2 === 0).map(time => (
                            <div key={time} className="schedule-row">
                              <div className="schedule-cell schedule-time-cell">{time}</div>
                              
                              {(filterDay === 'all' ? WEEKDAYS : [filterDay]).map(day => {
                                const cls = getClassForCell(day, time, group);
                                
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
                                            day,
                                            time,
                                            group,
                                            subject: '',
                                            teacher: '',
                                            room: '',
                                            duration: 90
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
      </main>

      {/* Модал подтверждения удаления экзамена */}
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
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модал создания/редактирования занятия */}
      {showScheduleForm && (
        <div className="modal-backdrop" onClick={() => setShowScheduleForm(false)}>
          <div className="modal schedule-form-modal" onClick={e => e.stopPropagation()}>
            <h3>{scheduleForm.id ? '✏️ Редактировать занятие' : '➕ Добавить занятие'}</h3>
            <form onSubmit={addScheduleClass} className="schedule-form">
              <div className="form-row">
                <select value={scheduleForm.day} onChange={e => setScheduleForm({...scheduleForm, day: e.target.value})}>
                  {WEEKDAYS.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <select value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})}>
                  {TIME_SLOTS.map(time => <option key={time} value={time}>{time}</option>)}
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
              
              <select 
                value={scheduleForm.duration} 
                onChange={e => setScheduleForm({...scheduleForm, duration: Number(e.target.value)})}
              >
                <option value={50}>50 минут</option>
                <option value={90}>90 минут (пара)</option>
                <option value={120}>120 минут</option>
              </select>

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