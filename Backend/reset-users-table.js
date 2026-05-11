const pool = require('./config/db');

const resetUserTable = async () => {
  try {
    // Drop existing table if it exists
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✓ Dropped existing users table');

    // Create fresh table with OAuth support
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        provider VARCHAR(50) DEFAULT 'local',
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created fresh users table with OAuth support');

    process.exit(0);
  } catch (error) {
    console.error('✗ Reset error:', error.message);
    process.exit(1);
  }
};

resetUserTable();
