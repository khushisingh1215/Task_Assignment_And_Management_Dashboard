const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Route definitions - connecting endpoints to controller functions and frontend components

// GET /api/tasks - Get all tasks (used by Dashboard component)
router.get('/', taskController.getAllTasks);

// GET /api/tasks/pending - Get pending tasks (used by PendingTasks component)
router.get('/pending', taskController.getPendingTasks);

// GET /api/tasks/completed - Get completed tasks (used by CompletedTasks component)
router.get('/completed', taskController.getCompletedTasks);

// GET /api/tasks/recent - Get recent activity (used by Dashboard and RecentActivity components)
router.get('/recent', taskController.getRecentTasks);

// POST /api/tasks - Create a new task (used by AddTaskModal component)
router.post('/', taskController.createTask);

// PUT /api/tasks/:id - Update a task (used by TaskCard component)
router.put('/:id', taskController.updateTask);

// DELETE /api/tasks/:id - Delete a task (used by TaskCard component)
router.delete('/:id', taskController.deleteTask);

module.exports = router;
