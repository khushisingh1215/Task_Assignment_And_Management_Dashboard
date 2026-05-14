const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Create users table if it doesn't exist and ensure columns for OAuth and roles
const initUserTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        provider VARCHAR(50) DEFAULT 'local',
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure columns exist for older DBs (no-op if they already exist)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await pool.query(`ALTER TABLE users ALTER COLUMN password DROP NOT NULL`);

    console.log('✓ Users table initialized/updated');
  } catch (error) {
    console.error('✗ Error creating/updating users table:', error.message);
  }
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password with hash
const comparePassword = async (password, hash) => {
  if (!hash) return false;
  return await bcrypt.compare(password, hash);
};

// Create user
// options = { provider, googleId, role }
const createUser = async (name, email, password, options = {}) => {
  let hashedPassword = null;
  if (password) hashedPassword = await hashPassword(password);

  const result = await pool.query(
    'INSERT INTO users (name, email, password, role, provider, google_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, provider, google_id, created_at',
    [name, email, hashedPassword, options.role || 'user', options.provider || 'local', options.googleId || null]
  );

  return result.rows[0];
};

// Find user by email
const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  return result.rows[0];
};

// Find user by ID
const findUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, role, provider, google_id, created_at FROM users WHERE id = $1',
    [id]
  );

  return result.rows[0];
};

// Get all users
const getAllUsers = async () => {
  const result = await pool.query(
    'SELECT id, name, email, role, provider, created_at FROM users ORDER BY created_at DESC'
  );

  return result.rows;
};

// Update user
const updateUser = async (id, name, email, role) => {
  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, email, role, provider, created_at',
    [name, email, role, id]
  );

  return result.rows[0];
};

// Delete user
const deleteUser = async (id) => {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );

  return result.rows[0];
};

module.exports = {
  initUserTable,
  hashPassword,
  comparePassword,
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateUser,
  deleteUser
};
