const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require("./config/db");

// Import routes
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

// Import models
const { initUserTable } = require("./models/userModel");

const app = express();
const PORT = process.env.PORT || 3001;

// --------------------- MIDDLEWARE ---------------------
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------- HEALTH CHECK ---------------------
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
});

// --------------------- API ROUTES ---------------------
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// Error handling middleware (placed after routes so route errors return JSON)
app.use((err, req, res, next) => {
  console.error('✗ Server error:', err && err.message ? err.message : err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? (err && err.message ? err.message : String(err)) : undefined
  });
});

// --------------------- DATABASE INIT ---------------------
async function initDB() {
  try {
    // Initialize users table
    await initUserTable();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        assigned_user_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Ensure assigned_user_id column exists for older DBs
    await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_user_id INTEGER`);
    await pool.query(`ALTER TABLE tasks ADD CONSTRAINT fk_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL`).catch(() => {
      // Constraint might already exist, ignore error
    });
    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('✗ Error initializing database:', error.message);
    // Continue startup even if init fails - table might already exist
  }
}

// --------------------- START SERVER ---------------------
let server;

function startServer(attemptPort = PORT) {
  server = app.listen(attemptPort, async () => {
    console.log(`✓ Server running on http://localhost:${attemptPort}`);
    await initDB();
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠ Port ${attemptPort} is already in use, trying ${attemptPort + 1}...`);
      server.close();
      startServer(attemptPort + 1);
    } else {
      console.error('✗ Server Error:', error);
      process.exit(1);
    }
  });
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n✓ SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n✓ SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

// Handle uncaught exceptions - but don't exit for EADDRINUSE
process.on('uncaughtException', (error) => {
  if (error.code !== 'EADDRINUSE') {
    console.error('✗ Uncaught Exception:', error);
    process.exit(1);
  }
});
