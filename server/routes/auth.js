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

// Synthetic demo users for reliable prototype authentication
const DEMO_USERS = [
  {
    id: 1,
    name: 'Ramesh Patel (Citizen / Landowner)',
    email: 'citizen@nlams.gov.in',
    password: 'citizen123',
    role: 'citizen',
    state: 'Maharashtra',
    district: 'Palghar',
    designation: 'Khatedar / Landowner',
    department: 'Public / Beneficiary'
  },
  {
    id: 2,
    name: 'Anil Deshmukh (Field Surveyor)',
    email: 'field@nlams.gov.in',
    password: 'field123',
    role: 'field_officer',
    state: 'Maharashtra',
    district: 'Palghar',
    designation: 'Cadastral Surveyor Grade-I',
    department: 'District Land Records'
  },
  {
    id: 3,
    name: 'Dr. Rajesh Sharma, IAS (District Collector)',
    email: 'district@nlams.gov.in',
    password: 'district123',
    role: 'district_official',
    state: 'Maharashtra',
    district: 'Palghar',
    designation: 'District Magistrate & CALA',
    department: 'Revenue & Disaster Management'
  },
  {
    id: 4,
    name: 'Sunita Meena, IAS (State Revenue Secretary)',
    email: 'state@nlams.gov.in',
    password: 'state123',
    role: 'state_official',
    state: 'Maharashtra',
    district: 'Mumbai Sub',
    designation: 'Principal Secretary (Revenue)',
    department: 'State Land Acquisition Directorate'
  },
  {
    id: 5,
    name: 'Shri R. K. Verma, IAS (Joint Secretary)',
    email: 'ministry@nlams.gov.in',
    password: 'ministry123',
    role: 'ministry_official',
    state: 'National Capital Territory',
    district: 'New Delhi',
    designation: 'Joint Secretary (Land Resources)',
    department: 'Ministry of Rural Development (MoRD)'
  }
];

function normalizeRole(r) {
  if (!r) return '';
  const s = r.toLowerCase().trim().replace(/[-_\s]/g, '');
  if (s === 'district' || s === 'districtofficial' || s === 'cala') return 'district_official';
  if (s === 'state' || s === 'stateofficial') return 'state_official';
  if (s === 'field' || s === 'fieldofficer' || s === 'fieldoff' || s === 'surveyor') return 'field_officer';
  if (s === 'ministry' || s === 'ministryofficial' || s === 'mord') return 'ministry_official';
  if (s === 'citizen' || s === 'landowner') return 'citizen';
  return r;
}

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
    const { email, password, role } = req.body || {};

    // 1. Validate required fields
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please enter your official email or identity ID.' });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: 'Please enter your security passcode.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Look up user (try database first, then demo fallback)
    let user = null;
    let isFromDatabase = false;

    try {
      const userResult = await query(
        `SELECT id, name, email, password_hash, role, state, district, designation, department 
         FROM users WHERE LOWER(email) = LOWER($1);`,
        [cleanEmail]
      );
      if (userResult && userResult.rows && userResult.rows.length > 0) {
        user = userResult.rows[0];
        isFromDatabase = true;
      }
    } catch (dbErr) {
      console.warn(`[AUTH] Database query unavailable (${dbErr.code || dbErr.message}). Using prototype demo authentication fallback.`);
    }

    if (!user) {
      user = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your ID and passcode.' });
    }

    // 3. Verify password
    let passwordMatch = false;
    if (isFromDatabase && user.password_hash) {
      try {
        passwordMatch = await bcrypt.compare(password, user.password_hash);
      } catch (bcryptErr) {
        console.error('[AUTH BCRYPT ERROR]:', bcryptErr);
      }
    } else if (user.password) {
      passwordMatch = (user.password === password);
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your ID and passcode.' });
    }

    // 4. Role validation
    if (role) {
      const normRequestedRole = normalizeRole(role);
      const normUserRole = normalizeRole(user.role);
      if (normRequestedRole && normUserRole && normRequestedRole !== normUserRole) {
        return res.status(401).json({
          error: `Selected role does not match user account permissions. Please select the correct stakeholder role.`
        });
      }
    }

    // 5. Generate statutory JWT token
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

    return res.json({
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
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let user = null;

    try {
      const userResult = await query(
        `SELECT id, name, email, role, state, district, designation, department, created_at 
         FROM users WHERE id = $1;`,
        [req.user.id]
      );
      if (userResult && userResult.rows && userResult.rows.length > 0) {
        user = userResult.rows[0];
      }
    } catch (dbErr) {
      console.warn(`[AUTH ME] DB unavailable (${dbErr.code || dbErr.message}). Using token session profile.`);
    }

    if (!user) {
      user = DEMO_USERS.find(u => u.id === req.user.id || u.email.toLowerCase() === (req.user.email || '').toLowerCase());
    }

    if (!user && req.user) {
      user = req.user;
    }

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const { password, password_hash, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    console.error('[AUTH ME ERROR]:', err);
    return res.status(500).json({ error: 'Failed to fetch user session profile.' });
  }
});

module.exports = router;
