const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('dashboard/index', { user });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.redirect('/');
  }
});

module.exports = router;