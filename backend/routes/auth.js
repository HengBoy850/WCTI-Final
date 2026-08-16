const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../db');
const { authRequired } = require('../middleware/auth');
const { sendVerificationEmail } = require('../services/email');

const router = express.Router();

// In-memory stores (fine for a school project; use Redis/DB in production)
const resetTokens = new Map(); // token -> { userId, expires }
const emailVerifications = new Map(); // email -> { code, expires }

function signToken(user, remember) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: remember ? '30d' : '7d' }
  );
}

async function touchLastLogin(userId) {
  await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

async function issueVerificationCode(email) {
  const code = generateCode();
  emailVerifications.set(email, { code, expires: Date.now() + 15 * 60 * 1000 });
  const previewUrl = await sendVerificationEmail(email, code);
  return previewUrl;
}

// ---------- Register (customer only - used by the public website) ----------
// Creates an unverified account and emails a 6-digit code. The account can't
// log in until POST /auth/verify-email confirms that code.
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const [existingRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const existing = existingRows[0];
    const hashed = bcrypt.hashSync(password, 10);

    if (existing) {
      if (existing.verified) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      // Existing but never verified - update their details and resend a fresh code
      // instead of forcing them into a "duplicate email" dead end.
      await pool.query('UPDATE users SET name = ?, password = ? WHERE id = ?', [name, hashed, existing.id]);
    } else {
      await pool.query(
        'INSERT INTO users (name, email, password, role, verified) VALUES (?,?,?,?,0)',
        [name, email, hashed, 'customer']
      );
    }

    const previewUrl = await issueVerificationCode(email);
    res.status(201).json({
      message: 'Account created. Check your email for a 6-digit verification code.',
      email,
      // Only present when Ethereal is reachable - lets you view the test
      // email in a browser without setting up a real inbox.
      devPreviewUrl: previewUrl || undefined,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Verify email ----------
router.post('/verify-email', async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }
    const record = emailVerifications.get(email);
    if (!record || record.expires < Date.now()) {
      return res.status(400).json({ error: 'Code expired or not found. Request a new one.' });
    }
    if (record.code !== String(code).trim()) {
      return res.status(400).json({ error: 'Incorrect code' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'Account not found' });

    await pool.query('UPDATE users SET verified = 1 WHERE id = ?', [user.id]);
    emailVerifications.delete(email);
    await touchLastLogin(user.id);

    const token = signToken(user, true);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Resend verification code ----------
router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || user.verified) {
      // Same response either way so this can't be used to probe which emails exist.
      return res.json({ message: 'If that account needs verification, a new code has been sent.' });
    }
    const previewUrl = await issueVerificationCode(email);
    res.json({
      message: 'A new verification code has been sent.',
      devPreviewUrl: previewUrl || undefined,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Register staff/cashier/admin (used by the POS dashboard) ----------
// Requires a valid ADMIN_SIGNUP_CODE so random people can't create internal accounts.
router.post('/register-staff', async (req, res, next) => {
  try {
    const { name, email, password, role, signupCode } = req.body;
    const allowedRoles = ['staff', 'cashier', 'admin'];

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password and role are required' });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${allowedRoles.join(', ')}` });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!signupCode || signupCode !== process.env.ADMIN_SIGNUP_CODE) {
      return res.status(403).json({ error: 'Invalid admin signup code' });
    }

    const [existingRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingRows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    // Internal accounts are trusted at creation time (gated by the admin
    // code already), so they don't need the email verification step.
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, verified) VALUES (?,?,?,?,1)',
      [name, email, hashed, role]
    );

    const user = { id: result.insertId, name, email, role };
    await touchLastLogin(user.id);
    const token = signToken(user, true);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// ---------- Login ----------
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!user.verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.', unverified: true, email: user.email });
    }
    await touchLastLogin(user.id);
    const token = signToken(user, remember !== false); // default to a long-lived "stay logged in" token
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url },
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Forgot password ----------
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (user) {
      const token = crypto.randomBytes(20).toString('hex');
      resetTokens.set(token, { userId: user.id, expires: Date.now() + 15 * 60 * 1000 });
      return res.json({
        message: 'If that email exists, a reset link has been generated.',
        demoResetToken: token,
      });
    }
    res.json({ message: 'If that email exists, a reset link has been generated.' });
  } catch (err) {
    next(err);
  }
});

// ---------- Reset password ----------
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const record = resetTokens.get(token);
    if (!record || record.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const hashed = bcrypt.hashSync(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, record.userId]);
    resetTokens.delete(token);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
});

// ---------- Current user ----------
router.get('/me', authRequired, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ---------- Update profile (name + avatar) ----------
router.put('/me', authRequired, async (req, res, next) => {
  try {
    const { name, avatar_url } = req.body;
    const [existingRows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ error: 'User not found' });

    await pool.query('UPDATE users SET name = ?, avatar_url = ? WHERE id = ?', [
      name ?? existing.name,
      avatar_url === undefined ? existing.avatar_url : avatar_url,
      req.user.id,
    ]);
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
