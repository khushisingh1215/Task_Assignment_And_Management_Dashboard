const express = require('express');
const { register, login, getCurrentUser, getAllUsersEndpoint, getUserById, addUser, editUser, deleteUserEndpoint, googleLogin } = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

// Admin routes for user management
router.get('/', verifyToken, verifyAdmin, getAllUsersEndpoint);
router.get('/:id', verifyToken, verifyAdmin, getUserById);
router.post('/', verifyToken, verifyAdmin, addUser);
router.put('/:id', verifyToken, verifyAdmin, editUser);
router.delete('/:id', verifyToken, verifyAdmin, deleteUserEndpoint);

module.exports = router;
