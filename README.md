# 📋 Task Manager Application

A full-stack task management system built with React, Node.js/Express, and PostgreSQL. Features secure task workflows, search, filtering, pagination, progress tracking, and admin controls.

---

## ✨ Features

- ✅ CRUD Operations — Create, read, update, and delete tasks
- ✅ Task Status — Mark tasks as pending or completed
- ✅ Search & Filter — Search by title or description, filter by status
- ✅ Pagination — Navigate with Previous / Next controls
- ✅ Task Views — Dashboard, Pending Tasks, and Completed Tasks
- ✅ Progress Tracking — Visual completion status and counts
- ✅ Recent Activity — Shows latest task activity
- ✅ Responsive Design — Desktop, tablet, and mobile friendly
- ✅ Authentication — Secure login, registration, and protected routes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18.2.0, Webpack 5, React Router 6 |
| Backend | Node.js, Express 4.22.1 |
| Database | PostgreSQL |
| Styling | CSS |

---

## 📋 Prerequisites

Before running the project, ensure you have:

- Node.js v14 or higher
- npm installed
- PostgreSQL running and configured

---

## 🚀 Quick Start

### 1. Install Dependencies

#### Backend
```powershell
cd "c:\Users\Dell\OneDrive\Desktop\menegsystem\taskmanage\New folder\Backend"
npm install
```

#### Frontend
```powershell
cd "c:\Users\Dell\OneDrive\Desktop\menegsystem\taskmanage\New folder\Frontend"
npm install
```

### 2. Run Backend (Terminal 1)

```powershell
cd "c:\Users\Dell\OneDrive\Desktop\menegsystem\taskmanage\New folder\Backend"
npm start
```

Expected output:

- `Server running on http://localhost:3001`
- `Database initialized successfully`

### 3. Run Frontend (Terminal 2)

```powershell
cd "c:\Users\Dell\OneDrive\Desktop\menegsystem\taskmanage\New folder\Frontend"
npm run dev
```

Expected output:

- `[webpack-dev-server] Project is running at:`
- `[webpack-dev-server] Loopback: http://localhost:3005/`

### 4. Open Application

Open browser:

- `http://localhost:3005`

---

## 📖 How to Use

### Dashboard Tab

- View all tasks with pagination
- See statistics for total, pending, and completed tasks
- Add new tasks with the ➕ button
- Edit selected tasks with the ✏️ button
- Delete selected tasks with the 🗑️ button

### Search & Filter

- Search Box: Type to search tasks by title or description
- Status Filter: Choose All, Pending, or Completed
- Date Filter: Select a specific date to filter tasks
- Clear Filters: Reset filters with a button

### Pagination

- Click `Next ›` to go to the next page
- Click `‹ Previous` to go to the previous page
- Page counter shows `Page X of Y`

### Task Status

- Select a task to update status or delete it
- Use action buttons for quick status changes

### Pending Tasks Tab

- View only pending tasks
- Add, edit, or delete tasks
- Pagination is available

### Completed Tasks Tab

- View only completed tasks
- See completion counts
- Revert completed tasks to pending if needed

### Progress Bar

- Shows completion percentage
- Displays total, pending, and completed counts
- Provides visual progress feedback

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all tasks with pagination and filters |
| GET | `/api/tasks?page=2` | Get a specific page of tasks |
| GET | `/api/tasks/pending` | Get pending tasks only |
| GET | `/api/tasks/completed` | Get completed tasks only |
| GET | `/api/tasks/recent` | Get the most recent tasks |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Authentication

- `POST /api/users/register` — Register a new user
- `POST /api/users/login` — Log in and receive a JWT
- `GET /api/users/me` — Get authenticated user data

> All `/api/tasks` routes require `Authorization: Bearer <token>`.

### Example Request

```bash
curl "http://localhost:3001/api/tasks?page=1&limit=5"
```

### Example Response

```json
{
  "totalTasks": 10,
  "currentPage": 1,
  "totalPages": 2,
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "status": "pending",
      "created_at": "2026-01-29T10:00:00Z"
    }
  ]
}
```

---

## 🗂️ Project Structure

```
taskmanage/
├── README.md
└── New folder/
    ├── Backend/
    │   ├── config/
    │   │   └── db.js          # PostgreSQL connection
    │   ├── controllers/
    │   │   ├── taskController.js
    │   │   └── userController.js
    │   ├── middleware/
    │   │   └── authMiddleware.js
    │   ├── models/
    │   │   └── userModel.js
    │   ├── routes/
    │   │   ├── taskRoutes.js
    │   │   └── userRoutes.js
    │   ├── services/
    │   ├── reset-users-table.js
    │   ├── server.js
    │   └── package.json
    └── Frontend/
        ├── public/
        │   └── index.html
        ├── src/
        │   ├── components/
        │   │   ├── Dashboard.js
        │   │   ├── PendingTasks.js
        │   │   ├── CompletedTasks.js
        │   │   ├── ProgressBar.js
        │   │   ├── RecentActivity.js
        │   │   ├── TaskCard.js
        │   │   ├── AddTaskModal.js
        │   │   ├── EditTaskModal.js
        │   │   └── DeleteTaskModal.js
        │   ├── services/
        │   │   ├── api.js
        │   │   └── authService.js
        │   ├── App.js
        │   ├── index.js
        │   └── styles/
        ├── webpack.config.js
        └── package.json
```

---

## ✅ Verified Features

- ✅ Backend API responding
- ✅ Frontend serving React app
- ✅ Both servers running together
- ✅ Database connected successfully
- ✅ Add/Edit/Delete tasks working
- ✅ Pagination and filters working
- ✅ Status filtering working correctly
- ✅ Progress tracking displayed
- ✅ Responsive layout

---

## 📊 Sample Data

This project provides ready-to-use task functionality. Add sample tasks through the UI to verify live counts and progress.

---

## 🎯 Development Tips

### Hot Reload
Frontend uses Webpack dev server with hot reload. Changes refresh instantly.

### API Testing
Use curl or Postman:

```bash
curl "http://localhost:3001/api/tasks?page=1&limit=5"
```

### Database Inspection
Inspect PostgreSQL with:

```sql
SELECT * FROM tasks WHERE status = 'pending';
SELECT COUNT(*) FROM tasks WHERE status = 'completed';
```

---

## 📝 Notes

- Default frontend port: `3005`
- Default backend port: `3001`
- Pagination is 1-indexed
- Timestamps are in UTC
- If using a custom `PORT`, update your `.env` accordingly

---

## 🎉 Status

✅ Functional task manager application with authentication and task workflows.
