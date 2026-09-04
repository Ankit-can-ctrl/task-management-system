# Task Management System

A full-stack task manager, you can register, log in, and manage your own tasks — create them, update status and priority, search, filter, and see a simple dashboard with counts for pending, in-progress, and completed work.

The frontend is a React app with Tailwind CSS. The backend is a REST API on Express with MongoDB and JWT auth. Each user only sees and edits their own tasks; that scoping happens at the database query level, not just in the UI.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT
- **Tests:** Jest + Supertest (backend)

## Getting started

You'll need Node.js (v18+) and a MongoDB database. A free [MongoDB Atlas](https://cloud.mongodb.com) cluster works fine.

### 1. Clone and install

```bash
git clone https://github.com/Ankit-can-ctrl/task-management-system.git
cd task-management-system

cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment setup

**Backend** — copy the example env and fill in your values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=some_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run both apps

Open two terminals:

**Terminal 1 — Backend**

```bash
cd backend
npm run dev
```

You should see `Server running on port 5000` and a MongoDB connected message.

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Register a new account, and you'll land on the dashboard.

### 4. Run backend tests (optional)

```bash
cd backend
npm test
```

Tests use an in-memory MongoDB instance, so you don't need Atlas running for them.

## Project structure

```
task-management-system/
├── backend/          # Express API, models, services, tests
├── frontend/         # React app (pages, components, API client)
└── README.md         # this file
```

## API documentation

All endpoints, request/response shapes, and design notes are documented in **[backend/README.md](backend/README.md)**. That covers auth, task CRUD, filters, pagination, and the stats endpoint.

Quick reference:

| What             | Where                                              |
| ---------------- | -------------------------------------------------- |
| Health check     | `GET /api/health`                                  |
| Register / Login | `POST /api/auth/register`, `POST /api/auth/login`  |
| Tasks            | `GET/POST /api/tasks`, `PUT/DELETE /api/tasks/:id` |
| Dashboard stats  | `GET /api/tasks/stats`                             |

Protected routes need `Authorization: Bearer <token>` in the header.
