const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userResult = await query(
      `SELECT id, name, email, password_hash, role, state, district, designation, department 
       FROM users WHERE LOWER(email) = LOWER($1);`,
      [email.trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid official credentials or unauthorized identity.' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid official credentials.' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      state: user.state,
      district: user.district,
      designation: user.designation,
      department: user.department
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'nlams_sih_2026_super_secret_jwt_key_98472917491',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Authentication successful.',
      token,
      user: payload
    });
  } catch (err) {
    console.error('[AUTH LOGIN ERROR]:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT id, name, email, role, state, district, designation, department, created_at 
       FROM users WHERE id = $1;`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({ user: userResult.rows[0] });
  } catch (err) {
    console.error('[AUTH ME ERROR]:', err);
    res.status(500).json({ error: 'Failed to fetch user session profile.' });
  }
});

module.exports = router;
