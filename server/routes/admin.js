const express = require('express');
const router = express.Router();
const seed = require('../db/seed');
const migrateFieldOfficer = require('../db/fieldOfficerMigrations');
const seedFieldOfficer = require('../db/seedFieldOfficer');
const migrateStateGovernment = require('../db/stateGovernmentMigrations');
const seedStateGovernment = require('../db/seedStateGovernment');

// POST /api/admin/reseed -> Instant demo state reset
router.post('/reseed', async (req, res) => {
  try {
    console.log('[ADMIN] Reseed requested from API.');
    await seed();
    await migrateFieldOfficer();
    await seedFieldOfficer();
    await migrateStateGovernment();
    await seedStateGovernment();
    res.json({
      success: true,
      message: 'NLAMS demo database has been cleanly reseeded to initial state.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[ADMIN RESEED ERROR]:', err);
    res.status(500).json({ error: 'Failed to reseed database.', details: err.message });
  }
});

module.exports = router;
