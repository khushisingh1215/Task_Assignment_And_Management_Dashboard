const pool = require('./config/db');
const { createUser, findUserByEmail } = require('./models/userModel');

const setup = async () => {
  try {
    console.log('🔧 Setting up demo user...');

    const email = 'demo@example.com';
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      console.log('✓ Demo user already exists');
    } else {
      await createUser('Demo User', email, 'demo123');
      console.log('✓ Demo user created successfully');
      console.log('📧 Email: demo@example.com');
      console.log('🔑 Password: demo123');
    }

    process.exit(0);
  } catch (error) {
    console.error('✗ Setup error:', error.message);
    process.exit(1);
  }
};

setup();
