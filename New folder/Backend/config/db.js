const { Pool } = require('pg');
require('dotenv').config();

// Validate environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Using default values if available');
}

// Create PostgreSQL connection pool with optimized settings
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'taskdb',
  port: parseInt(process.env.DB_PORT) || 5432,
  max: 20, // Maximum number of clients in the pool
  min: 2, // Maintain minimum 2 connections
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  statement_timeout: 30000, // Query timeout in milliseconds
  query_timeout: 30000, // Query timeout
  keepalives: true,
  keepalives_idle: 30,
});

// Handle successful connections
pool.on('connect', (client) => {
  console.log('✓ New client connected to PostgreSQL database');
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('✗ Unexpected error on idle client', err);
  // Don't exit process on error - let it recover
});

// Test the connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('✗ Failed to connect to database:', err.message);
  } else {
    console.log('✓ Database connection test successful');
  }
});

module.exports = pool;
