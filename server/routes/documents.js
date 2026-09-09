const express = require('express');
const router = express.Router();
const path = require('path');
const { query } = require('../db/pool');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/documents -> List documents
router.get('/', async (req, res) => {
  try {
    const { project_id } = req.query;
    let sql = `
      SELECT d.*, p.name AS project_name, p.state, p.district, u.name AS uploader_name, u.role AS uploader_role
      FROM documents d
      JOIN projects p ON d.project_id = p.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) {
      params.push(project_id);
      sql += ` AND d.project_id = $${params.length}`;
    }

    sql += ` ORDER BY d.uploaded_at DESC;`;

    const result = await query(sql, params);
    res.json({ documents: result.rows });
  } catch (err) {
    console.error('[DOCUMENTS GET ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve statutory documents vault.' });
  }
});

// POST /api/documents -> Upload statutory file (multipart)
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { project_id, version = 1 } = req.body;

    if (!project_id || !req.file) {
      return res.status(400).json({ error: 'Project ID and document file are required.' });
    }

    const relativePath = `/uploads/${req.file.filename}`;

    const result = await query(
      `INSERT INTO documents (project_id, file_name, file_path, file_size, mime_type, version, uploaded_by, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false)
       RETURNING *;`,
      [project_id, req.file.originalname, relativePath, req.file.size, req.file.mimetype, parseInt(version, 10) || 1, req.user.id]
    );

    // Record activity log
    await query(
      `INSERT INTO activity_log (project_id, user_id, action, remarks)
       VALUES ($1, $2, 'Uploaded Statutory Document: ' || $3, 'Version ' || $4 || ' vaulted in NIC repository.');`,
      [project_id, req.user.id, req.file.originalname, version]
    );

    res.status(201).json({
      message: 'Statutory document uploaded and vaulted successfully.',
      document: result.rows[0]
    });
  } catch (err) {
    console.error('[DOCUMENT UPLOAD ERROR]:', err);
    res.status(500).json({ error: 'Failed to upload and catalog document.' });
  }
});

// PATCH /api/documents/:id/verify -> Toggle verification checkmark (role-gated)
router.patch('/:id/verify', authenticateToken, authorizeRoles('district_official', 'state_official', 'ministry_official'), async (req, res) => {
  try {
    const docId = parseInt(req.params.id, 10);

    const checkResult = await query('SELECT * FROM documents WHERE id = $1;', [docId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document record not found.' });
    }

    const current = checkResult.rows[0];
    const newVerified = !current.verified;
    const verifiedBy = newVerified ? `${req.user.name} (${req.user.designation || req.user.role})` : null;
    const verifiedAt = newVerified ? new Date() : null;

    const updateResult = await query(
      `UPDATE documents 
       SET verified = $1, verified_by = $2, verified_at = $3
       WHERE id = $4
       RETURNING *;`,
      [newVerified, verifiedBy, verifiedAt, docId]
    );

    res.json({
      message: newVerified ? 'Document verified and signed.' : 'Verification revoked.',
      document: updateResult.rows[0]
    });
  } catch (err) {
    console.error('[DOCUMENT VERIFY ERROR]:', err);
    res.status(500).json({ error: 'Failed to toggle document verification state.' });
  }
});

module.exports = router;
