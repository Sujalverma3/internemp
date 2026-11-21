# InterneMP - Intern Management Portal

A full-stack intern management portal built with **Node.js + Express** (backend) and **React + Vite + Tailwind CSS** (frontend).

---

## Project Structure

```
internemp/
  backend/         Node.js + Express REST API (lowdb file-based JSON DB)
  frontend/        React + Vite + Tailwind CSS
  README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+ (https://nodejs.org)
- npm 9+

### 1. Install and Run the Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on **http://localhost:3001**

### 2. Install and Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on **http://localhost:5173**

---

## Demo Credentials

| Role   | Email                  | Password  |
|--------|------------------------|-----------|
| Admin  | admin@internemp.com    | admin123  |
| Intern | intern@internemp.com   | intern123 |
| Intern | arjun@internemp.com    | intern123 |
| Intern | priya@internemp.com    | intern123 |

---

## Features

### Admin Panel
- **Dashboard** - Stats overview (interns, tasks, attendance, announcements) with task completion rate
- **Interns** - Full CRUD: add, edit, delete interns. Search and filter by status
- **Tasks** - Create, edit, and delete tasks; filter by status and intern
- **Attendance** - View today's or full history of attendance records; filter by date and intern
- **Announcements** - Post and delete announcements

### Intern Portal
- **Dashboard** - Personal stats, check-in/check-out, recent tasks and announcements
- **My Tasks** - View assigned tasks, update status (pending to in-progress to completed)
- **My Attendance** - Check in/out and view full personal attendance history

---

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Backend   | Node.js, Express, lowdb (JSON file DB), jsonwebtoken |
| Frontend  | React 18, Vite, React Router v6, Axios, Tailwind CSS |
| Auth      | JWT (24h expiry), role-based (admin/intern)         |

---

## API Endpoints

| Method | Endpoint                     | Auth  | Description                     |
|--------|------------------------------|-------|---------------------------------|
| POST   | /api/auth/login              | -     | Login, get JWT                  |
| GET    | /api/interns                 | JWT   | List all interns                |
| POST   | /api/interns                 | Admin | Create intern                   |
| PUT    | /api/interns/:id             | Admin | Update intern                   |
| DELETE | /api/interns/:id             | Admin | Delete intern                   |
| GET    | /api/tasks                   | JWT   | Get tasks (filtered for intern) |
| POST   | /api/tasks                   | Admin | Create task                     |
| PUT    | /api/tasks/:id               | JWT   | Update task status              |
| DELETE | /api/tasks/:id               | Admin | Delete task                     |
| GET    | /api/attendance              | JWT   | Today's attendance              |
| GET    | /api/attendance?history=true | JWT   | Full attendance history         |
| POST   | /api/attendance/checkin      | JWT   | Check in                        |
| POST   | /api/attendance/checkout     | JWT   | Check out                       |
| GET    | /api/announcements           | JWT   | List announcements              |
| POST   | /api/announcements           | Admin | Create announcement             |
| DELETE | /api/announcements/:id       | Admin | Delete announcement             |