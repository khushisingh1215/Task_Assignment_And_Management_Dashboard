const pool = require("../config/db");

// Retry logic for database queries
const executeQueryWithRetry = async (query, values, maxRetries = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query(query, values);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Query attempt ${attempt} failed:`, error.message);
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
  }
  throw lastError;
};

// Get all tasks with search, filter & pagination
const getAllTasks = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      page = 1,
      limit = 10000
    } = req.query;

    const offset = (page - 1) * limit;
    let baseQuery = `WHERE 1=1`;
    let values = [];
    let paramIndex = 1;

    // 🔍 Search
    if (search) {
      baseQuery += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`;
      values.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    // 🟡 Status filter
    if (status && status !== "all") {
      baseQuery += ` AND status = $${paramIndex}`;
      values.push(status);
      paramIndex += 1;
    }

    // Total count (for pagination)
    const totalResult = await executeQueryWithRetry(
      `SELECT COUNT(*) as count FROM tasks ${baseQuery}`,
      values
    );
    const totalTasks = totalResult.rows[0].count;

    // Final data query
    const dataQuery = `
      SELECT *
      FROM tasks
      ${baseQuery}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await executeQueryWithRetry(dataQuery, [
      ...values,
      limit,
      offset
    ]);

    res.json({
      totalTasks,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTasks / limit),
      tasks: result.rows
    });

  } catch (error) {
    console.error('✗ Error in getAllTasks:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch tasks. Database connection error.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get pending tasks
const getPendingTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10000
    } = req.query;

    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = await executeQueryWithRetry(
      'SELECT COUNT(*) as count FROM tasks WHERE status = $1',
      ['pending']
    );
    const totalTasks = totalResult.rows[0].count;

    // Get paginated results
    const result = await executeQueryWithRetry(
      'SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      ['pending', limit, offset]
    );

    res.json({
      totalTasks,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTasks / limit),
      tasks: result.rows
    });
  } catch (error) {
    console.error('✗ Error in getPendingTasks:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch pending tasks. Database connection error.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get completed tasks
const getCompletedTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10000
    } = req.query;

    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = await executeQueryWithRetry(
      'SELECT COUNT(*) as count FROM tasks WHERE status = $1',
      ['completed']
    );
    const totalTasks = totalResult.rows[0].count;

    // Get paginated results
    const result = await executeQueryWithRetry(
      'SELECT * FROM tasks WHERE status = $1 ORDER BY completed_at DESC LIMIT $2 OFFSET $3',
      ['completed', limit, offset]
    );

    res.json({
      totalTasks,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTasks / limit),
      tasks: result.rows
    });
  } catch (error) {
    console.error('✗ Error in getCompletedTasks:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch completed tasks. Database connection error.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get recent activity (last 10 tasks)
const getRecentTasks = async (req, res) => {
  try {
    const result = await executeQueryWithRetry(`
      SELECT * FROM tasks 
      ORDER BY updated_at DESC 
      LIMIT 10
    `, []);
    res.json(result.rows);
  } catch (error) {
    console.error('✗ Error in getRecentTasks:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch recent tasks. Database connection error.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { title, description, assigned_user_id } = req.body;

    // validation
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await executeQueryWithRetry(
      'INSERT INTO tasks (title, description, assigned_user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description || null, assigned_user_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("✗ Insert error:", error.message);
    res.status(500).json({ 
      error: 'Failed to create task. Database connection error.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assigned_user_id } = req.body;
    
    const now = new Date().toISOString();
    const completedAt = status === 'completed' ? now : null;

    await executeQueryWithRetry(
      `UPDATE tasks SET title = $1, description = $2, status = $3, assigned_user_id = $4, updated_at = $5, completed_at = $6 WHERE id = $7`,
      [title, description, status, assigned_user_id || null, now, completedAt, id]
    );

    // Fetch and return the updated task
    const updatedTask = await executeQueryWithRetry('SELECT * FROM tasks WHERE id = $1', [id]);
    res.json(updatedTask.rows[0]);
  } catch (error) {
    console.error('✗ Error in updateTask:', error.message);
    res.status(500).json({ 
      error: 'Failed to update task. Database connection error.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await executeQueryWithRetry('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('✗ Error in deleteTask:', error.message);
    res.status(500).json({ 
      error: 'Failed to delete task. Database connection error.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllTasks,
  getPendingTasks,
  getCompletedTasks,
  getRecentTasks,
  createTask,
  updateTask,
  deleteTask
};

