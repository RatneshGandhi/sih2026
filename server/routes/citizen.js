const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All citizen endpoints require authentication and citizen statutory role
router.use(authenticateToken);
router.use(authorizeRoles('citizen'));

// Helper to compute R&R score
function computeRnrPercentage(housing, livelihood, resettlement) {
  const scoreMap = { completed: 100, in_progress: 50, not_started: 0 };
  const h = scoreMap[housing] !== undefined ? scoreMap[housing] : 0;
  const l = scoreMap[livelihood] !== undefined ? scoreMap[livelihood] : 0;
  const r = scoreMap[resettlement] !== undefined ? scoreMap[resettlement] : 0;
  return Math.round((h + l + r) / 3);
}

// Helper to compute compensation status
function computeCompensationStatus(paidAmount, approvedAmount) {
  const paid = parseFloat(paidAmount) || 0;
  const target = parseFloat(approvedAmount) || 0;
  if (paid <= 0) return 'Pending';
  if (target > 0 && paid >= target) return 'Fully Paid';
  return 'Partially Paid';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 1 — Citizen Dashboard Overview (Parcels owned by logged-in citizen)
// GET /api/citizen/parcels
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/parcels', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        lp.id,
        lp.project_id,
        lp.survey_number,
        lp.area_hectares,
        lp.geom,
        lp.owner_name,
        lp.aadhaar_masked,
        lp.status,
        lp.land_type,
        lp.village,
        lp.photo_url,
        lp.created_at,
        p.name AS project_name,
        p.project_code,
        p.state,
        p.district,
        c.id AS compensation_id,
        c.assessed_amount,
        c.approved_amount,
        c.paid_amount,
        c.payment_status,
        c.rnr_status,
        c.housing_status,
        c.livelihood_status,
        c.resettlement_status
       FROM land_parcels lp
       LEFT JOIN projects p ON lp.project_id = p.id
       LEFT JOIN compensation c ON lp.id = c.parcel_id
       WHERE lp.owner_user_id = $1
       ORDER BY lp.id ASC;`,
      [req.user.id]
    );

    const parcels = result.rows.map((p) => {
      const assessed = parseFloat(p.assessed_amount) || 0;
      const approved = p.approved_amount !== null && p.approved_amount !== undefined ? parseFloat(p.approved_amount) : assessed;
      const paid = parseFloat(p.paid_amount) || 0;
      const pending = Math.max(0, approved - paid);
      const computedStatus = computeCompensationStatus(paid, approved);
      const rnrPct = computeRnrPercentage(p.housing_status, p.livelihood_status, p.resettlement_status);

      return {
        ...p,
        assessed_amount: assessed,
        approved_amount: approved,
        paid_amount: paid,
        pending_amount: pending,
        computed_compensation_status: computedStatus,
        rnr_overall_pct: rnrPct
      };
    });

    res.json({ parcels });
  } catch (err) {
    console.error('[CITIZEN PARCELS ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve your registered land parcels.' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 2 — View My Land on Map (GeoJSON FeatureCollection of ONLY own land)
// GET /api/citizen/map-data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/map-data', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        lp.id,
        lp.survey_number,
        lp.area_hectares,
        lp.geom,
        lp.owner_name,
        lp.status,
        lp.land_type,
        lp.village,
        p.id AS project_id,
        p.name AS project_name,
        p.state,
        p.district,
        c.assessed_amount,
        c.approved_amount,
        c.paid_amount,
        c.payment_status
       FROM land_parcels lp
       LEFT JOIN projects p ON lp.project_id = p.id
       LEFT JOIN compensation c ON lp.id = c.parcel_id
       WHERE lp.owner_user_id = $1
       ORDER BY lp.id ASC;`,
      [req.user.id]
    );

    const features = result.rows.map((row) => {
      let geometry = row.geom;
      if (typeof geometry === 'string') {
        try {
          geometry = JSON.parse(geometry);
        } catch (e) {
          console.error('Failed to parse geom JSON for parcel', row.id);
        }
      }

      return {
        type: 'Feature',
        id: row.id,
        geometry,
        properties: {
          id: row.id,
          survey_number: row.survey_number,
          area_hectares: parseFloat(row.area_hectares),
          owner_name: row.owner_name,
          status: row.status,
          land_type: row.land_type,
          village: row.village,
          project_id: row.project_id,
          project_name: row.project_name,
          state: row.state,
          district: row.district,
          assessed_amount: row.assessed_amount ? parseFloat(row.assessed_amount) : 0,
          approved_amount: row.approved_amount ? parseFloat(row.approved_amount) : 0,
          paid_amount: row.paid_amount ? parseFloat(row.paid_amount) : 0,
          payment_status: row.payment_status
        }
      };
    });

    res.json({
      type: 'FeatureCollection',
      features
    });
  } catch (err) {
    console.error('[CITIZEN MAP DATA ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve your geospatial cadastral map data.' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 3 — View Official Land Information (Strict Ownership Verification)
// GET /api/citizen/parcels/:id
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/parcels/:id', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.id, 10);
    if (isNaN(parcelId)) {
      return res.status(400).json({ error: 'Invalid parcel ID provided.' });
    }

    // Step 1: Query the parcel
    const checkResult = await query(
      `SELECT 
        lp.*,
        p.name AS project_name,
        p.project_code,
        p.project_type,
        p.requesting_body,
        p.state AS project_state,
        p.district AS project_district,
        p.status AS project_status,
        c.id AS compensation_id,
        c.assessed_amount,
        c.approved_amount,
        c.paid_amount,
        c.payment_status,
        c.rnr_status,
        c.housing_status,
        c.livelihood_status,
        c.resettlement_status,
        c.bank_account_masked,
        c.ifsc_code,
        c.utr_number,
        c.disbursed_at
       FROM land_parcels lp
       LEFT JOIN projects p ON lp.project_id = p.id
       LEFT JOIN compensation c ON lp.id = c.parcel_id
       WHERE lp.id = $1;`,
      [parcelId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Statutory land parcel record not found.' });
    }

    const parcel = checkResult.rows[0];

    // CRITICAL STATUTORY SECURITY CHECK: Verify ownership
    if (parcel.owner_user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Access forbidden: You do not have statutory ownership rights to inspect this land parcel.'
      });
    }

    const assessed = parseFloat(parcel.assessed_amount) || 0;
    const approved = parcel.approved_amount !== null && parcel.approved_amount !== undefined ? parseFloat(parcel.approved_amount) : assessed;
    const paid = parseFloat(parcel.paid_amount) || 0;
    const pending = Math.max(0, approved - paid);
    const computedStatus = computeCompensationStatus(paid, approved);
    const rnrPct = computeRnrPercentage(parcel.housing_status, parcel.livelihood_status, parcel.resettlement_status);

    res.json({
      parcel: {
        ...parcel,
        assessed_amount: assessed,
        approved_amount: approved,
        paid_amount: paid,
        pending_amount: pending,
        computed_compensation_status: computedStatus,
        rnr_overall_pct: rnrPct
      }
    });
  } catch (err) {
    console.error('[CITIZEN PARCEL DETAIL ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve official parcel dossier.' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 5 & 6 — Compensation Tracking & R&R Status
// GET /api/citizen/compensation/:parcelId
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/compensation/:parcelId', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.parcelId, 10);
    if (isNaN(parcelId)) {
      return res.status(400).json({ error: 'Invalid parcel ID provided.' });
    }

    const result = await query(
      `SELECT 
        c.*,
        lp.survey_number,
        lp.area_hectares,
        lp.owner_name,
        lp.village,
        lp.status AS parcel_status,
        lp.owner_user_id,
        p.id AS project_id,
        p.name AS project_name,
        p.project_code,
        p.state,
        p.district
       FROM compensation c
       JOIN land_parcels lp ON c.parcel_id = lp.id
       JOIN projects p ON lp.project_id = p.id
       WHERE c.parcel_id = $1;`,
      [parcelId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compensation ledger not found for this parcel.' });
    }

    const row = result.rows[0];

    // CRITICAL OWNERSHIP CHECK: Reject with 403 if not owned by authenticated citizen
    if (row.owner_user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Access forbidden: You do not own this parcel\'s compensation ledger.'
      });
    }

    const assessed = parseFloat(row.assessed_amount) || 0;
    const approved = row.approved_amount !== null && row.approved_amount !== undefined ? parseFloat(row.approved_amount) : assessed;
    const paid = parseFloat(row.paid_amount) || 0;
    const pending = Math.max(0, approved - paid);
    const computedStatus = computeCompensationStatus(paid, approved);
    const rnrPct = computeRnrPercentage(row.housing_status, row.livelihood_status, row.resettlement_status);

    res.json({
      compensation: {
        id: row.id,
        parcel_id: row.parcel_id,
        survey_number: row.survey_number,
        area_hectares: parseFloat(row.area_hectares),
        village: row.village,
        owner_name: row.owner_name,
        parcel_status: row.parcel_status,
        project_id: row.project_id,
        project_name: row.project_name,
        assessed_amount: assessed,
        approved_amount: approved,
        paid_amount: paid,
        pending_amount: pending,
        status: computedStatus,
        payment_status: row.payment_status,
        rnr_status: row.rnr_status,
        rnr_applicable: row.rnr_status !== 'not_applicable',
        housing_status: row.housing_status || 'not_started',
        livelihood_status: row.livelihood_status || 'not_started',
        resettlement_status: row.resettlement_status || 'not_started',
        rnr_overall_pct: rnrPct,
        families_affected: row.families_affected,
        bank_account_masked: row.bank_account_masked,
        ifsc_code: row.ifsc_code,
        utr_number: row.utr_number,
        disbursed_at: row.disbursed_at
      }
    });
  } catch (err) {
    console.error('[CITIZEN COMPENSATION DETAIL ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve compensation and R&R status.' });
  }
});

// GET /api/citizen/compensation (List compensation for all parcels owned by citizen)
router.get('/compensation', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        c.*,
        lp.survey_number,
        lp.area_hectares,
        lp.owner_name,
        lp.village,
        lp.status AS parcel_status,
        lp.owner_user_id,
        p.id AS project_id,
        p.name AS project_name,
        p.state,
        p.district
       FROM compensation c
       JOIN land_parcels lp ON c.parcel_id = lp.id
       JOIN projects p ON lp.project_id = p.id
       WHERE lp.owner_user_id = $1
       ORDER BY c.id ASC;`,
      [req.user.id]
    );

    const ledgers = result.rows.map((row) => {
      const assessed = parseFloat(row.assessed_amount) || 0;
      const approved = row.approved_amount !== null && row.approved_amount !== undefined ? parseFloat(row.approved_amount) : assessed;
      const paid = parseFloat(row.paid_amount) || 0;
      const pending = Math.max(0, approved - paid);
      const computedStatus = computeCompensationStatus(paid, approved);
      const rnrPct = computeRnrPercentage(row.housing_status, row.livelihood_status, row.resettlement_status);

      return {
        id: row.id,
        parcel_id: row.parcel_id,
        survey_number: row.survey_number,
        area_hectares: parseFloat(row.area_hectares),
        village: row.village,
        owner_name: row.owner_name,
        parcel_status: row.parcel_status,
        project_id: row.project_id,
        project_name: row.project_name,
        assessed_amount: assessed,
        approved_amount: approved,
        paid_amount: paid,
        pending_amount: pending,
        status: computedStatus,
        payment_status: row.payment_status,
        rnr_status: row.rnr_status,
        rnr_applicable: row.rnr_status !== 'not_applicable',
        housing_status: row.housing_status || 'not_started',
        livelihood_status: row.livelihood_status || 'not_started',
        resettlement_status: row.resettlement_status || 'not_started',
        rnr_overall_pct: rnrPct,
        families_affected: row.families_affected,
        bank_account_masked: row.bank_account_masked,
        ifsc_code: row.ifsc_code,
        utr_number: row.utr_number,
        disbursed_at: row.disbursed_at
      };
    });

    res.json({ compensation: ledgers });
  } catch (err) {
    console.error('[CITIZEN COMPENSATION LIST ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve your compensation ledgers.' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 7 — Objection / Claim Submission & Tracking
// GET /api/citizen/objections
// POST /api/citizen/objections
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/objections', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        o.id,
        o.parcel_id,
        o.citizen_id,
        o.reason_category,
        o.description,
        o.document_id,
        o.status,
        o.created_at,
        lp.survey_number,
        lp.village,
        lp.area_hectares,
        p.name AS project_name,
        d.file_name AS document_name,
        d.file_path AS document_path
       FROM objections o
       JOIN land_parcels lp ON o.parcel_id = lp.id
       JOIN projects p ON lp.project_id = p.id
       LEFT JOIN documents d ON o.document_id = d.id
       WHERE o.citizen_id = $1
       ORDER BY o.created_at DESC;`,
      [req.user.id]
    );

    res.json({ objections: result.rows });
  } catch (err) {
    console.error('[CITIZEN GET OBJECTIONS ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve your filed objections.' });
  }
});

router.post('/objections', upload.single('document'), async (req, res) => {
  try {
    const { parcel_id, reason_category, description } = req.body;

    if (!parcel_id || !reason_category || !description) {
      return res.status(400).json({
        error: 'Parcel ID, Reason Category, and Description are statutory mandatory fields.'
      });
    }

    const validCategories = ['boundary_discrepancy', 'ownership_dispute', 'compensation_dispute', 'other'];
    if (!validCategories.includes(reason_category)) {
      return res.status(400).json({
        error: `Invalid reason category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    const pId = parseInt(parcel_id, 10);

    // CRITICAL OWNERSHIP CHECK: Citizen can ONLY file against their own parcel
    const parcelCheck = await query(
      `SELECT id, owner_user_id, project_id, survey_number, village FROM land_parcels WHERE id = $1;`,
      [pId]
    );

    if (parcelCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Specified land parcel does not exist.' });
    }

    const targetParcel = parcelCheck.rows[0];

    if (targetParcel.owner_user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Access forbidden: You cannot file an objection against a land parcel you do not statutorily own.'
      });
    }

    let documentId = null;
    let documentName = null;
    let documentPath = null;

    // Handle document upload if file attached
    if (req.file) {
      const docPath = `/uploads/${req.file.filename}`;
      const docResult = await query(
        `INSERT INTO documents (project_id, file_name, file_path, file_size, mime_type, version, uploaded_by, verified, visible_to_citizen)
         VALUES ($1, $2, $3, $4, $5, 1, $6, false, true)
         RETURNING id, file_name, file_path;`,
        [targetParcel.project_id, req.file.originalname, docPath, req.file.size, req.file.mimetype, req.user.id]
      );
      documentId = docResult.rows[0].id;
      documentName = docResult.rows[0].file_name;
      documentPath = docResult.rows[0].file_path;
    }

    // Insert objection
    const insertResult = await query(
      `INSERT INTO objections (parcel_id, citizen_id, reason_category, description, document_id, status)
       VALUES ($1, $2, $3, $4, $5, 'submitted')
       RETURNING *;`,
      [pId, req.user.id, reason_category, description.trim(), documentId]
    );

    const newObj = insertResult.rows[0];

    // Log statutory activity
    await query(
      `INSERT INTO activity_log (project_id, user_id, action, remarks)
       VALUES ($1, $2, 'Citizen Lodged Statutory Section 15 Objection', $3);`,
      [
        targetParcel.project_id,
        req.user.id,
        `Objection lodged on Survey ${targetParcel.survey_number} (${targetParcel.village}) under category '${reason_category}'.`
      ]
    );

    // Also push a confirmation notification for the citizen
    await query(
      `INSERT INTO notifications (user_id, title, message, type, project_id)
       VALUES ($1, 'Objection Claim Acknowledged', $2, 'update', $3);`,
      [
        req.user.id,
        `Your objection for Survey ${targetParcel.survey_number} has been submitted successfully with reference #OBJ-${newObj.id}. CALA officer assigned for verification.`,
        targetParcel.project_id
      ]
    );

    res.status(201).json({
      message: 'Statutory objection registered successfully.',
      objection: {
        ...newObj,
        survey_number: targetParcel.survey_number,
        village: targetParcel.village,
        document_name: documentName,
        document_path: documentPath
      }
    });
  } catch (err) {
    console.error('[CITIZEN POST OBJECTION ERROR]:', err);
    res.status(500).json({ error: 'Failed to record statutory objection.' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE 8 — Official Documents (Filtered by visible_to_citizen AND owned projects)
// GET /api/citizen/documents
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/documents', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        d.id,
        d.project_id,
        d.file_name,
        d.file_path,
        d.file_size,
        d.mime_type,
        d.version,
        d.verified,
        d.verified_by,
        d.verified_at,
        d.uploaded_at,
        p.name AS project_name,
        p.project_code,
        p.state,
        p.district
       FROM documents d
       JOIN projects p ON d.project_id = p.id
       WHERE d.visible_to_citizen = true
         AND d.project_id IN (
           SELECT project_id FROM land_parcels WHERE owner_user_id = $1
         )
       ORDER BY d.uploaded_at DESC;`,
      [req.user.id]
    );

    res.json({ documents: result.rows });
  } catch (err) {
    console.error('[CITIZEN DOCUMENTS ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve statutory documents catalog.' });
  }
});

module.exports = router;
