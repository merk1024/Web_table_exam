import { useState, useEffect } from 'react';
import './App.css';

// Пример структуры пользователей с паролями
const users = [
  { id: 1, name: 'Иван', role: 'student', login: 'ivan', password: '1234' },
  { id: 2, name: 'Мария', role: 'teacher', login: 'maria', password: '5678' },
  { id: 3, name: 'Админ', role: 'admin', login: 'admin', password: 'admin' },
];

// Пример структуры экзаменов (добавлено поле grades)
const initialExams = [
  { id: 1, class: '10A', subject: 'Математика', date: '2025-02-05', time: '10:00', teacher: 'Мария', students: ['Иван'], grades: {} },
  { id: 2, class: '10A', subject: 'Физика', date: '2025-02-08', time: '12:00', teacher: 'Мария', students: ['Иван'], grades: {} },
  { id: 3, class: '11B', subject: 'Химия', date: '2025-02-15', time: '14:00', teacher: 'Мария', students: ['Иван'], grades: {} },
];

function App() {
  const [role, setRole] = useState(users[0].role);
  const [user, setUser] = useState(users[0]);
  const [exams, setExams] = useState(initialExams);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Применяем тему к body и синхронизируем с localStorage
  useEffect(() => {
    if (typeof document !== 'undefined') document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Сохраняем/загружаем экзамены из localStorage
  useEffect(() => {
    const raw = localStorage.getItem('exams');
    if (raw) {
      try {
        setExams(JSON.parse(raw));
      } catch (e) {
        // ignore
      }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('exams', JSON.stringify(exams));
  }, [exams]);

  // Состояния для формы добавления экзамена
  const [form, setForm] = useState({
    class: '',
    subject: '',
    date: '',
    time: '',
    students: '',
  });

  // Состояния для логина
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [authUser, setAuthUser] = useState(null);
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

  // Обработка изменения формы логина
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  // Обработка логина
  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = users.find(u => u.login === loginForm.login && u.password === loginForm.password);
    if (foundUser) {
      setAuthUser(foundUser);
      setUser(foundUser);
      setRole(foundUser.role);
      setLoginError('');
      setLoginForm({ login: '', password: '' });
    } else {
      setLoginError('Неверный логин или пароль');
    }
  };

  // Обработка изменения формы экзамена
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Добавление экзамена
  const handleAddExam = (e) => {
    e.preventDefault();
    if (!form.class || !form.subject || !form.date || !form.time) return;
    setExams([
      ...exams,
      {
        id: Date.now(),
        class: form.class,
        subject: form.subject,
        date: form.date,
        time: form.time,
        teacher: user.name,
        students: form.students.split(',').map(s => s.trim()).filter(Boolean),
        grades: {},
      },
    ]);
    setForm({ class: '', subject: '', date: '', time: '', students: '' });
  };

  // Функция для редактирования экзамена в таблице
  const handleExamEdit = (id, field, value) => {
    setExams(exams => exams.map(exam =>
      exam.id === id ? { ...exam, [field]: field === 'students' ? value.split(',').map(s => s.trim()).filter(Boolean) : value } : exam
    ));
  };

  // Функция для обновления оценки студента
  const handleGradeChange = (examId, studentName, grade) => {
    setExams(exams => exams.map(exam =>
      exam.id === examId ? { ...exam, grades: { ...exam.grades, [studentName]: grade } } : exam
    ));
  };

  // Функция проверки близости экзамена (1-3 дня)
  const getDaysUntilExam = (examDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Экспорт в CSV
  const exportToCSV = () => {
    const headers = ['Класс', 'Предмет', 'Дата', 'Время', 'Преподаватель', 'Ученики'];
    const rows = exams.map(e => [e.class, e.subject, e.date, e.time, e.teacher, e.students.join('; ')]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'exams.csv';
    link.click();
  };

  // Фильтрация экзаменов по поиску
  const filteredExams = exams.filter(exam => {
    const matchesSearch = searchQuery === '' || 
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Если не авторизован — показываем форму логина
  if (!authUser) {
    return (
      <div className="container" style={{maxWidth: 400, marginTop: '5rem'}}>
        <h2 style={{textAlign: 'center'}}>Вход в систему</h2>
        <div style={{marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--muted)'}}>
          <b>Доступные аккаунты:</b>
          <ul style={{margin: '0.5em 0 0 1em', padding: 0}}>
            {users.map(u => (
              <li key={u.id}>
                <span style={{fontWeight: 500}}>{u.name}</span> — <span>{u.role}</span><br />
                <span style={{fontSize: '0.95em'}}>Логин: <b>{u.login}</b>, Пароль: <b>{u.password}</b></span>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <input name="login" value={loginForm.login} onChange={handleLoginChange} placeholder="Логин" required />
          <input name="password" type="password" value={loginForm.password} onChange={handleLoginChange} placeholder="Пароль" required />
          <button type="submit">Войти</button>
        </form>
        {loginError && <p style={{color: 'red', textAlign: 'center'}}>{loginError}</p>}
      </div>
    );
  }

  // Статистика для студента
  const myExams = exams.filter(exam => exam.students.includes(user.name));
  const sortedExams = myExams.slice().sort((a,b) => (a.date + ' ' + a.time) > (b.date + ' ' + b.time) ? 1 : -1);
  const upcomingExams = sortedExams.filter(e => new Date(e.date) >= new Date());
  const nextExam = upcomingExams[0];
  const completedExams = myExams.filter(e => e.grades[user.name]);
  const avgGrade = completedExams.length > 0 
    ? (completedExams.reduce((sum, e) => sum + parseFloat(e.grades[user.name] || 0), 0) / completedExams.length).toFixed(1)
    : 'N/A';

  return (
    <div className="container">
      <header>
        <h1>Расписание экзаменов</h1>
        <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
          <p style={{margin:0}}>Пользователь: <b>{user.name}</b> ({role})</p>
          <button className="logout-btn" onClick={() => { setAuthUser(null); setUser(null); setRole(''); }}>Выйти</button>
          <button style={{marginLeft: '0.5rem'}} onClick={() => { const next = theme === 'light' ? 'dark' : 'light'; setTheme(next); localStorage.setItem('theme', next); }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
      <main>
        {/* Расписание для ученика: статистика + карточки */}
        {role === 'student' && (
          <>
            {/* Статистика */}
            <section className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Следующий экзамен</div>
                  <div className="stat-value">{nextExam ? nextExam.subject : 'Нет'}</div>
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
              <div style={{display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem'}}>
                <label>Фильтр по классу:</label>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                  <option value="all">Все</option>
                  {[...new Set(exams.map(ex => ex.class))].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button onClick={() => window.print()} style={{marginLeft: 'auto'}}>📄 Печать</button>
              </div>
              <div className="cards">
                {sortedExams
                  .filter(exam => filterClass === 'all' || exam.class === filterClass)
                  .map((exam, idx) => {
                    const daysUntil = getDaysUntilExam(exam.date);
                    const isUpcoming = daysUntil >= 0 && daysUntil <= 3;
                    const grade = exam.grades[user.name];
                    return (
                      <div className="card-exam animate-in" key={exam.id} style={{animationDelay: `${idx * 0.05}s`}}>
                        <div className="card-row">
                          <div className="card-title">{exam.subject}</div>
                          <div className="card-meta">Класс: {exam.class}</div>
                        </div>
                        <div className="card-row">
                          <div className="card-date">
                            {exam.date} • {exam.time}
                            {isUpcoming && <span className="badge-upcoming">Скоро! ({daysUntil}д)</span>}
                          </div>
                        </div>
                        <div className="card-teacher">Преподаватель: {exam.teacher}</div>
                        {grade && (
                          <div className={`card-grade ${parseFloat(grade) < 50 ? 'card-grade-fail' : 'card-grade-pass'}`}>
                            Оценка: <strong>{grade}</strong>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </section>
          </>
        )}

        {/* Для препода и админа — форма добавления экзамена и таблица */}
        {(role === 'teacher' || role === 'admin') && (
          <>
            <section>
              <h2>Добавить экзамен</h2>
              <form onSubmit={handleAddExam} className="exam-form" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem'}}>
                <input name="class" value={form.class} onChange={handleFormChange} placeholder="Класс (например, 10A)" required />
                <input name="subject" value={form.subject} onChange={handleFormChange} placeholder="Предмет" required />
                <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
                <input name="time" type="time" value={form.time} onChange={handleFormChange} required />
                <input name="students" value={form.students} onChange={handleFormChange} placeholder="Ученики (через запятую)" style={{gridColumn: '1 / -1'}} />
                <button type="submit" style={{gridColumn: '1 / -1'}}>➕ Добавить</button>
              </form>
            </section>

            <section>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h2 style={{margin: 0}}>Все экзамены</h2>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <input 
                    type="text" 
                    placeholder="🔍 Поиск..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{width: '200px'}}
                  />
                  <button onClick={exportToCSV}>💾 Экспорт CSV</button>
                </div>
              </div>
              <div className="table-wrap">
                <table className="exam-table">
                  <thead>
                    <tr>
                      <th>Класс</th>
                      <th>Предмет</th>
                      <th>Дата</th>
                      <th>Время</th>
                      <th>Преподаватель</th>
                      <th>Ученики</th>
                      <th>Оценки</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map(exam => (
                      <tr key={exam.id}>
                        <td>
                          <input value={exam.class} onChange={e => handleExamEdit(exam.id, 'class', e.target.value)} style={{width: '80px'}} />
                        </td>
                        <td>
                          <input value={exam.subject} onChange={e => handleExamEdit(exam.id, 'subject', e.target.value)} style={{width: '120px'}} />
                        </td>
                        <td>
                          <input type="date" value={exam.date} onChange={e => handleExamEdit(exam.id, 'date', e.target.value)} style={{width: '120px'}} />
                        </td>
                        <td>
                          <input type="time" value={exam.time} onChange={e => handleExamEdit(exam.id, 'time', e.target.value)} style={{width: '90px'}} />
                        </td>
                        <td>
                          <input value={exam.teacher} onChange={e => handleExamEdit(exam.id, 'teacher', e.target.value)} style={{width: '120px'}} />
                        </td>
                        <td>
                          <input value={exam.students.join(', ')} onChange={e => handleExamEdit(exam.id, 'students', e.target.value)} style={{width: '180px'}} />
                        </td>
                        <td>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                            {exam.students.map(student => (
                              <div key={student} style={{display: 'flex', gap: '4px', alignItems: 'center', fontSize: '0.9em'}}>
                                <span style={{minWidth: '60px'}}>{student}:</span>
                                <input 
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  value={exam.grades[student] || ''} 
                                  onChange={e => handleGradeChange(exam.id, student, e.target.value)}
                                  placeholder="—"
                                  style={{width: '50px', padding: '2px 4px'}}
                                />
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <button onClick={() => { setDeleteTarget(exam); setShowConfirm(true); }} style={{fontSize: '0.85em', padding: '0.3em 0.6em'}}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* Для админа можно добавить отдельные функции позже */}
        {role === 'admin' && (
          <section>
            <h2>Админ-панель</h2>
            <p>Управление пользователями и экзаменами будет добавлено позже.</p>
          </section>
        )}
      </main>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-heading">
          <div className="modal" role="document">
            <h3 id="confirm-heading">Подтвердите удаление</h3>
            <p>Вы уверены, что хотите удалить экзамен "{deleteTarget?.subject}" ({deleteTarget?.class})?</p>
            <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem'}}>
              <button onClick={() => { setShowConfirm(false); setDeleteTarget(null); }} style={{background: 'transparent', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--text)'}}>Отмена</button>
              <button onClick={() => { setExams(es => es.filter(x => x.id !== deleteTarget.id)); setShowConfirm(false); setDeleteTarget(null); }}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;