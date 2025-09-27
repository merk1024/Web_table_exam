import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

// Пример структуры пользователей с паролями
const users = [
  { id: 1, name: 'Иван', role: 'student', login: 'ivan', password: '1234' },
  { id: 2, name: 'Мария', role: 'teacher', login: 'maria', password: '5678' },
  { id: 3, name: 'Админ', role: 'admin', login: 'admin', password: 'admin' },
];

// Пример структуры экзаменов
const initialExams = [
  { id: 1, class: '10A', subject: 'Математика', date: '2025-10-10', time: '10:00', teacher: 'Мария', students: ['Иван'] },
  { id: 2, class: '10A', subject: 'Физика', date: '2025-10-12', time: '12:00', teacher: 'Мария', students: ['Иван'] },
];

function App() {
  const [role, setRole] = useState(users[0].role);
  const [user, setUser] = useState(users[0]);
  const [exams, setExams] = useState(initialExams);
  // Тема: light или dark
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

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
  const [filterClass, setFilterClass] = useState('all');

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
        id: exams.length + 1,
        class: form.class,
        subject: form.subject,
        date: form.date,
        time: form.time,
        teacher: user.name,
        students: form.students.split(',').map(s => s.trim()).filter(Boolean),
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

  // Если не авторизован — показываем форму логина
  if (!authUser) {
    return (
      <div className="container" style={{maxWidth: 400, marginTop: '5rem'}}>
        <h2 style={{textAlign: 'center'}}>Вход в систему</h2>
        <div style={{marginBottom: '1.5rem', fontSize: '0.95rem', color: '#555'}}>
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

  return (
    <div className="container">
      <header>
        <h1>Расписание экзаменов</h1>
        <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
          <p style={{margin:0}}>Пользователь: <b>{user.name}</b> ({role})</p>
          <button className="logout-btn" onClick={() => { setAuthUser(null); setUser(null); setRole(''); }}>Выйти</button>
          <button style={{marginLeft: '0.5rem'}} onClick={() => { const next = theme === 'light' ? 'dark' : 'light'; setTheme(next); localStorage.setItem('theme', next); }}>Тема: {theme === 'light' ? 'Светлая' : 'Тёмная'}</button>
        </div>
      </header>
      <main>
        {/* Расписание для ученика: карточки + сортировка + фильтр по классу */}
        {role === 'student' && (
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
              <button onClick={() => window.print()} style={{marginLeft: 'auto'}}>Печать расписания</button>
            </div>
            <div className="cards">
              {exams
                .filter(exam => exam.students.includes(user.name))
                .filter(exam => filterClass === 'all' || exam.class === filterClass)
                .slice()
                .sort((a,b) => (a.date + ' ' + a.time) > (b.date + ' ' + b.time) ? 1 : -1)
                .map(exam => (
                  <div className="card-exam" key={exam.id}>
                    <div className="card-row">
                      <div className="card-title">{exam.subject}</div>
                      <div className="card-meta">Класс: {exam.class}</div>
                    </div>
                    <div className="card-row">
                      <div className="card-date">{exam.date} • {exam.time}</div>
                      <div className="card-teacher">Преподаватель: {exam.teacher}</div>
                      {(role === 'teacher' || role === 'admin') && (
                        <button style={{marginLeft: '0.5rem'}} onClick={() => setExams(es => es.filter(x => x.id !== exam.id))}>Удалить</button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
        {/* Для препода и админа — форма добавления экзамена и таблица */}
        {(role === 'teacher' || role === 'admin') && (
          <section>
            <h2>Добавить экзамен</h2>
            <form onSubmit={handleAddExam} className="exam-form">
              <input name="class" value={form.class} onChange={handleFormChange} placeholder="Класс (например, 10A)" required />
              <input name="subject" value={form.subject} onChange={handleFormChange} placeholder="Предмет" required />
              <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
              <input name="time" type="time" value={form.time} onChange={handleFormChange} required />
              <input name="students" value={form.students} onChange={handleFormChange} placeholder="Ученики (через запятую)" />
              <button type="submit">Добавить</button>
            </form>
            <h2>Все экзамены (редактируемая таблица)</h2>
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
                  </tr>
                </thead>
                <tbody>
                  {exams.map(exam => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {/* Для админа можно добавить отдельные функции позже */}
        {role === 'admin' && (
          <section>
            <h2>Админ-панель</h2>
            <p>Управление пользователями и экзаменами будет добавлено позже.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
