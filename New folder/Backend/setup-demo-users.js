#!/usr/bin/env node
/**
 * Setup script to initialize demo users with roles for the task management system
 * 
 * Usage: node setup-demo-users.js
 * 
 * This script will:
 * 1. Create the users table if it doesn't exist
 * 2. Create an admin user for system management
 * 3. Create demo regular users for task assignment
 */

const pool = require('./config/db');
const { hashPassword } = require('./models/userModel');

async function setupDemoUsers() {
  try {
    console.log('\n🚀 Starting setup of demo users...\n');

    // Create users table
    console.log('1️⃣  Creating users table...');
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
    console.log('✅ Users table ready\n');

    // Ensure columns exist for existing databases
    console.log('2️⃣  Updating table schema...');
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log('✅ Schema updated\n');

    // Create demo users
    console.log('3️⃣  Creating demo users...\n');

    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'john123',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'jane123',
        role: 'user'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'bob123',
        role: 'user'
      },
      {
        name: 'Alice Williams',
        email: 'alice@example.com',
        password: 'alice123',
        role: 'user'
      }
    ];

    for (const user of demoUsers) {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`  ⏭️  User ${user.email} already exists, skipping...`);
        continue;
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(user.password);
      await pool.query(
        'INSERT INTO users (name, email, password, role, provider) VALUES ($1, $2, $3, $4, $5)',
        [user.name, user.email, hashedPassword, user.role, 'local']
      );

      console.log(`  ✅ Created ${user.role} user: ${user.name} (${user.email})`);
    }

    console.log('\n✨ Demo users setup complete!\n');

    // Display summary
    console.log('📋 Demo Users Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin User:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    console.log('  Role: Admin (can manage users and tasks)\n');
    
    console.log('Regular Users:');
    demoUsers.slice(1).forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Role: User (can view/manage assigned tasks)\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎯 You can now:');
    console.log('1. Login with admin account to manage users');
    console.log('2. Create new users or edit existing ones');
    console.log('3. Assign tasks to specific users');
    console.log('4. Only admins can access the User Management page\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDemoUsers();
