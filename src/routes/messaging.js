const express = require('express');
const { body, validationResult } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth');
const twilioService = require('../services/twilioService');
const Lead = require('../models/lead');

const router = express.Router();

// Validation middleware
const messageValidation = [
  body('phone').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number'),
  body('message').trim().notEmpty().withMessage('Message cannot be empty')
];

// Send message to a lead
router.post('/send-message', isAuthenticated, messageValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, message } = req.body;
    const userId = req.session.userId;

    const result = await twilioService.sendMessage(phone, message, userId);
    res.json({ success: true, messageSid: result.sid });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get message history for a lead
router.get('/messages/:phone', isAuthenticated, async (req, res) => {
  try {
    const { phone } = req.params;
    const userId = req.session.userId;

    const messages = await twilioService.getMessageHistory(userId, phone);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Webhook for incoming messages
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const twilioSignature = req.headers['x-twilio-signature'];
    // TODO: Implement signature validation

    const { From, Body, MessageSid } = req.body;

    // Find the associated lead
    const lead = await Lead.findByPhone(From);
    if (lead) {
      await twilioService.logMessage(lead.user_id, From, Body, 'inbound', MessageSid);
    }

    res.status(200).send();
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send();
  }
});

module.exports = router;