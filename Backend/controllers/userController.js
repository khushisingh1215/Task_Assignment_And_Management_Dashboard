const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { findUserByEmail, createUser, comparePassword, findUserById, getAllUsers, updateUser, deleteUser } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create user
    const user = await createUser(name, email, password);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('✗ Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('✗ Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Google OAuth login: verify idToken from Google Identity Services
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken is required' });
    if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: 'Server missing GOOGLE_CLIENT_ID env var' });

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name || payload.email.split('@')[0];
    const googleId = payload.sub;

    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser(name, email, null, { provider: 'google', googleId });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('✗ Google login error:', error.message);
    res.status(500).json({ error: 'Google login failed' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('✗ Error fetching user:', error.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Get all users (admin only)
const getAllUsersEndpoint = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('✗ Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get a single user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('✗ Error fetching user:', error.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Add user (admin only)
const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create user
    const user = await createUser(name, email, password, { role: role || 'user' });

    res.status(201).json({
      message: 'User added successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('✗ Error adding user:', error.message);
    res.status(500).json({ error: 'Failed to add user' });
  }
};

// Edit user (admin only)
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validation
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already used by another user
    if (user.email !== email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    // Update user
    const updatedUser = await updateUser(id, name, email, role);

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('✗ Error editing user:', error.message);
    res.status(500).json({ error: 'Failed to edit user' });
  }
};

// Delete user (admin only)
const deleteUserEndpoint = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await deleteUser(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('✗ Error deleting user:', error.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  getAllUsersEndpoint,
  getUserById,
  addUser,
  editUser,
  deleteUserEndpoint,
  JWT_SECRET,
  googleLogin
};
