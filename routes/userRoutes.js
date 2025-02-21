// userRoutes.js
const express = require('express');
const { signUp, login } = require('../controllers/userController');
const router = express.Router();

// User signup
router.post('/signup', async (req, res) => {
  try {
    await signUp(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign up', details: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    await login(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log in', details: error.message });
  }
});

module.exports = router;