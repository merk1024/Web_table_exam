# 🎓 AIU Schedule System - Система управления расписанием

Полноценная система управления расписанием и экзаменами для университета/колледжа.

## ✨ Возможности

### 📝 Экзамены
- ✅ Добавление, редактирование, удаление экзаменов
- ✅ Типы: Экзамен / Зачёт / Курсовая
- ✅ Выставление оценок (0-100 баллов)
- ✅ Цветовая индикация (красный <50, зелёный ≥50)
- ✅ Уведомления о близких экзаменах (за 1-3 дня)
- ✅ Статистика для студентов
- ✅ Экспорт в CSV

### 📅 Расписание занятий
- ✅ Импорт из Excel (.xlsx)
- ✅ Фильтры по дням недели и группам
- ✅ Красивые карточки с занятиями
- ✅ Автоматическая сортировка по дням и времени
- ✅ Экспорт расписания в CSV

### 👥 Роли пользователей
- **Студент** - видит свои экзамены, расписание, оценки
- **Преподаватель** - добавляет экзамены, выставляет оценки
- **Администратор** - загружает расписание, полный доступ

### 🎨 Интерфейс
- ✅ Адаптивный дизайн (телефоны, планшеты, компьютеры)
- ✅ Тёмная/светлая тема
- ✅ Плавные анимации
- ✅ Печать расписания

## 🚀 Быстрый старт

### 1. Установка

\`\`\`bash
# Клонировать проект
git clone <your-repo>
cd aiu-schedule

# Установить зависимости
npm install

# Для импорта Excel установить дополнительно:
npm install xlsx
\`\`\`

### 2. Запуск

\`\`\`bash
npm run dev
\`\`\`

Откройте http://localhost:5173

### 3. Тестовые аккаунты

| Роль | Логин | Пароль | Группа |
|------|-------|--------|--------|
| Студент | student | 1234 | COMSE-25 |
| Преподаватель | teacher | 5678 | - |
| Администратор | admin | admin | - |

## 📦 Текущая база данных (localStorage)

Сейчас система использует **localStorage** браузера для хранения данных:

```javascript
// Данные хранятся локально в браузере каждого пользователя
localStorage.setItem('exams_db', JSON.stringify(exams))
localStorage.setItem('schedule_db', JSON.stringify(schedule))
```

### ⚠️ Ограничения localStorage:
- ❌ Данные доступны только в одном браузере
- ❌ У каждого пользователя своя копия данных
- ❌ Нет синхронизации между устройствами
- ❌ Можно легко потерять данные (очистка кэша)

## 🔥 Как сделать ОБЩУЮ базу данных

Для того чтобы все преподаватели и администрация работали с одной БД, нужен **backend сервер**.

### Вариант 1: Node.js + MongoDB (рекомендуется)

#### 1.1. Установить MongoDB

```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Windows - скачать с mongodb.com
```

#### 1.2. Создать backend сервер

Создайте папку `server/` и файл `server/index.js`:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/aiu_schedule', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Схема экзамена
const examSchema = new mongoose.Schema({
  group: String,
  subject: String,
  date: String,
  time: String,
  room: String,
  teacher: String,
  type: String,
  semester: String,
  students: [String],
  grades: Object,
  createdAt: { type: Date, default: Date.now }
});

const Exam = mongoose.model('Exam', examSchema);

// Схема расписания
const scheduleSchema = new mongoose.Schema({
  classes: Array,
  groups: [String],
  totalClasses: Number,
  semester: String,
  uploadDate: Date
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

// API endpoints

// Получить все экзамены
app.get('/api/exams', async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить экзамен
app.post('/api/exams', async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.json(exam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Обновить экзамен
app.put('/api/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(exam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Удалить экзамен
app.delete('/api/exams/:id', async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Получить расписание
app.get('/api/schedule', async (req, res) => {
  try {
    const schedule = await Schedule.findOne().sort({ uploadDate: -1 });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Загрузить расписание
app.post('/api/schedule', async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(\`✅ Server running on http://localhost:\${PORT}\`);
});
```

#### 1.3. Установить зависимости сервера

```bash
cd server
npm init -y
npm install express mongoose cors
```

#### 1.4. Запустить сервер

```bash
node index.js
```

#### 1.5. Изменить frontend для работы с API

В вашем `App.jsx` замените localStorage на API вызовы:

```javascript
// Вместо:
useEffect(() => {
  const saved = localStorage.getItem('exams_db');
  if (saved) setExams(JSON.parse(saved));
}, []);

// Используйте:
useEffect(() => {
  fetch('http://localhost:3001/api/exams')
    .then(res => res.json())
    .then(data => setExams(data))
    .catch(err => console.error(err));
}, []);

// Вместо:
setExams([...exams, newExam]);

// Используйте:
fetch('http://localhost:3001/api/exams', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newExam)
})
  .then(res => res.json())
  .then(exam => setExams([...exams, exam]));
```

### Вариант 2: Firebase (проще для начинающих)

#### 2.1. Создать проект в Firebase

1. Зайти на https://console.firebase.google.com
2. Создать новый проект
3. Настроить Firestore Database

#### 2.2. Установить Firebase

```bash
npm install firebase
```

#### 2.3. Настроить Firebase

Создайте `src/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

#### 2.4. Использовать в App.jsx

```javascript
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Загрузить экзамены
useEffect(() => {
  const loadExams = async () => {
    const snapshot = await getDocs(collection(db, 'exams'));
    const examsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setExams(examsData);
  };
  loadExams();
}, []);

// Добавить экзамен
const handleAddExam = async (e) => {
  e.preventDefault();
  const docRef = await addDoc(collection(db, 'exams'), newExam);
  setExams([...exams, { id: docRef.id, ...newExam }]);
};

// Обновить экзамен
const handleExamEdit = async (id, field, value) => {
  const examRef = doc(db, 'exams', id);
  await updateDoc(examRef, { [field]: value });
  setExams(exams.map(exam => exam.id === id ? { ...exam, [field]: value } : exam));
};

// Удалить экзамен
const handleDelete = async (id) => {
  await deleteDoc(doc(db, 'exams', id));
  setExams(exams.filter(exam => exam.id !== id));
};
```

### Вариант 3: Supabase (PostgreSQL + готовый backend)

#### 3.1. Создать проект на https://supabase.com

#### 3.2. Установить

```bash
npm install @supabase/supabase-js
```

#### 3.3. Настроить

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Загрузить экзамены
const { data, error } = await supabase.from('exams').select('*');

// Добавить экзамен
const { data, error } = await supabase.from('exams').insert([newExam]);

// Обновить экзамен
const { data, error } = await supabase.from('exams').update({ ...updates }).eq('id', examId);

// Удалить экзамен
const { data, error } = await supabase.from('exams').delete().eq('id', examId);
```

## 🔐 Добавление аутентификации

Для полноценной системы добавьте настоящую аутентификацию:

### С Firebase Auth:

```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();

const handleLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setUser(userCredential.user);
  } catch (error) {
    setLoginError(error.message);
  }
};
```

### С JWT на Node.js:

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Регистрация
app.post('/api/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({ ...req.body, password: hashedPassword });
  await user.save();
  res.json({ success: true });
});

// Логин
app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ login: req.body.login });
  if (!user) return res.status(400).json({ error: 'User not found' });
  
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
  
  const token = jwt.sign({ id: user._id, role: user.role }, 'SECRET_KEY');
  res.json({ token, user });
});
```

## 📊 Структура базы данных

### Коллекция `exams`:
```json
{
  "id": "unique_id",
  "group": "COMSE-25",
  "subject": "Programming Language 2",
  "date": "2026-02-10",
  "time": "10:00",
  "room": "BIGLAB",
  "teacher": "Azhar Kazakbaeva",
  "type": "Экзамен",
  "semester": "Spring 2025-2026",
  "students": ["Студент 1", "Студент 2"],
  "grades": {
    "Студент 1": 85,
    "Студент 2": 92
  },
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### Коллекция `schedule`:
```json
{
  "id": "unique_id",
  "classes": [
    {
      "id": 1,
      "day": "Понедельник",
      "group": "COMSE-25",
      "time": "10:00-10:40",
      "subject": "Calculus 2",
      "teacher": "Hussien Chebsi",
      "room": "B107"
    }
  ],
  "groups": ["COMSE-25", "COMCEH-24", ...],
  "totalClasses": 102,
  "semester": "Spring 2025-2026",
  "uploadDate": "2026-01-15T10:00:00Z"
}
```

### Коллекция `users`:
```json
{
  "id": "unique_id",
  "name": "Азамат Студентов",
  "login": "student",
  "password": "hashed_password",
  "role": "student",
  "group": "COMSE-25",
  "email": "student@alatoo.edu.kg",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

## 🌐 Деплой (размещение в интернете)

### Frontend (Vercel/Netlify - бесплатно):

```bash
# Vercel
npm install -g vercel
vercel

# Netlify
npm install -g netlify-cli
netlify deploy
```

### Backend (Railway/Render - бесплатно):

1. Зарегистрироваться на https://railway.app или https://render.com
2. Подключить GitHub репозиторий
3. Выбрать `server/` как root directory
4. Deploy!

### База данных:
- MongoDB Atlas - бесплатно до 512MB
- Firebase - бесплатно до 1GB
- Supabase - бесплатно до 500MB

## 📱 Мобильное приложение

Можно обернуть в React Native:

```bash
npx react-native init AIUScheduleApp
# Скопировать логику из App.jsx
```

Или использовать Capacitor для PWA:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
```

## 🤝 Поддержка

Возникли вопросы? 
<<<<<<< HEAD
- 📧 Email: erbolabdusaito@gmail.com
=======
>>>>>>> 50e777b7fadf760a334fdc51b7d2cc5b988d5dbf
- 💬 Telegram: @merk1024

## 📝 Лицензия

MIT License - используйте свободно!

---

Сделано с ❤️ для AIU
