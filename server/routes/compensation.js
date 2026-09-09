const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/compensation -> List compensation & R&R records with joined parcel & project details
router.get('/', async (req, res) => {
  try {
    const { project_id, payment_status, rnr_status, search } = req.query;

    let sql = `
      SELECT 
        c.id AS compensation_id,
        c.parcel_id,
        c.assessed_amount,
        c.paid_amount,
        c.payment_status,
        c.rnr_status,
        c.families_affected,
        c.bank_account_masked,
        c.ifsc_code,
        c.utr_number,
        c.disbursed_at,
        lp.survey_number,
        lp.area_hectares,
        lp.owner_name,
        lp.status AS parcel_status,
        lp.village,
        p.id AS project_id,
        p.name AS project_name,
        p.project_type,
        p.state,
        p.district
      FROM compensation c
      JOIN land_parcels lp ON c.parcel_id = lp.id
      JOIN projects p ON lp.project_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) {
      params.push(project_id);
      sql += ` AND p.id = $${params.length}`;
    }
    if (payment_status) {
      params.push(payment_status);
      sql += ` AND c.payment_status = $${params.length}`;
    }
    if (rnr_status) {
      params.push(rnr_status);
      sql += ` AND c.rnr_status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (lp.survey_number ILIKE $${params.length} OR lp.owner_name ILIKE $${params.length} OR p.name ILIKE $${params.length} OR c.utr_number ILIKE $${params.length})`;
    }

    sql += ` ORDER BY c.id ASC;`;

    const result = await query(sql, params);
    res.json({ compensation: result.rows });
  } catch (err) {
    console.error('[COMPENSATION GET ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve compensation ledger.' });
  }
});

// PATCH /api/compensation/:id -> Update payment & R&R status (role-gated to officials)
router.patch('/:id', authenticateToken, authorizeRoles('district_official', 'state_official', 'ministry_official'), async (req, res) => {
  try {
    const compId = parseInt(req.params.id, 10);
    const { payment_status, rnr_status, paid_amount } = req.body;

    const existingResult = await query('SELECT * FROM compensation WHERE id = $1;', [compId]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Compensation record not found.' });
    }

    const current = existingResult.rows[0];
    const newPayStatus = payment_status || current.payment_status;
    const newRnrStatus = rnr_status || current.rnr_status;
    let newPaidAmount = paid_amount !== undefined ? parseFloat(paid_amount) : current.paid_amount;

    if (newPayStatus === 'paid' && newPaidAmount < current.assessed_amount) {
      newPaidAmount = current.assessed_amount;
    }

    const utr = newPayStatus === 'paid' && !current.utr_number ? `RBI${Date.now()}` : current.utr_number;
    const disbursedAt = newPayStatus === 'paid' && !current.disbursed_at ? new Date() : current.disbursed_at;

    const updateResult = await query(
      `UPDATE compensation 
       SET payment_status = $1, rnr_status = $2, paid_amount = $3, utr_number = $4, disbursed_at = $5
       WHERE id = $6
       RETURNING *;`,
      [newPayStatus, newRnrStatus, newPaidAmount, utr, disbursedAt, compId]
    );

    // If fully paid, update parcel status to 'possession_taken' if not already
    if (newPayStatus === 'paid') {
      await query(
        `UPDATE land_parcels SET status = 'possession_taken' WHERE id = $1 AND status != 'possession_taken';`,
        [current.parcel_id]
      );
    }

    res.json({
      message: 'Compensation ledger entry updated successfully.',
      record: updateResult.rows[0]
    });
  } catch (err) {
    console.error('[COMPENSATION UPDATE ERROR]:', err);
    res.status(500).json({ error: 'Failed to update compensation ledger status.' });
  }
});

module.exports = router;
