const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

const VALID_ROLES = ['citizen', 'field_officer', 'district_official', 'state_official', 'ministry_official'];

const ROLE_DEFAULTS = {
  citizen: { designation: 'Khatedar / Landowner', department: 'Public / Beneficiary' },
  field_officer: { designation: 'Cadastral Surveyor Grade-I', department: 'District Land Records' },
  district_official: { designation: 'District Magistrate & CALA', department: 'Revenue & Disaster Management' },
  state_official: { designation: 'Principal Secretary (Revenue)', department: 'State Land Acquisition Directorate' },
  ministry_official: { designation: 'Joint Secretary (DoLR)', department: 'Ministry of Rural Development' }
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, state, district, designation, department } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full legal/official name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Official email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid stakeholder role. Must be one of: ${VALID_ROLES.join(', ')}` });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ error: 'State jurisdiction is required.' });
    }
    if (!district || !district.trim()) {
      return res.status(400).json({ error: 'District / Headquarters jurisdiction is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate
    const existing = await query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1);`,
      [cleanEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A stakeholder account with this email address already exists. Please sign in.' });
    }

    const roleDefault = ROLE_DEFAULTS[role] || { designation: 'Official', department: 'Administration' };
    const finalDesignation = (designation && designation.trim()) || roleDefault.designation;
    const finalDepartment = (department && department.trim()) || roleDefault.department;

    const passwordHash = await bcrypt.hash(password, 10);

    const insertResult = await query(
      `INSERT INTO users (name, email, password_hash, role, state, district, designation, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, role, state, district, designation, department, created_at;`,
      [name.trim(), cleanEmail, passwordHash, role, state.trim(), district.trim(), finalDesignation, finalDepartment]
    );

    const newUser = insertResult.rows[0];

    // Insert welcome notification
    try {
      await query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, 'update');`,
        [
          newUser.id,
          'Welcome to NLAMS Portal',
          `Your official stakeholder profile (${newUser.designation}, ${newUser.department}) has been registered under the RFCTLARR statutory governance network.`
        ]
      );
    } catch (notifErr) {
      console.warn('[AUTH REGISTER NOTIF WARNING]:', notifErr.message);
    }

    const payload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      state: newUser.state,
      district: newUser.district,
      designation: newUser.designation,
      department: newUser.department
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'nlams_sih_2026_super_secret_jwt_key_98472917491',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Stakeholder account registered successfully.',
      token,
      user: payload
    });
  } catch (err) {
    console.error('[AUTH REGISTER ERROR]:', err);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Database connection failed. PostgreSQL is not reachable on port 5433. Run npm run db:start.' 
      });
    }
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

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
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Database connection failed. PostgreSQL is not reachable on port 5433. Run npm run db:start.' 
      });
    }
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
