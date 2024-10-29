const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { isGuest, isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
];

// Routes
router.get('/register', isGuest, (req, res) => {
  res.render('auth/register', { errors: [], data: {} });
});

router.post('/register', isGuest, registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', { 
        errors: errors.array(),
        data: req.body 
      });
    }

    const { username, email, password } = req.body;
    const user = await User.create(username, email, password);
    req.session.userId = user.id;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      errors: [{ msg: 'Registration failed. Please try again.' }],
      data: req.body
    });
  }
});

router.get('/login', isGuest, (req, res) => {
  res.render('auth/login', { errors: [] });
});

router.post('/login', isGuest, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    
    if (!user) {
      return res.render('auth/login', {
        errors: [{ msg: 'Invalid username or password' }]
      });
    }

    const isValid = await User.verifyPassword(password, user.password);
    if (!isValid) {
      return res.render('auth/login', {
        errors: [{ msg: 'Invalid username or password' }]
      });
    }

    req.session.userId = user.id;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      errors: [{ msg: 'Login failed. Please try again.' }]
    });
  }
});

router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;