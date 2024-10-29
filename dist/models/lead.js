const db = require('../config/database');

class Lead {
  static create(userId, data) {
    return new Promise((resolve, reject) => {
      const { name, email, phone, company, notes } = data;
      db.run(
        'INSERT INTO leads (user_id, name, email, phone, company, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name, email, phone, company, notes],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...data });
        }
      );
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static findByPhone(phone) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM leads WHERE phone = ?', [phone], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM leads WHERE user_id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static update(id, data) {
    return new Promise((resolve, reject) => {
      const { name, email, phone, company, notes, status } = data;
      db.run(
        'UPDATE leads SET name = ?, email = ?, phone = ?, company = ?, notes = ?, status = ? WHERE id = ?',
        [name, email, phone, company, notes, status, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...data });
        }
      );
    });
  }
}

module.exports = Lead;