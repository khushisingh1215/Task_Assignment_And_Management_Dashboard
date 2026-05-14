const {
  getTasks,
  getPendingTasks,
  getCompletedTasks,
  getRecentTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../models/taskModel');

const getAllTasks = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10, status = '' } = req.query;
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 10;

    const tasks = await getTasks({
      search,
      status,
      page: parsedPage,
      limit: parsedLimit,
    });

    res.json({
      tasks: tasks.tasks,
      totalTasks: tasks.total,
      currentPage: tasks.page,
      totalPages: Math.ceil(tasks.total / tasks.limit),
    });
  } catch (error) {
    next(error);
  }
};

const getPendingTasksController = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 10;

    const tasks = await getPendingTasks(parsedPage, parsedLimit);
    res.json({
      tasks: tasks.tasks,
      totalTasks: tasks.total,
      currentPage: tasks.page,
      totalPages: Math.ceil(tasks.total / tasks.limit),
    });
  } catch (error) {
    next(error);
  }
};

const getCompletedTasksController = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 10;

    const tasks = await getCompletedTasks(parsedPage, parsedLimit);
    res.json({
      tasks: tasks.tasks,
      totalTasks: tasks.total,
      currentPage: tasks.page,
      totalPages: Math.ceil(tasks.total / tasks.limit),
    });
  } catch (error) {
    next(error);
  }
};

const getRecentTasksController = async (req, res, next) => {
  try {
    const tasks = await getRecentTasks(10);
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

const createTaskController = async (req, res, next) => {
  try {
    const { title, description = '', assigned_user_id = null } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await createTask(title, description, assigned_user_id);
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

const updateTaskController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, assigned_user_id } = req.body;

    const task = await updateTask(id, title, description, status, assigned_user_id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

const deleteTaskController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await deleteTask(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getPendingTasks: getPendingTasksController,
  getCompletedTasks: getCompletedTasksController,
  getRecentTasks: getRecentTasksController,
  createTask: createTaskController,
  updateTask: updateTaskController,
  deleteTask: deleteTaskController,
};
