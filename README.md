Ниже — обновлённая версия описания проекта **без Firebase**, **без экспорта в Excel**, только с локальным backend (Node.js + MongoDB).

---

# 🎓 AIU Schedule System

Система управления расписанием и экзаменами университета

Полноценная веб-система для управления экзаменами и расписанием с общей серверной базой данных.

---

# ✨ Возможности

## 📝 Экзамены

* Добавление, редактирование, удаление экзаменов
* Типы: Экзамен / Зачёт / Курсовая
* Выставление оценок (0–100)
* Цветовая индикация (красный <50, зелёный ≥50)
* Уведомления о близких экзаменах
* Статистика для студентов
* Экспорт в CSV

---

## 📅 Расписание занятий

* Импорт расписания через админ-панель
* Фильтрация по дням недели и группам
* Автоматическая сортировка по времени
* Отображение в виде карточек
* Экспорт в CSV

---

## 👥 Роли пользователей

* **Студент** — просмотр экзаменов, оценок, расписания
* **Преподаватель** — создание экзаменов, выставление оценок
* **Администратор** — загрузка расписания, полный доступ

---

## 🎨 Интерфейс

* Адаптивный дизайн
* Светлая/тёмная тема
* Печать расписания
* Плавные анимации

---

# 🚀 Быстрый старт

## 1. Установка

```bash
git clone <repo_url>
cd aiu-schedule
```

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

---

## 2. Запуск

### Запуск backend

```bash
cd backend
npm run dev
```

Сервер будет доступен на:

```
http://localhost:3001
```

### Запуск frontend

```bash
cd frontend
npm run dev
```

Откройте:

```
http://localhost:5173
```

---

# 🗄 База данных

Используется **MongoDB (локальная установка или MongoDB Atlas)**.

Подключение в `backend/index.js`:

```js
mongoose.connect('mongodb://localhost:27017/aiu_schedule');
```

---

# 📦 Структура базы данных

## Коллекция `exams`

```json
{
  "group": "COMSE-25",
  "subject": "Programming Language 2",
  "date": "2026-02-10",
  "time": "10:00",
  "room": "BIGLAB",
  "teacher": "Azhar Kazakbaeva",
  "type": "Экзамен",
  "semester": "Spring 2025-2026",
  "students": ["Student 1"],
  "grades": {
    "Student 1": 85
  },
  "createdAt": "2026-01-15T10:00:00Z"
}
```

---

## Коллекция `schedule`

```json
{
  "classes": [
    {
      "day": "Понедельник",
      "group": "COMSE-25",
      "time": "10:00-10:40",
      "subject": "Calculus 2",
      "teacher": "Hussien Chebsi",
      "room": "B107"
    }
  ],
  "groups": ["COMSE-25"],
  "semester": "Spring 2025-2026",
  "uploadDate": "2026-01-15T10:00:00Z"
}
```

---

## Коллекция `users`

```json
{
  "name": "Student Name",
  "login": "student",
  "password": "hashed_password",
  "role": "student",
  "group": "COMSE-25",
  "email": "student@aiu.edu",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

# 🔐 Аутентификация (JWT)

Backend использует JWT:

```js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
```

### Регистрация

```js
app.post('/api/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({ ...req.body, password: hashedPassword });
  await user.save();
  res.json({ success: true });
});
```

### Логин

```js
app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ login: req.body.login });
  if (!user) return res.status(400).json({ error: 'User not found' });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

  const token = jwt.sign({ id: user._id, role: user.role }, 'SECRET_KEY');
  res.json({ token, user });
});
```

---

# 🌐 Деплой

## Frontend

* Vercel
* Netlify

## Backend

* Render
* Railway

## База данных

* MongoDB Atlas

---

# ⚠️ Убрано

* ❌ Firebase
* ❌ Firestore
* ❌ Excel экспорт
* ❌ Firebase Auth

Система полностью работает через локальный Node.js backend + MongoDB.

---

# 📝 Лицензия

MIT License

---
