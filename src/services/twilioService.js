const twilio = require('twilio');
const db = require('../config/database');

class TwilioService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendMessage(to, body, userId) {
    try {
      const message = await this.client.messages.create({
        body,
        from: this.fromNumber,
        to
      });

      // Log the message in the database
      await this.logMessage(userId, to, body, 'outbound', message.sid);
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async logMessage(userId, phoneNumber, content, direction, messageSid) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO messages (user_id, phone_number, content, direction, message_sid, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [userId, phoneNumber, content, direction, messageSid],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async getMessageHistory(userId, phoneNumber) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM messages WHERE user_id = ? AND phone_number = ? ORDER BY created_at ASC',
        [userId, phoneNumber],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

module.exports = new TwilioService();