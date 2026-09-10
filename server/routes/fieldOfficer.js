const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Enforce authentication and field_officer role across all routes in this file
router.use(authenticateToken);
router.use(authorizeRoles('field_officer'));

// Helper: Ensure the parcel is assigned to the requesting Field Officer
async function verifyParcelAssignment(parcelId, officerId) {
  const result = await query(
    `SELECT fa.*, lp.survey_number, lp.project_id
     FROM field_assignments fa
     JOIN land_parcels lp ON fa.parcel_id = lp.id
     WHERE fa.parcel_id = $1 AND fa.officer_id = $2;`,
    [parcelId, officerId]
  );
  return result.rows[0] || null;
}

// ==========================================
// 1. OVERVIEW & METRICS
// ==========================================
// GET /api/field/overview
router.get('/overview', async (req, res) => {
  try {
    const officerId = req.user.id;

    // Counts by status
    const countsResult = await query(
      `SELECT 
         COUNT(*) AS total_assigned,
         COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
         COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_count,
         COUNT(*) FILTER (WHERE status IN ('verified', 'submitted_for_review')) AS completed_count,
         COUNT(*) FILTER (WHERE status = 'disputed') AS disputed_count,
         COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status NOT IN ('verified', 'submitted_for_review')) AS overdue_count
       FROM field_assignments
       WHERE officer_id = $1;`,
      [officerId]
    );

    const counts = countsResult.rows[0] || {};

    // Recent assigned parcels
    const recentParcels = await query(
      `SELECT 
         fa.id AS assignment_id,
         fa.parcel_id,
         fa.assigned_date,
         fa.due_date,
         fa.priority,
         fa.status AS verification_status,
         lp.survey_number,
         lp.area_hectares,
         lp.village,
         lp.land_type,
         p.name AS project_name,
         p.district,
         p.state
       FROM field_assignments fa
       JOIN land_parcels lp ON fa.parcel_id = lp.id
       JOIN projects p ON lp.project_id = p.id
       WHERE fa.officer_id = $1
       ORDER BY fa.assigned_date DESC
       LIMIT 8;`,
      [officerId]
    );

    // Overdue or Upcoming urgent tasks
    const urgentTasks = await query(
      `SELECT 
         fa.parcel_id,
         fa.due_date,
         fa.priority,
         fa.status AS verification_status,
         lp.survey_number,
         lp.village,
         p.name AS project_name,
         CASE 
           WHEN fa.due_date < CURRENT_DATE THEN 'overdue'
           WHEN fa.due_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'due_soon'
           ELSE 'on_track'
         END AS urgency
       FROM field_assignments fa
       JOIN land_parcels lp ON fa.parcel_id = lp.id
       JOIN projects p ON lp.project_id = p.id
       WHERE fa.officer_id = $1 AND fa.status NOT IN ('verified', 'submitted_for_review')
       ORDER BY fa.due_date ASC
       LIMIT 5;`,
      [officerId]
    );

    // Recent Issues
    const recentIssues = await query(
      `SELECT fi.*, lp.survey_number, lp.village
       FROM field_issues fi
       JOIN land_parcels lp ON fi.parcel_id = lp.id
       WHERE fi.officer_id = $1
       ORDER BY fi.created_at DESC
       LIMIT 5;`,
      [officerId]
    );

    res.json({
      kpis: {
        total_assigned: parseInt(counts.total_assigned || 0, 10),
        pending_count: parseInt(counts.pending_count || 0, 10),
        in_progress_count: parseInt(counts.in_progress_count || 0, 10),
        completed_count: parseInt(counts.completed_count || 0, 10),
        disputed_count: parseInt(counts.disputed_count || 0, 10),
        overdue_count: parseInt(counts.overdue_count || 0, 10),
      },
      recent_parcels: recentParcels.rows,
      urgent_tasks: urgentTasks.rows,
      recent_issues: recentIssues.rows
    });
  } catch (err) {
    console.error('[FIELD OVERVIEW ERROR]:', err);
    res.status(500).json({ error: 'Failed to aggregate field officer overview metrics.' });
  }
});

// ==========================================
// 2. ASSIGNED PARCELS MODULE
// ==========================================
// GET /api/field/parcels
router.get('/parcels', async (req, res) => {
  try {
    const officerId = req.user.id;
    const { search, status, priority, project_id, sort_by = 'assigned_date', sort_order = 'DESC' } = req.query;

    let sql = `
      SELECT 
        fa.id AS assignment_id,
        fa.parcel_id,
        fa.assigned_date,
        fa.due_date,
        fa.priority,
        fa.status AS verification_status,
        lp.id,
        lp.survey_number,
        lp.area_hectares,
        lp.owner_name,
        lp.land_type,
        lp.village,
        lp.status AS official_parcel_status,
        lp.geom,
        p.id AS project_id,
        p.name AS project_name,
        p.district,
        p.state,
        fv.step_progress,
        fv.gps_lat,
        fv.gps_lng,
        fv.boundary_match,
        fv.area_mismatch_flag,
        (SELECT COUNT(*) FROM field_issues fi WHERE fi.parcel_id = lp.id AND fi.status = 'open') AS open_issues_count
      FROM field_assignments fa
      JOIN land_parcels lp ON fa.parcel_id = lp.id
      JOIN projects p ON lp.project_id = p.id
      LEFT JOIN field_verifications fv ON fv.parcel_id = lp.id AND fv.officer_id = fa.officer_id
      WHERE fa.officer_id = $1
    `;
    const params = [officerId];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND fa.status = $${params.length}`;
    }

    if (priority && priority !== 'all') {
      params.push(priority);
      sql += ` AND fa.priority = $${params.length}`;
    }

    if (project_id) {
      params.push(project_id);
      sql += ` AND lp.project_id = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (
        lp.survey_number ILIKE $${params.length} 
        OR lp.village ILIKE $${params.length} 
        OR p.name ILIKE $${params.length}
        OR CAST(lp.id AS TEXT) ILIKE $${params.length}
      )`;
    }

    // Sorting
    const allowedSortFields = {
      assigned_date: 'fa.assigned_date',
      due_date: 'fa.due_date',
      priority: 'fa.priority',
      status: 'fa.status',
      survey_number: 'lp.survey_number',
      area_hectares: 'lp.area_hectares'
    };
    const sortField = allowedSortFields[sort_by] || 'fa.assigned_date';
    const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${sortField} ${order};`;

    const result = await query(sql, params);
    res.json({ parcels: result.rows });
  } catch (err) {
    console.error('[FIELD PARCELS GET ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve assigned parcels.' });
  }
});

// GET /api/field/parcels/:id
router.get('/parcels/:id', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.id, 10);
    const officerId = req.user.id;

    const assignment = await verifyParcelAssignment(parcelId, officerId);
    if (!assignment) {
      return res.status(403).json({ error: 'Unauthorized: This parcel is not assigned to you.' });
    }

    // Full parcel + project + compensation info (read only official records)
    const parcelRes = await query(
      `SELECT 
         lp.*,
         p.name AS project_name,
         p.project_code,
         p.project_type,
         p.state,
         p.district,
         p.status AS project_lifecycle_status,
         fa.id AS assignment_id,
         fa.assigned_date,
         fa.due_date,
         fa.priority,
         fa.status AS verification_status,
         c.assessed_amount,
         c.paid_amount,
         c.payment_status,
         c.rnr_status
       FROM land_parcels lp
       JOIN projects p ON lp.project_id = p.id
       JOIN field_assignments fa ON lp.id = fa.parcel_id AND fa.officer_id = $1
       LEFT JOIN compensation c ON lp.id = c.parcel_id
       WHERE lp.id = $2;`,
      [officerId, parcelId]
    );

    if (parcelRes.rows.length === 0) {
      return res.status(404).json({ error: 'Parcel record not found.' });
    }

    const parcel = parcelRes.rows[0];

    // Verification draft/status
    const verifRes = await query(
      `SELECT * FROM field_verifications WHERE parcel_id = $1 AND officer_id = $2;`,
      [parcelId, officerId]
    );

    res.json({
      parcel,
      verification: verifRes.rows[0] || null
    });
  } catch (err) {
    console.error('[FIELD PARCEL DETAIL ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve parcel details.' });
  }
});

// ==========================================
// 3. GIS MAP DATA FOR ASSIGNED PARCELS
// ==========================================
// GET /api/field/map-data
router.get('/map-data', async (req, res) => {
  try {
    const officerId = req.user.id;

    const result = await query(
      `SELECT 
         lp.id,
         lp.survey_number,
         lp.area_hectares,
         lp.owner_name,
         lp.land_type,
         lp.village,
         lp.geom,
         fa.status AS verification_status,
         fa.priority,
         fa.due_date,
         p.name AS project_name,
         p.district,
         p.state,
         fv.gps_lat,
         fv.gps_lng
       FROM field_assignments fa
       JOIN land_parcels lp ON fa.parcel_id = lp.id
       JOIN projects p ON lp.project_id = p.id
       LEFT JOIN field_verifications fv ON fv.parcel_id = lp.id AND fv.officer_id = fa.officer_id
       WHERE fa.officer_id = $1;`,
      [officerId]
    );

    const features = result.rows.map((row) => {
      let geometry = row.geom;
      if (typeof geometry === 'string') {
        try { geometry = JSON.parse(geometry); } catch (e) { geometry = null; }
      }

      return {
        type: 'Feature',
        geometry,
        properties: {
          id: row.id,
          survey_number: row.survey_number,
          area_hectares: row.area_hectares,
          owner_name: row.owner_name,
          land_type: row.land_type,
          village: row.village,
          status: row.verification_status,
          priority: row.priority,
          due_date: row.due_date,
          project_name: row.project_name,
          district: row.district,
          state: row.state,
          verified_gps: row.gps_lat && row.gps_lng ? [row.gps_lng, row.gps_lat] : null
        }
      };
    });

    res.json({
      type: 'FeatureCollection',
      features
    });
  } catch (err) {
    console.error('[FIELD MAP DATA ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve GIS map features.' });
  }
});

// ==========================================
// 4. VERIFICATION WORKFLOW & DRAFTING
// ==========================================
// POST /api/field/verifications/:parcelId/start
router.post('/verifications/:parcelId/start', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.parcelId, 10);
    const officerId = req.user.id;

    const assignment = await verifyParcelAssignment(parcelId, officerId);
    if (!assignment) {
      return res.status(403).json({ error: 'Unauthorized: Parcel not assigned to you.' });
    }

    // Update assignment status to in_progress
    await query(
      `UPDATE field_assignments 
       SET status = 'in_progress' 
       WHERE parcel_id = $1 AND officer_id = $2;`,
      [parcelId, officerId]
    );

    // Upsert verification record
    const verifRes = await query(
      `INSERT INTO field_verifications (parcel_id, officer_id, status, step_progress)
       VALUES ($1, $2, 'in_progress', 1)
       ON CONFLICT (parcel_id, officer_id) 
       DO UPDATE SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [parcelId, officerId]
    );

    // Audit log
    await query(
      `INSERT INTO activity_log (project_id, user_id, action, remarks)
       VALUES ($1, $2, 'Field Verification Started: Survey ' || $3, 'Field Officer commenced on-site verification.');`,
      [assignment.project_id, officerId, assignment.survey_number]
    );

    res.json({
      message: 'Field verification initiated.',
      verification: verifRes.rows[0]
    });
  } catch (err) {
    console.error('[START VERIFICATION ERROR]:', err);
    res.status(500).json({ error: 'Failed to start verification.' });
  }
});

// GET /api/field/verifications/:parcelId
router.get('/verifications/:parcelId', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.parcelId, 10);
    const officerId = req.user.id;

    const assignment = await verifyParcelAssignment(parcelId, officerId);
    if (!assignment) {
      return res.status(403).json({ error: 'Unauthorized: Parcel not assigned to you.' });
    }

    const verifRes = await query(
      `SELECT * FROM field_verifications WHERE parcel_id = $1 AND officer_id = $2;`,
      [parcelId, officerId]
    );

    res.json({
      verification: verifRes.rows[0] || null,
      assignment
    });
  } catch (err) {
    console.error('[GET VERIFICATION ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve verification record.' });
  }
});

// PUT /api/field/verifications/:parcelId/draft
router.put('/verifications/:parcelId/draft', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.parcelId, 10);
    const officerId = req.user.id;

    const assignment = await verifyParcelAssignment(parcelId, officerId);
    if (!assignment) {
      return res.status(403).json({ error: 'Unauthorized: Parcel not assigned to you.' });
    }

    const {
      step_progress,
      gps_lat,
      gps_lng,
      gps_accuracy,
      boundary_match,
      observed_area_hectares,
      area_mismatch_flag,
      boundary_remarks,
      observed_geom,
      land_use,
      occupancy,
      actual_condition,
      observation_remarks,
      general_remarks
    } = req.body;

    const gpsCapturedAt = (gps_lat && gps_lng) ? new Date() : null;

    const result = await query(
      `INSERT INTO field_verifications (
         parcel_id, officer_id, status, step_progress,
         gps_lat, gps_lng, gps_accuracy, gps_captured_at,
         boundary_match, observed_area_hectares, area_mismatch_flag, boundary_remarks, observed_geom,
         land_use, occupancy, actual_condition, observation_remarks, general_remarks, updated_at
       ) VALUES (
         $1, $2, 'in_progress', $3,
         $4, $5, $6, $7,
         $8, $9, $10, $11, $12,
         $13, $14, $15, $16, $17, CURRENT_TIMESTAMP
       )
       ON CONFLICT (parcel_id, officer_id) DO UPDATE SET
         step_progress = COALESCE($3, field_verifications.step_progress),
         gps_lat = COALESCE($4, field_verifications.gps_lat),
         gps_lng = COALESCE($5, field_verifications.gps_lng),
         gps_accuracy = COALESCE($6, field_verifications.gps_accuracy),
         gps_captured_at = COALESCE($7, field_verifications.gps_captured_at),
         boundary_match = COALESCE($8, field_verifications.boundary_match),
         observed_area_hectares = COALESCE($9, field_verifications.observed_area_hectares),
         area_mismatch_flag = COALESCE($10, field_verifications.area_mismatch_flag),
         boundary_remarks = COALESCE($11, field_verifications.boundary_remarks),
         observed_geom = COALESCE($12, field_verifications.observed_geom),
         land_use = COALESCE($13, field_verifications.land_use),
         occupancy = COALESCE($14, field_verifications.occupancy),
         actual_condition = COALESCE($15, field_verifications.actual_condition),
         observation_remarks = COALESCE($16, field_verifications.observation_remarks),
         general_remarks = COALESCE($17, field_verifications.general_remarks),
         updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [
        parcelId, officerId, step_progress || 1,
        gps_lat || null, gps_lng || null, gps_accuracy || null, gpsCapturedAt,
        boundary_match || null, observed_area_hectares || null, area_mismatch_flag || false, boundary_remarks || null,
        observed_geom ? JSON.stringify(observed_geom) : null,
        land_use || null, occupancy || null,
        actual_condition ? JSON.stringify(actual_condition) : '[]',
        observation_remarks || null, general_remarks || null
      ]
    );

    // Also keep assignment in in_progress
    await query(
      `UPDATE field_assignments SET status = 'in_progress' WHERE parcel_id = $1 AND officer_id = $2;`,
      [parcelId, officerId]
    );

    res.json({
      message: 'Draft saved successfully.',
      verification: result.rows[0]
    });
  } catch (err) {
    console.error('[SAVE DRAFT ERROR]:', err);
    res.status(500).json({ error: 'Failed to save verification draft.' });
  }
});

// POST /api/field/verifications/:parcelId/submit
router.post('/verifications/:parcelId/submit', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.parcelId, 10);
    const officerId = req.user.id;

    const assignment = await verifyParcelAssignment(parcelId, officerId);
    if (!assignment) {
      return res.status(403).json({ error: 'Unauthorized: Parcel not assigned to you.' });
    }

    const {
      gps_lat,
      gps_lng,
      gps_accuracy,
      boundary_match,
      observed_area_hectares,
      area_mismatch_flag,
      boundary_remarks,
      land_use,
      occupancy,
      actual_condition,
      observation_remarks,
      general_remarks
    } = req.body;

    // Strict validation
    if (!gps_lat || !gps_lng) {
      return res.status(400).json({ error: 'Validation Error: Real GPS coordinates must be captured before final submission.' });
    }

    if (!boundary_match) {
      return res.status(400).json({ error: 'Validation Error: Boundary verification status (Yes/No/Partially) is required.' });
    }

    if ((boundary_match !== 'yes' || area_mismatch_flag) && (!boundary_remarks || boundary_remarks.trim().length < 5)) {
      return res.status(400).json({ error: 'Validation Error: Remarks are mandatory when boundary does not fully match or area mismatch is flagged.' });
    }

    if (!land_use || !occupancy) {
      return res.status(400).json({ error: 'Validation Error: Land use and occupancy observations are mandatory.' });
    }

    // Save and update verification state
    const verifRes = await query(
      `INSERT INTO field_verifications (
         parcel_id, officer_id, status, step_progress,
         gps_lat, gps_lng, gps_accuracy, gps_captured_at,
         boundary_match, observed_area_hectares, area_mismatch_flag, boundary_remarks,
         land_use, occupancy, actual_condition, observation_remarks, general_remarks,
         submitted_at, updated_at
       ) VALUES (
         $1, $2, 'submitted_for_review', 7,
         $3, $4, $5, CURRENT_TIMESTAMP,
         $6, $7, $8, $9,
         $10, $11, $12, $13, $14,
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
       )
       ON CONFLICT (parcel_id, officer_id) DO UPDATE SET
         status = 'submitted_for_review',
         step_progress = 7,
         gps_lat = $3,
         gps_lng = $4,
         gps_accuracy = $5,
         gps_captured_at = CURRENT_TIMESTAMP,
         boundary_match = $6,
         observed_area_hectares = $7,
         area_mismatch_flag = $8,
         boundary_remarks = $9,
         land_use = $10,
         occupancy = $11,
         actual_condition = $12,
         observation_remarks = $13,
         general_remarks = $14,
         submitted_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [
        parcelId, officerId,
        gps_lat, gps_lng, gps_accuracy || null,
        boundary_match, observed_area_hectares || null, area_mismatch_flag || false, boundary_remarks || null,
        land_use, occupancy,
        actual_condition ? JSON.stringify(actual_condition) : '[]',
        observation_remarks || null, general_remarks || null
      ]
    );

    // Update assignment status to submitted_for_review
    await query(
      `UPDATE field_assignments 
       SET status = 'submitted_for_review' 
       WHERE parcel_id = $1 AND officer_id = $2;`,
      [parcelId, officerId]
    );

    // Mark draft evidence as non-draft
    await query(
      `UPDATE field_evidence 
       SET is_draft = false, verification_id = $1 
       WHERE parcel_id = $2 AND officer_id = $3;`,
      [verifRes.rows[0].id, parcelId, officerId]
    );

    // Record statutory audit entry
    await query(
      `INSERT INTO activity_log (project_id, user_id, action, from_status, to_status, remarks)
       VALUES ($1, $2, 'Field Verification Submitted: Survey ' || $3, 'in_progress', 'submitted_for_review', 'On-site verification completed & submitted for District Scrutiny. Boundary: ' || $4);`,
      [assignment.project_id, officerId, assignment.survey_number, boundary_match]
    );

    // Notify District Official
    const distOfficialRes = await query(`SELECT id FROM users WHERE role = 'district_official' LIMIT 1;`);
    if (distOfficialRes.rows.length > 0) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, project_id)
         VALUES ($1, $2, $3, 'approval_needed', $4);`,
        [
          distOfficialRes.rows[0].id,
          `Field Verification Ready for Review: Survey ${assignment.survey_number}`,
          `Field Officer ${req.user.name} has submitted ground verification and geo-tagged evidence for Survey No ${assignment.survey_number}.`,
          assignment.project_id
        ]
      );
    }

    res.json({
      message: 'Field verification successfully submitted for statutory review.',
      status: 'submitted_for_review',
      verification: verifRes.rows[0]
    });
  } catch (err) {
    console.error('[SUBMIT VERIFICATION ERROR]:', err);
    res.status(500).json({ error: 'Failed to submit verification report.' });
  }
});

// ==========================================
// 5. AFFECTED FAMILY VERIFICATION
// ==========================================
// GET /api/field/parcels/:parcelId/families
router.get('/parcels/:parcelId/families', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.parcelId, 10);
    const officerId = req.user.id;

    const assignment = await verifyParcelAssignment(parcelId, officerId);
    if (!assignment) {
      return res.status(403).json({ error: 'Unauthorized: Parcel not assigned to you.' });
    }

    const familiesRes = await query(
      `SELECT 
         af.*,
         fv.id AS field_verification_id,
         fv.verified_affected,
         fv.verified_displaced,
         fv.verified_rnr_required,
         fv.verified_member_count,
         fv.remarks AS field_remarks,
         fv.created_at AS verified_at
       FROM affected_families af
       LEFT JOIN family_verifications fv ON af.id = fv.family_id AND fv.officer_id = $1
       WHERE af.parcel_id = $2
       ORDER BY af.id ASC;`,
      [officerId, parcelId]
    );

    res.json({ families: familiesRes.rows });
  } catch (err) {
    console.error('[GET FAMILIES ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve affected families.' });
  }
});

// POST /api/field/parcels/:parcelId/families/:familyId/verify
router.post('/parcels/:parcelId/families/:familyId/verify', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.parcelId, 10);
    const familyId = parseInt(req.params.familyId, 10);
    const officerId = req.user.id;

    const assignment = await verifyParcelAssignment(parcelId, officerId);
    if (!assignment) {
      return res.status(403).json({ error: 'Unauthorized: Parcel not assigned to you.' });
    }

    const {
      verified_affected = 'yes',
      verified_displaced = 'no',
      verified_rnr_required = 'yes',
      verified_member_count,
      remarks
    } = req.body;

    // Get current verification record if exists
    const currentVerif = await query(
      `SELECT id FROM field_verifications WHERE parcel_id = $1 AND officer_id = $2;`,
      [parcelId, officerId]
    );
    const verificationId = currentVerif.rows[0]?.id || null;

    const result = await query(
      `INSERT INTO family_verifications (
         family_id, verification_id, officer_id,
         verified_affected, verified_displaced, verified_rnr_required,
         verified_member_count, remarks
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (family_id, officer_id) DO UPDATE SET
         verified_affected = $4,
         verified_displaced = $5,
         verified_rnr_required = $6,
         verified_member_count = $7,
         remarks = $8,
         created_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [
        familyId, verificationId, officerId,
        verified_affected, verified_displaced, verified_rnr_required,
        verified_member_count ? parseInt(verified_member_count, 10) : null,
        remarks || null
      ]
    );

    res.json({
      message: 'Proposed family verification recorded without modifying official records.',
      verification: result.rows[0]
    });
  } catch (err) {
    console.error('[VERIFY FAMILY ERROR]:', err);
    res.status(500).json({ error: 'Failed to record family verification.' });
  }
});

// ==========================================
// 6. PHOTO & EVIDENCE CAPTURE
// ==========================================
// POST /api/field/parcels/:parcelId/evidence
router.post('/parcels/:parcelId/evidence', upload.single('file'), async (req, res) => {
  try {
    const parcelId = parseInt(req.params.parcelId, 10);
    const officerId = req.user.id;

    const assignment = await verifyParcelAssignment(parcelId, officerId);
    if (!assignment) {
      return res.status(403).json({ error: 'Unauthorized: Parcel not assigned to you.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Missing photo evidence file.' });
    }

    const { category = 'site_photo', caption = '', gps_lat, gps_lng, is_draft = 'false' } = req.body;
    const relativePath = `/uploads/${req.file.filename}`;

    const currentVerif = await query(
      `SELECT id FROM field_verifications WHERE parcel_id = $1 AND officer_id = $2;`,
      [parcelId, officerId]
    );

    const result = await query(
      `INSERT INTO field_evidence (
         parcel_id, verification_id, officer_id, category, file_name, file_path, file_type, file_size, caption, gps_lat, gps_lng, is_draft
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *;`,
      [
        parcelId, currentVerif.rows[0]?.id || null, officerId,
        category, req.file.originalname, relativePath, req.file.mimetype, req.file.size,
        caption || null, gps_lat ? parseFloat(gps_lat) : null, gps_lng ? parseFloat(gps_lng) : null,
        is_draft === 'true'
      ]
    );

    res.status(201).json({
      message: 'Field evidence photo uploaded and geo-tagged.',
      evidence: result.rows[0]
    });
  } catch (err) {
    console.error('[EVIDENCE UPLOAD ERROR]:', err);
    res.status(500).json({ error: 'Failed to upload photo evidence.' });
  }
});

// GET /api/field/parcels/:parcelId/evidence
router.get('/parcels/:parcelId/evidence', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.parcelId, 10);
    const officerId = req.user.id;

    const result = await query(
      `SELECT * FROM field_evidence 
       WHERE parcel_id = $1 AND officer_id = $2
       ORDER BY created_at DESC;`,
      [parcelId, officerId]
    );

    res.json({ evidence: result.rows });
  } catch (err) {
    console.error('[GET EVIDENCE ERROR]:', err);
    res.status(500).json({ error: 'Failed to fetch field evidence.' });
  }
});

// DELETE /api/field/evidence/:id
router.delete('/evidence/:id', async (req, res) => {
  try {
    const evidenceId = parseInt(req.params.id, 10);
    const officerId = req.user.id;

    const checkResult = await query(
      `SELECT * FROM field_evidence WHERE id = $1 AND officer_id = $2;`,
      [evidenceId, officerId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Evidence item not found or unauthorized.' });
    }

    await query(`DELETE FROM field_evidence WHERE id = $1;`, [evidenceId]);

    res.json({ message: 'Draft evidence item deleted.' });
  } catch (err) {
    console.error('[DELETE EVIDENCE ERROR]:', err);
    res.status(500).json({ error: 'Failed to delete evidence.' });
  }
});

// ==========================================
// 7. DOCUMENT COLLECTION
// ==========================================
// POST /api/field/parcels/:parcelId/documents
router.post('/parcels/:parcelId/documents', upload.single('file'), async (req, res) => {
  try {
    const parcelId = parseInt(req.params.parcelId, 10);
    const officerId = req.user.id;

    const assignment = await verifyParcelAssignment(parcelId, officerId);
    if (!assignment) {
      return res.status(403).json({ error: 'Unauthorized: Parcel not assigned to you.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Missing document file.' });
    }

    const { doc_type = 'survey_report', description = '' } = req.body;
    const relativePath = `/uploads/${req.file.filename}`;

    const currentVerif = await query(
      `SELECT id FROM field_verifications WHERE parcel_id = $1 AND officer_id = $2;`,
      [parcelId, officerId]
    );

    const result = await query(
      `INSERT INTO field_documents (
         parcel_id, verification_id, officer_id, doc_type, file_name, file_path, file_size, description
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *;`,
      [
        parcelId, currentVerif.rows[0]?.id || null, officerId,
        doc_type, req.file.originalname, relativePath, req.file.size, description || null
      ]
    );

    res.status(201).json({
      message: 'Field survey document cataloged.',
      document: result.rows[0]
    });
  } catch (err) {
    console.error('[FIELD DOC UPLOAD ERROR]:', err);
    res.status(500).json({ error: 'Failed to upload field document.' });
  }
});

// GET /api/field/parcels/:parcelId/documents
router.get('/parcels/:parcelId/documents', async (req, res) => {
  try {
    const parcelId = parseInt(req.params.parcelId, 10);
    const officerId = req.user.id;

    const result = await query(
      `SELECT * FROM field_documents 
       WHERE parcel_id = $1 AND officer_id = $2
       ORDER BY created_at DESC;`,
      [parcelId, officerId]
    );

    res.json({ documents: result.rows });
  } catch (err) {
    console.error('[GET FIELD DOCS ERROR]:', err);
    res.status(500).json({ error: 'Failed to fetch field documents.' });
  }
});

// ==========================================
// 8. ISSUE / DISCREPANCY FLAGGING
// ==========================================
// GET /api/field/issues
router.get('/issues', async (req, res) => {
  try {
    const officerId = req.user.id;
    const { priority, status } = req.query;

    let sql = `
      SELECT fi.*, lp.survey_number, lp.village, p.name AS project_name
      FROM field_issues fi
      JOIN land_parcels lp ON fi.parcel_id = lp.id
      JOIN projects p ON lp.project_id = p.id
      WHERE fi.officer_id = $1
    `;
    const params = [officerId];

    if (priority && priority !== 'all') {
      params.push(priority);
      sql += ` AND fi.priority = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND fi.status = $${params.length}`;
    }

    sql += ` ORDER BY fi.created_at DESC;`;

    const result = await query(sql, params);
    res.json({ issues: result.rows });
  } catch (err) {
    console.error('[GET ISSUES ERROR]:', err);
    res.status(500).json({ error: 'Failed to fetch field issues.' });
  }
});

// POST /api/field/issues
router.post('/issues', async (req, res) => {
  try {
    const officerId = req.user.id;
    const {
      parcel_id,
      family_id,
      issue_type,
      priority = 'orange',
      title,
      description,
      gps_lat,
      gps_lng,
      supporting_evidence_url
    } = req.body;

    if (!parcel_id || !issue_type || !title || !description) {
      return res.status(400).json({ error: 'Parcel ID, Issue Type, Title, and Description are required.' });
    }

    const assignment = await verifyParcelAssignment(parcel_id, officerId);
    if (!assignment) {
      return res.status(403).json({ error: 'Unauthorized: Parcel not assigned to you.' });
    }

    const result = await query(
      `INSERT INTO field_issues (
         parcel_id, officer_id, family_id, issue_type, priority, title, description, gps_lat, gps_lng, supporting_evidence_url, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'open')
       RETURNING *;`,
      [
        parcel_id, officerId, family_id || null, issue_type, priority,
        title, description, gps_lat ? parseFloat(gps_lat) : null, gps_lng ? parseFloat(gps_lng) : null,
        supporting_evidence_url || null
      ]
    );

    // If Red/High priority discrepancy, also reflect in assignment status as 'disputed'
    if (priority === 'red' || priority === 'high') {
      await query(
        `UPDATE field_assignments SET status = 'disputed' WHERE parcel_id = $1 AND officer_id = $2;`,
        [parcel_id, officerId]
      );
    }

    // Write to audit log
    await query(
      `INSERT INTO activity_log (project_id, user_id, action, remarks)
       VALUES ($1, $2, 'Flagged Field Discrepancy: ' || $3, 'Priority: ' || $4 || '. Description: ' || $5);`,
      [assignment.project_id, officerId, title, priority, description]
    );

    res.status(201).json({
      message: 'Discrepancy flagged and recorded in statutory log.',
      issue: result.rows[0]
    });
  } catch (err) {
    console.error('[CREATE ISSUE ERROR]:', err);
    res.status(500).json({ error: 'Failed to record field issue.' });
  }
});

// ==========================================
// 9. POSSESSION EVIDENCE SUBMISSION
// ==========================================
// GET /api/field/possession
router.get('/possession', async (req, res) => {
  try {
    const officerId = req.user.id;

    const result = await query(
      `SELECT pe.*, lp.survey_number, lp.village, p.name AS project_name
       FROM possession_evidence pe
       JOIN land_parcels lp ON pe.parcel_id = lp.id
       JOIN projects p ON lp.project_id = p.id
       WHERE pe.officer_id = $1
       ORDER BY pe.created_at DESC;`,
      [officerId]
    );

    res.json({ possession_records: result.rows });
  } catch (err) {
    console.error('[GET POSSESSION RECORDS ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve possession evidence.' });
  }
});

// POST /api/field/possession
router.post('/possession', async (req, res) => {
  try {
    const officerId = req.user.id;
    const {
      parcel_id,
      possession_date,
      gps_lat,
      gps_lng,
      site_photo_url,
      supporting_doc_url,
      remarks
    } = req.body;

    if (!parcel_id || !possession_date || !site_photo_url || !remarks) {
      return res.status(400).json({ error: 'Parcel ID, possession date, site photograph URL, and remarks are mandatory.' });
    }

    const assignment = await verifyParcelAssignment(parcel_id, officerId);
    if (!assignment) {
      return res.status(403).json({ error: 'Unauthorized: Parcel not assigned to you.' });
    }

    const result = await query(
      `INSERT INTO possession_evidence (
         parcel_id, officer_id, possession_date, gps_lat, gps_lng, site_photo_url, supporting_doc_url, remarks, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'possession_evidence_submitted')
       RETURNING *;`,
      [
        parcel_id, officerId, possession_date,
        gps_lat ? parseFloat(gps_lat) : null, gps_lng ? parseFloat(gps_lng) : null,
        site_photo_url, supporting_doc_url || null, remarks
      ]
    );

    // Audit log
    await query(
      `INSERT INTO activity_log (project_id, user_id, action, remarks)
       VALUES ($1, $2, 'Possession Evidence Submitted: Survey ' || $3, 'Evidence submitted for administrative scrutiny. Official possession status remains un-finalized until District approval.');`,
      [assignment.project_id, officerId, assignment.survey_number]
    );

    res.status(201).json({
      message: 'Possession evidence submitted successfully for administrative scrutiny.',
      status: 'possession_evidence_submitted',
      possession: result.rows[0]
    });
  } catch (err) {
    console.error('[SUBMIT POSSESSION EVIDENCE ERROR]:', err);
    res.status(500).json({ error: 'Failed to submit possession evidence.' });
  }
});

// ==========================================
// 10. STRICT ROLE PERMISSION ENFORCEMENT
// ==========================================
// Explicit guards that deny Field Officer from performing unauthorized actions
router.all('/unauthorized-action-check', (req, res) => {
  res.status(403).json({
    error: 'Access Denied: Field Officer lacks statutory authority to alter legal titles, approve awards, approve compensation, or finalize possession.'
  });
});

module.exports = router;
