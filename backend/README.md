# Task Manager — Backend API

REST API for a task management application with JWT authentication, user-scoped tasks, search/filter/pagination, and dashboard statistics.

## Tech Stack

- **Node.js** + **Express 5**
- **MongoDB** + **Mongoose**
- **JWT** authentication
- **express-validator** for input validation

## Project Structure

```
backend/
├── config/          # Database connection
├── controllers/     # HTTP request/response handlers
├── middleware/      # Auth, validation, error handling
├── models/          # Mongoose schemas (User, Task)
├── routes/          # Route definitions
├── services/        # Business logic layer
├── utils/           # Shared utilities (AppError, constants)
└── tests/           # Integration tests
```

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Variable         | Description                   |
|------------------|-------------------------------|
| `PORT`           | Server port (default: 5000)   |
| `MONGO_URI`      | MongoDB connection string     |
| `JWT_SECRET`     | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d)    |
| `CLIENT_URL`     | Frontend origin for CORS      |
| `NODE_ENV`       | `development` or `production` |

### 3. Run the server

```bash
npm run dev    # development with hot reload
npm start      # production
npm test       # run integration tests
```

Server runs at `http://localhost:5000`.

## Architecture & Design Decisions

### User isolation

All task operations are scoped to the authenticated user at the **database query level**:

```js
Task.findOne({ _id: taskId, user: req.user._id })
```

Even if a task ID is guessed, another user's data cannot be accessed or modified.

### Authentication

- Passwords are hashed with **bcrypt** before storage (`select: false` on the password field).
- Protected routes require `Authorization: Bearer <token>`.
- JWT payload contains the user ID; the user is re-fetched from DB on each request.

### Layered architecture

```
Request → Route → Middleware → Controller → Service → Model → Database
```

Controllers handle HTTP; services contain business logic; models define schema and data access.

---

## API Reference

Base URL: `/api`

### Health

| Method | Endpoint  | Auth | Description         |
|--------|-----------|------|---------------------|
| GET    | `/health` | No   | Server and DB status |

### Auth

| Method | Endpoint         | Auth | Description        |
|--------|------------------|------|--------------------|
| POST   | `/auth/register` | No   | Create account     |
| POST   | `/auth/login`    | No   | Sign in            |
| GET    | `/auth/me`       | Yes  | Current user profile |

#### POST `/auth/register`

**Body:** `{ "name", "email", "password" }` (password min 6 chars)

**Response (201):** `{ "_id", "name", "email", "token" }`

#### POST `/auth/login`

**Body:** `{ "email", "password" }`

**Response (200):** `{ "_id", "name", "email", "token" }`

---

### Tasks

All task routes require `Authorization: Bearer <token>`.

| Method | Endpoint       | Description               |
|--------|----------------|---------------------------|
| GET    | `/tasks/stats` | Dashboard statistics      |
| GET    | `/tasks`       | List tasks with filters   |
| GET    | `/tasks/:id`   | Get single task           |
| POST   | `/tasks`       | Create task               |
| PUT    | `/tasks/:id`   | Update task (partial)     |
| DELETE | `/tasks/:id`   | Delete task               |

#### GET `/tasks` query parameters

| Param      | Default     | Description                                       |
|------------|-------------|---------------------------------------------------|
| `search`   | —           | Case-insensitive title search                     |
| `status`   | —           | `Pending`, `In Progress`, `Completed`             |
| `priority` | —           | `Low`, `Medium`, `High`                           |
| `page`     | 1           | Page number                                       |
| `limit`    | 10          | Items per page (max 100)                          |
| `sortBy`   | `createdAt` | `createdAt`, `dueDate`, `title`, `priority`       |
| `order`    | `desc`      | `asc` or `desc`                                   |

#### POST `/tasks`

**Body:** `title` (required), `description`, `status`, `priority`, `dueDate` (optional)

#### GET `/tasks/stats`

**Response (200):** `{ "total", "pending", "inProgress", "completed" }`

---

## Error Responses

| Status | Meaning                                            |
|--------|----------------------------------------------------|
| 400    | Validation error or invalid ID                     |
| 401    | Missing or invalid token                           |
| 404    | Resource not found                                 |
| 500    | Internal server error (details hidden in production)|

---

## Database Schema

### User

| Field    | Type   | Notes                         |
|----------|--------|-------------------------------|
| name     | String | Required                      |
| email    | String | Unique, lowercase             |
| password | String | Hashed, excluded from queries |

### Task

| Field       | Type     | Notes                           |
|-------------|----------|---------------------------------|
| user        | ObjectId | Ref to User, indexed            |
| title       | String   | Required, max 150 chars         |
| description | String   | Max 2000 chars                  |
| status      | Enum     | Pending, In Progress, Completed   |
| priority    | Enum     | Low, Medium, High               |
| dueDate     | Date     | Optional                        |

**Indexes:** `{ user, createdAt }`, `{ user, status }`, `{ user, priority }` for efficient filtered queries.
