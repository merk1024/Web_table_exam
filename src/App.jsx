import { useState, useEffect } from 'react';
import './App.css';

// Note: To use Excel import, install: npm install xlsx
// Then uncomment the line below:
// import * as XLSX from 'xlsx';

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

function App() {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterDay, setFilterDay] = useState('all');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('exams');
  const [uploadProgress, setUploadProgress] = useState('');

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
      } catch (e) {}
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
    if (schedule) {
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
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ============ ИМПОРТ РАСПИСАНИЯ ИЗ EXCEL ============
  
  const parseScheduleFromExcel = (data) => {
    const classes = [];
    const workbook = XLSX.read(data, { type: 'array' });
    
    const daysMapping = {
      'MONDAY': 'Понедельник',
      'TUESDAY': 'Вторник',
      'WEDNESDAY': 'Среда',
      'THURSDAY': 'Четверг',
      'FRIDAY': 'Пятница',
      'SATURDAY': 'Суббота'
    };

    workbook.SheetNames.forEach(sheetName => {
      // Обрабатываем только листы с Spring25
      if (!sheetName.includes('Spring25') || sheetName.includes('Master') || sheetName.includes('PhD')) {
        return;
      }

      const dayEn = sheetName.split(' ')[0].toUpperCase();
      const day = daysMapping[dayEn] || dayEn;
      
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Найти строку с временными слотами
      let timeRowIdx = -1;
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.some(cell => cell && String(cell).includes('08'))) {
          timeRowIdx = i;
          break;
        }
      }

      if (timeRowIdx === -1) return;

      // Извлечь временные слоты
      const timeSlots = jsonData[timeRowIdx]
        .slice(4)
        .filter(cell => cell && String(cell).match(/\d{2}[:.]\d{2}/))
        .map(cell => String(cell).replace(/\./g, ':'));

      // Обработать строки с группами
      for (let rowIdx = timeRowIdx + 2; rowIdx < jsonData.length; rowIdx++) {
        const row = jsonData[rowIdx];
        if (!row) continue;

        // Найти группу
        let group = null;
        for (let colIdx = 0; colIdx < Math.min(5, row.length); colIdx++) {
          const cell = row[colIdx];
          if (cell && String(cell).match(/COM[A-Z]+-\d{2}/)) {
            group = String(cell).trim();
            break;
          }
        }

        if (!group) continue;

        // Извлечь занятия
        for (let slotIdx = 0; slotIdx < timeSlots.length; slotIdx++) {
          const colIdx = 4 + slotIdx;
          if (colIdx >= row.length) continue;

          const cellContent = row[colIdx];
          if (!cellContent || String(cellContent).toLowerCase().includes('lunch') || 
              String(cellContent).toLowerCase().includes('advisor')) {
            continue;
          }

          // Парсинг содержимого
          const lines = String(cellContent).split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length === 0) continue;

          const subject = lines[0];
          let teacher = 'TBA';
          let room = 'TBA';

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(/\b(Mr\.|Ms\.|Dr\.)/)) {
              teacher = line.replace(/^(Mr\.|Ms\.|Dr\.)\s*/, '');
              const roomMatch = teacher.match(/([A-Z0-9]+(?:\([0-9]+\))?)$/);
              if (roomMatch) {
                room = roomMatch[1];
                teacher = teacher.substring(0, roomMatch.index).trim();
              }
            }
          }

          classes.push({
            id: classes.length + 1,
            day,
            dayEn,
            group,
            time: timeSlots[slotIdx],
            subject: subject.substring(0, 100),
            teacher: teacher.substring(0, 50),
            room: room.substring(0, 20)
          });
        }
      }
    });

    return classes;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadProgress('Загрузка файла...');

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          setUploadProgress('Парсинг расписания...');
          const data = new Uint8Array(event.target.result);
          const classes = parseScheduleFromExcel(data);
          
          const groups = [...new Set(classes.map(c => c.group))].sort();
          
          const scheduleData = {
            classes,
            groups,
            totalClasses: classes.length,
            semester: 'Spring 2025-2026',
            uploadDate: new Date().toISOString()
          };

          setSchedule(scheduleData);
          setUploadProgress(`✅ Загружено ${classes.length} занятий для ${groups.length} групп`);
          
          setTimeout(() => setUploadProgress(''), 3000);
        } catch (error) {
          setUploadProgress(`❌ Ошибка парсинга: ${error.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setUploadProgress(`❌ Ошибка загрузки: ${error.message}`);
    }
  };

  // ============ ФУНКЦИИ ДЛЯ РАБОТЫ С ДАННЫМИ ============

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = USERS_DB.find(u => u.login === loginForm.login && u.password === loginForm.password);
    if (foundUser) {
      setUser(foundUser);
      setLoginError('');
      setLoginForm({ login: '', password: '' });
    } else {
      setLoginError('Неверный логин или пароль');
    }
  };

  const handleAddExam = (e) => {
    e.preventDefault();
    if (!form.group || !form.subject || !form.date || !form.time) return;
    
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
      grades: {},
    };
    
    setExams([...exams, newExam]);
    setForm({ group: '', subject: '', date: '', time: '', room: '', type: 'Экзамен', semester: 'Spring 2025-2026', students: '' });
  };

  const handleExamEdit = (id, field, value) => {
    setExams(exams.map(exam =>
      exam.id === id ? { ...exam, [field]: field === 'students' ? value.split(',').map(s => s.trim()).filter(Boolean) : value } : exam
    ));
  };

  const handleGradeChange = (examId, studentName, grade) => {
    setExams(exams.map(exam =>
      exam.id === examId ? { ...exam, grades: { ...exam.grades, [studentName]: grade } } : exam
    ));
  };

  const getDaysUntilExam = (examDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const exportToCSV = () => {
    const headers = ['Группа', 'Предмет', 'Дата', 'Время', 'Аудитория', 'Преподаватель', 'Тип'];
    const rows = exams.map(e => [e.group, e.subject, e.date, e.time, e.room, e.teacher, e.type]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `exams_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportScheduleToCSV = () => {
    if (!schedule) return;
    const headers = ['День', 'Время', 'Группа', 'Предмет', 'Преподаватель', 'Аудитория'];
    const rows = schedule.classes.map(c => [c.day, c.time, c.group, c.subject, c.teacher, c.room]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `schedule_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Фильтрация
  const filteredExams = exams.filter(exam => {
    const matchesSearch = searchQuery === '' || 
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = filterGroup === 'all' || exam.group === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const filteredSchedule = schedule?.classes?.filter(cls => {
    const matchesGroup = filterGroup === 'all' || cls.group === filterGroup;
    const matchesDay = filterDay === 'all' || cls.day === filterDay;
    return matchesGroup && matchesDay;
  }) || [];

  // ============ ЛОГИН ЭКРАН ============
  
  if (!user) {
    return (
      <div className="container login-container">
        <div className="login-header">
          <h1>🎓 AIU Schedule System</h1>
          <p>Система управления расписанием и экзаменами</p>
        </div>
        
        <div className="info-box">
          <h3>ℹ️ Тестовые аккаунты</h3>
          <div className="accounts-list">
            {USERS_DB.map(u => (
              <div key={u.id} className="account-item">
                <div className="account-header">
                  <span className="account-name">{u.name}</span>
                  <span className="account-role">{u.role}</span>
                </div>
                <div className="account-creds">
                  <code>Логин: {u.login}</code>
                  <code>Пароль: {u.password}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <input 
            name="login" 
            value={loginForm.login} 
            onChange={e => setLoginForm({...loginForm, login: e.target.value})} 
            placeholder="Логин" 
            required 
          />
          <input 
            name="password" 
            type="password" 
            value={loginForm.password} 
            onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
            placeholder="Пароль" 
            required 
          />
          <button type="submit">Войти в систему</button>
        </form>
        
        {loginError && <p className="login-error">{loginError}</p>}

        <div className="info-box" style={{marginTop: '2rem'}}>
          <h3>💡 Для общей базы данных</h3>
          <p style={{fontSize: '0.9rem', lineHeight: '1.6'}}>
            Сейчас используется localStorage (локальное хранилище браузера).
            Для общей БД нужен backend сервер (Node.js + MongoDB/PostgreSQL).
            Инструкции по настройке см. в README.
          </p>
        </div>
      </div>
    );
  }

  // ============ СТАТИСТИКА ДЛЯ СТУДЕНТА ============
  
  const myExams = user.role === 'student' ? exams.filter(exam => exam.group === user.group) : exams;
  const sortedExams = myExams.slice().sort((a,b) => (a.date + ' ' + a.time) > (b.date + ' ' + b.time) ? 1 : -1);
  const upcomingExams = sortedExams.filter(e => new Date(e.date) >= new Date());
  const nextExam = upcomingExams[0];
  const completedExams = myExams.filter(e => e.grades[user.name]);
  const avgGrade = completedExams.length > 0 
    ? (completedExams.reduce((sum, e) => sum + parseFloat(e.grades[user.name] || 0), 0) / completedExams.length).toFixed(1)
    : 'N/A';

  const allGroups = [...new Set([
    ...exams.map(e => e.group),
    ...(schedule?.groups || [])
  ])].sort();

  const mySchedule = user.role === 'student' && schedule 
    ? schedule.classes.filter(c => c.group === user.group)
    : schedule?.classes || [];

  // ============ ГЛАВНЫЙ ИНТЕРФЕЙС ============

  return (
    <div className="container">
      <header>
        <div>
          <h1>🎓 AIU Schedule</h1>
          <p className="user-info">
            {user.name} • <span className="role-badge">{user.role}</span>
            {user.role === 'student' && ` • ${user.group}`}
          </p>
        </div>
        <div className="header-actions">
          <button className="logout-btn" onClick={() => setUser(null)}>Выйти</button>
          <button className="theme-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* Табы */}
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
          📅 Расписание занятий
        </button>
      </div>

      <main>
        {/* ============ ЭКЗАМЕНЫ ============ */}
        {activeTab === 'exams' && (
          <>
            {user.role === 'student' && (
              <>
                <section className="stats-section">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-label">Следующий экзамен</div>
                      <div className="stat-value">{nextExam ? nextExam.subject.substring(0, 15) + '...' : 'Нет'}</div>
                      {nextExam && <div className="stat-meta">{nextExam.date} в {nextExam.time}</div>}
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Всего экзаменов</div>
                      <div className="stat-value">{myExams.length}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Средний балл</div>
                      <div className="stat-value">{avgGrade}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Предстоящих</div>
                      <div className="stat-value">{upcomingExams.length}</div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2>Мои экзамены</h2>
                  {sortedExams.length === 0 ? (
                    <div className="empty-state">
                      <p>📭 Пока нет экзаменов</p>
                    </div>
                  ) : (
                    <div className="cards">
                      {sortedExams.map((exam, idx) => {
                        const daysUntil = getDaysUntilExam(exam.date);
                        const isUpcoming = daysUntil >= 0 && daysUntil <= 3;
                        const grade = exam.grades[user.name];
                        return (
                          <div className="card-exam animate-in" key={exam.id} style={{animationDelay: `${idx * 0.05}s`}}>
                            <div className="card-row">
                              <div className="card-title">{exam.subject}</div>
                              <span className="badge-type">{exam.type}</span>
                            </div>
                            <div className="card-meta">Группа: {exam.group}</div>
                            <div className="card-row" style={{marginTop: '0.5rem'}}>
                              <div className="card-date">
                                📅 {exam.date} • {exam.time}
                                {isUpcoming && <span className="badge-upcoming">Скоро! ({daysUntil}д)</span>}
                              </div>
                            </div>
                            <div className="card-teacher">👨‍🏫 {exam.teacher}</div>
                            <div className="card-teacher">📍 {exam.room}</div>
                            {grade && (
                              <div className={`card-grade ${parseFloat(grade) < 50 ? 'card-grade-fail' : 'card-grade-pass'}`}>
                                Оценка: <strong>{grade}</strong>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            )}

            {(user.role === 'teacher' || user.role === 'admin') && (
              <>
                <section>
                  <h2>➕ Добавить экзамен</h2>
                  <form onSubmit={handleAddExam} className="add-form">
                    <select value={form.group} onChange={e => setForm({...form, group: e.target.value})} required>
                      <option value="">Выберите группу</option>
                      {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Предмет" required />
                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                    <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
                    <input value={form.room} onChange={e => setForm({...form, room: e.target.value})} placeholder="Аудитория" />
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="Экзамен">Экзамен</option>
                      <option value="Зачёт">Зачёт</option>
                      <option value="Курсовая">Курсовая</option>
                    </select>
                    <input value={form.students} onChange={e => setForm({...form, students: e.target.value})} placeholder="Студенты (через запятую)" style={{gridColumn: '1 / -1'}} />
                    <button type="submit" style={{gridColumn: '1 / -1'}}>➕ Добавить экзамен</button>
                  </form>
                </section>

                <section>
                  <div className="section-header">
                    <h2>Все экзамены</h2>
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
            {user.role === 'admin' && (
              <section>
                <h2>📂 Импорт расписания из Excel</h2>
                <div className="upload-box">
                  <input 
                    type="file" 
                    accept=".xlsx,.xls" 
                    onChange={handleFileUpload}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="upload-label">
                    📤 Выбрать Excel файл
                  </label>
                  {uploadProgress && <p className="upload-progress">{uploadProgress}</p>}
                  <p className="upload-hint">
                    Загрузите файл расписания в формате .xlsx
                  </p>
                </div>
                {schedule && (
                  <div className="schedule-info">
                    <p>✅ Загружено: <strong>{schedule.totalClasses}</strong> занятий</p>
                    <p>📚 Групп: <strong>{schedule.groups?.length || 0}</strong></p>
                    <p>📅 Семестр: <strong>{schedule.semester}</strong></p>
                  </div>
                )}
              </section>
            )}

            <section>
              <div className="section-header">
                <h2>📅 Расписание занятий</h2>
                <div className="section-actions">
                  <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="filter-select">
                    <option value="all">Все дни</option>
                    <option value="Понедельник">Понедельник</option>
                    <option value="Вторник">Вторник</option>
                    <option value="Среда">Среда</option>
                    <option value="Четверг">Четверг</option>
                    <option value="Пятница">Пятница</option>
                    <option value="Суббота">Суббота</option>
                  </select>
                  {user.role !== 'student' && (
                    <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="filter-select">
                      <option value="all">Все группы</option>
                      {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  )}
                  {schedule && <button onClick={exportScheduleToCSV}>💾 Экспорт</button>}
                </div>
              </div>

              {!schedule ? (
                <div className="empty-state">
                  <p>📅 Расписание не загружено</p>
                  <p className="empty-hint">Администратор должен загрузить Excel файл с расписанием</p>
                </div>
              ) : (
                <div className="schedule-grid">
                  {(user.role === 'student' ? mySchedule : filteredSchedule)
                    .sort((a, b) => {
                      const dayOrder = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
                      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
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
              )}
            </section>
          </>
        )}
      </main>

      {/* Модал подтверждения удаления */}
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
    </div>
  );
}

export default App;