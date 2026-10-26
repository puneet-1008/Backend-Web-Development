const express = require('express');
const bcrypt = require('bcryptjs');
const cookieConfig = require('../config/cookie');
const userRepository = require('../repositories/userRepository');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {};
  if (
    typeof email !== 'string'
    || typeof password !== 'string'
    || !email.trim()
    || !password
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({
      error: { code: 'INVALID_INPUT', message: 'A valid email and password are required' },
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const session = sessionStore.create(user.id);
    res.cookie('sid', session.id, cookieConfig.options);
    return res.status(200).json({
      data: { user: { id: user.id, name: user.name, email: user.email } },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({ data: { user: req.user } });
});

router.post('/logout', (req, res) => {
  const sessionId = req.signedCookies && req.signedCookies.sid;
  sessionStore.destroy(sessionId);
  res.clearCookie('sid', cookieConfig.options);
  return res.status(204).send();
});

module.exports = router;
