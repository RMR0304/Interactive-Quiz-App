## Quiz App (MERN) - MVP

React (Vite + Tailwind) frontend and Node.js (Express + MongoDB + Mongoose) backend with JWT auth and roles. Teachers create quizzes; students take quizzes and results are stored.

### Tech
- Frontend: React 18, Vite 5, Tailwind CSS, React Router, Axios
- Backend: Node 18+, Express, Mongoose, JWT, bcryptjs
- DB: MongoDB (local)
- Ports: backend 5000, frontend 5173

---

## Project Structure

- `backend/`: API server
- `frontend/`: React app

---

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (default URI `mongodb://127.0.0.1:27017/quiz_app`)

---

## Setup

1) Backend
- Copy `backend/.env.example` to `backend/.env` and adjust if needed.
- Install deps:  
  `cd backend && npm install`
- Seed database (creates teacher, student, and a sample 10-question quiz):  
  `npm run seed`
- Run dev server:  
  `npm run dev`  
  API: `http://localhost:5000/api`

2) Frontend
- Copy `frontend/.env.example` to `frontend/.env` (ensure `VITE_API_URL=http://localhost:5000`).
- Install deps:  
  `cd ../frontend && npm install`
- Start dev server:  
  `npm run dev`  
  App: `http://localhost:5173`

---

## Seed Data

`cd backend && npm run seed`

Creates:
- Teacher: `teacher@example.com` / `password123`
- Student: `student@example.com` / `password123`
- Quiz: "General Knowledge Quiz" (10 questions)

---

## Usage

- Login as student to take the quiz and submit answers.
- Login as teacher to create quizzes via the Teacher Panel.

Role rules:
- `POST /api/quizzes` requires `teacher` or `admin`.
- Getting quiz by id hides correct answers for students.
- Submitting results computes per-question correctness and score.

---

## API Overview

- `POST /api/auth/register` { name, email, password, role? }
- `POST /api/auth/login` { email, password }
- `GET /api/quizzes`
- `GET /api/quizzes/:id` (auth; students do not receive answers)
- `POST /api/quizzes` (auth: teacher/admin)
- `POST /api/results/submit/:quizId` (auth)
- `GET /api/results/me` (auth)
- `GET /api/results/quiz/:quizId` (auth: teacher/admin)

Authorization: `Authorization: Bearer <token>`

---

## Production Build

Frontend:
- `cd frontend`
- `npm run build`
- Static output in `dist/`. Use any static file server (e.g. `vite preview`).

Backend:
- `cd backend`
- `npm run start` (ensure `.env` is configured)

---

## Tests (Backend)

- Simple integration test: register, login, create quiz, submit result.
- Uses `mongodb-memory-server`.

Run:
```
cd backend
npm test
```

---

## Security Notes

- Passwords hashed with `bcryptjs`.
- JWT signed with expiration (`JWT_EXPIRES_IN`, default 1d).
- Protected routes validate JWT.
- CORS restricted to `http://localhost:5173` by default (configure `CORS_ORIGIN`).

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy:**
- Backend: Deploy to Render/Railway
- Frontend: Deploy to Vercel/Netlify
- Database: Use MongoDB Atlas (free tier)

---

## How to run locally (commands)

1) Backend (Windows PowerShell):
```
cd "C:\\Users\\ASUS\\OneDrive\\Desktop\\Coding\\Quiz App\\backend"
npm install
copy .env.example .env
npm run seed
npm run dev
```
Backend at `http://localhost:5000`

2) Frontend:
```
cd "C:\\Users\\ASUS\\OneDrive\\Desktop\\Coding\\Quiz App\\frontend"
npm install
copy .env.example .env
npm run dev
```
Frontend at `http://localhost:5173`

Seed again anytime:
```
cd "C:\\Users\\ASUS\\OneDrive\\Desktop\\Coding\\Quiz App\\backend"
npm run seed
```

- Teacher login: `teacher@example.com` / `password123`
- Student login: `student@example.com` / `password123`

Build frontend for production:
```
cd "C:\\Users\\ASUS\\OneDrive\\Desktop\\Coding\\Quiz App\\frontend"
npm run build
npm run preview
```

Run backend in production:
```
cd "C:\\Users\\ASUS\\OneDrive\\Desktop\\Coding\\Quiz App\\backend"
npm run start
```

Run backend tests:
```
cd "C:\\Users\\ASUS\\OneDrive\\Desktop\\Coding\\Quiz App\\backend"
npm test
```



# Interactive-Quiz-App
# Interactive-Quiz-App
