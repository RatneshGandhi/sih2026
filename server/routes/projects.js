const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const WORKFLOW_STAGES = [
  'proposal_submitted',
  'document_verification',
  'district_scrutiny',
  'state_approval',
  'award_declared',
  'compensation_disbursed',
  'possession_taken'
];

// GET /api/projects -> List with filters
router.get('/', async (req, res) => {
  try {
    const { state, status, type, search } = req.query;
    let sql = `
      SELECT 
        p.id, 
        p.name, 
        p.project_code, 
        p.project_type, 
        p.requesting_body, 
        p.state, 
        p.district, 
        p.status, 
        p.target_completion_date, 
        p.estimated_budget_cr, 
        p.created_at,
        COUNT(DISTINCT lp.id) AS parcels_count,
        COALESCE(SUM(lp.area_hectares), 0) AS total_area_ha,
        COUNT(DISTINCT d.id) AS documents_count
      FROM projects p
      LEFT JOIN land_parcels lp ON p.id = lp.project_id
      LEFT JOIN documents d ON p.id = d.project_id
      WHERE 1=1
    `;
    const params = [];

    if (state) {
      params.push(state);
      sql += ` AND LOWER(p.state) = LOWER($${params.length})`;
    }
    if (status) {
      params.push(status);
      sql += ` AND p.status = $${params.length}`;
    }
    if (type) {
      params.push(type);
      sql += ` AND p.project_type = $${params.length}`;
    }
    if (search) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.project_code ILIKE $${params.length} OR p.district ILIKE $${params.length})`;
    }

    sql += ` GROUP BY p.id ORDER BY p.created_at DESC;`;

    const result = await query(sql, params);
    res.json({ projects: result.rows });
  } catch (err) {
    console.error('[PROJECTS LIST ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve projects directory.' });
  }
});

// GET /api/projects/:id -> Project details with parcels, documents, and audit log
router.get('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID.' });
    }

    const projResult = await query(
      `SELECT * FROM projects WHERE id = $1;`,
      [projectId]
    );

    if (projResult.rows.length === 0) {
      return res.status(404).json({ error: 'Statutory project dossier not found.' });
    }

    const project = projResult.rows[0];

    // Nested parcels
    const parcelsResult = await query(
      `SELECT lp.*, c.assessed_amount, c.paid_amount, c.payment_status, c.rnr_status, c.families_affected 
       FROM land_parcels lp
       LEFT JOIN compensation c ON lp.id = c.parcel_id
       WHERE lp.project_id = $1
       ORDER BY lp.id ASC;`,
      [projectId]
    );

    // Nested documents
    const docsResult = await query(
      `SELECT d.*, u.name AS uploader_name 
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.project_id = $1
       ORDER BY d.uploaded_at DESC;`,
      [projectId]
    );

    // Nested activity log
    const logResult = await query(
      `SELECT a.*, u.name AS user_name, u.role AS user_role, u.designation AS user_designation
       FROM activity_log a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.project_id = $1
       ORDER BY a.created_at DESC;`,
      [projectId]
    );

    // Current stage index in 7-stage workflow
    const currentStageIndex = WORKFLOW_STAGES.indexOf(project.status);
    const nextStage = currentStageIndex >= 0 && currentStageIndex < WORKFLOW_STAGES.length - 1
      ? WORKFLOW_STAGES[currentStageIndex + 1]
      : null;

    res.json({
      project,
      currentStageIndex,
      nextStage,
      workflowStages: WORKFLOW_STAGES,
      parcels: parcelsResult.rows,
      documents: docsResult.rows,
      activityLog: logResult.rows
    });
  } catch (err) {
    console.error('[PROJECT DETAIL ERROR]:', err);
    res.status(500).json({ error: 'Failed to fetch project dossier details.' });
  }
});

// POST /api/projects -> Create new project
router.post('/', authenticateToken, authorizeRoles('district_official', 'state_official', 'ministry_official'), async (req, res) => {
  try {
    const { name, project_type, requesting_body, state, district, target_completion_date, estimated_budget_cr, description } = req.body;

    if (!name || !project_type || !requesting_body || !state || !district) {
      return res.status(400).json({ error: 'Missing required statutory fields for project registration.' });
    }

    const code = `PROP-${new Date().getFullYear()}-${state.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await query(
      `INSERT INTO projects (name, project_code, project_type, requesting_body, state, district, status, target_completion_date, estimated_budget_cr, description)
       VALUES ($1, $2, $3, $4, $5, $6, 'proposal_submitted', $7, $8, $9) RETURNING *;`,
      [name, code, project_type, requesting_body, state, district, target_completion_date || null, estimated_budget_cr || 0, description || '']
    );

    const newProject = result.rows[0];

    // Log creation
    await query(
      `INSERT INTO activity_log (project_id, user_id, action, from_status, to_status, remarks)
       VALUES ($1, $2, 'Proposal Registration & Dossier Opened', NULL, 'proposal_submitted', 'New sovereign land acquisition proposal registered on portal.');`,
      [newProject.id, req.user.id]
    );

    res.status(201).json({ message: 'Project proposal registered successfully.', project: newProject });
  } catch (err) {
    console.error('[PROJECT CREATE ERROR]:', err);
    res.status(500).json({ error: 'Failed to register project proposal.' });
  }
});

// PATCH /api/projects/:id/advance-status -> Moves to next workflow stage
router.patch('/:id/advance-status', authenticateToken, authorizeRoles('district_official', 'state_official', 'ministry_official'), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const { remarks, dsc_verified } = req.body;

    const projResult = await query('SELECT * FROM projects WHERE id = $1;', [projectId]);
    if (projResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const project = projResult.rows[0];
    const currentIndex = WORKFLOW_STAGES.indexOf(project.status);

    if (currentIndex === -1 || currentIndex >= WORKFLOW_STAGES.length - 1) {
      return res.status(400).json({ error: 'Project is already in final statutory stage or status is invalid.' });
    }

    const nextStage = WORKFLOW_STAGES[currentIndex + 1];

    // Update project status
    await query(
      `UPDATE projects SET status = $1 WHERE id = $2;`,
      [nextStage, projectId]
    );

    // Write activity log
    const actionText = `Advanced statutory lifecycle to ${nextStage.replace(/_/g, ' ').toUpperCase()}${dsc_verified ? ' (DSC Digitally Authenticated)' : ''}`;
    await query(
      `INSERT INTO activity_log (project_id, user_id, action, from_status, to_status, remarks)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [projectId, req.user.id, actionText, project.status, nextStage, remarks || 'Statutory stage transitioned following official order review.']
    );

    // Create notification for interested users
    await query(
      `INSERT INTO notifications (user_id, title, message, type, project_id)
       SELECT u.id, 
              'Project Stage Advanced: ' || $1, 
              'Project ' || $1 || ' moved to stage: ' || $2 || ' by ' || $3, 
              'update', 
              $4
       FROM users u
       WHERE u.role IN ('district_official', 'state_official', 'ministry_official')
       LIMIT 5;`,
      [project.name, nextStage.replace(/_/g, ' ').toUpperCase(), req.user.name, projectId]
    );

    res.json({
      message: `Project successfully advanced from ${project.status} to ${nextStage}.`,
      previous_status: project.status,
      new_status: nextStage
    });
  } catch (err) {
    console.error('[ADVANCE STATUS ERROR]:', err);
    res.status(500).json({ error: 'Failed to advance project workflow stage.' });
  }
});

module.exports = router;
