const pool = require('../config/db');

const getTasks = async ({ search = '', status = '', page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;
  const values = [];
  let whereClause = '';

  if (search) {
    values.push(`%${search}%`);
    whereClause += ` AND (title ILIKE $${values.length} OR description ILIKE $${values.length})`;
  }

  if (status) {
    values.push(status);
    whereClause += ` AND status = $${values.length}`;
  }

  const query = `
    SELECT * FROM tasks
    WHERE 1=1
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  values.push(limit, offset);

  const tasksResult = await pool.query(query, values);
  const countResult = await pool.query(`
    SELECT COUNT(*) AS total
    FROM tasks
    WHERE 1=1
    ${whereClause}
  `, values.slice(0, values.length - 2));

  return {
    tasks: tasksResult.rows,
    total: Number(countResult.rows[0].total),
    page,
    limit
  };
};

const getPendingTasks = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const tasksResult = await pool.query(
    `SELECT * FROM tasks WHERE status = 'pending' ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const countResult = await pool.query(`SELECT COUNT(*) AS total FROM tasks WHERE status = 'pending'`);

  return {
    tasks: tasksResult.rows,
    total: Number(countResult.rows[0].total),
    page,
    limit
  };
};

const getCompletedTasks = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const tasksResult = await pool.query(
    `SELECT * FROM tasks WHERE status = 'completed' ORDER BY completed_at DESC NULLS LAST LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const countResult = await pool.query(`SELECT COUNT(*) AS total FROM tasks WHERE status = 'completed'`);

  return {
    tasks: tasksResult.rows,
    total: Number(countResult.rows[0].total),
    page,
    limit
  };
};

const getRecentTasks = async (limit = 10) => {
  const result = await pool.query(
    `SELECT * FROM tasks ORDER BY updated_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
};

const createTask = async (title, description = '', assigned_user_id = null) => {
  const result = await pool.query(
    `INSERT INTO tasks (title, description, status, assigned_user_id, created_at, updated_at)
      VALUES ($1, $2, 'pending', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
    [title, description, assigned_user_id || null]
  );
  return result.rows[0];
};

const updateTask = async (id, title, description, status, assigned_user_id = null) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(title);
  }
  if (description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(description);
  }
  if (status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(status);
    if (status === 'completed') {
      fields.push(`completed_at = CURRENT_TIMESTAMP`);
    } else {
      fields.push(`completed_at = NULL`);
    }
  }
  if (assigned_user_id !== undefined) {
    fields.push(`assigned_user_id = $${idx++}`);
    values.push(assigned_user_id || null);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  const result = await pool.query(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    [...values, id]
  );

  return result.rows[0];
};

const deleteTask = async (id) => {
  const result = await pool.query(
    `DELETE FROM tasks WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  getTasks,
  getPendingTasks,
  getCompletedTasks,
  getRecentTasks,
  createTask,
  updateTask,
  deleteTask
};
