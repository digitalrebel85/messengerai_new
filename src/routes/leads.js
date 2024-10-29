const express = require('express');
const { body, validationResult } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth');
const Lead = require('../models/lead');
const twilioService = require('../services/twilioService');

const router = express.Router();

// Validation middleware
const leadValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('phone').optional({ checkFalsy: true }).matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number'),
  body('company').optional({ checkFalsy: true }).trim(),
  body('notes').optional({ checkFalsy: true }).trim()
];

// List leads
router.get('/leads', isAuthenticated, async (req, res) => {
  try {
    const leads = await Lead.findByUserId(req.session.userId);
    res.render('leads/index', { leads, messages: req.flash() });
  } catch (error) {
    console.error('Error fetching leads:', error);
    req.flash('error', 'Failed to fetch leads');
    res.redirect('/dashboard');
  }
});

// Show create lead form
router.get('/leads/new', isAuthenticated, (req, res) => {
  res.render('leads/new', { errors: [], data: {} });
});

// Create new lead
router.post('/leads', isAuthenticated, leadValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('leads/new', {
        errors: errors.array(),
        data: req.body
      });
    }

    const lead = await Lead.create(req.session.userId, req.body);
    req.flash('success', 'Lead created successfully');
    res.redirect('/leads');
  } catch (error) {
    console.error('Error creating lead:', error);
    res.render('leads/new', {
      errors: [{ msg: 'Failed to create lead' }],
      data: req.body
    });
  }
});

// View lead details and messages
router.get('/leads/:id', isAuthenticated, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead || lead.user_id !== req.session.userId) {
      req.flash('error', 'Lead not found');
      return res.redirect('/leads');
    }

    const messages = await twilioService.getMessageHistory(req.session.userId, lead.phone);
    res.render('leads/view', { lead, messages });
  } catch (error) {
    console.error('Error fetching lead:', error);
    req.flash('error', 'Failed to fetch lead details');
    res.redirect('/leads');
  }
});

module.exports = router;