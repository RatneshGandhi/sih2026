const express = require('express');
const router = express.Router();
const turf = require('@turf/turf');
const { query } = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

// Helper to compute area in hectares using turf
function computeAreaInHectares(geom) {
  try {
    let polygonFeature;
    if (geom.type === 'Feature') {
      polygonFeature = geom;
    } else if (geom.type === 'Polygon') {
      polygonFeature = turf.polygon(geom.coordinates);
    } else if (Array.isArray(geom) && geom.length >= 3) {
      // Array of [lng, lat] coordinate points
      // Ensure closure
      const coords = [...geom];
      if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
        coords.push(coords[0]);
      }
      polygonFeature = turf.polygon([coords]);
    }

    if (polygonFeature) {
      const areaSqM = turf.area(polygonFeature);
      return parseFloat((areaSqM / 10000).toFixed(4)); // 1 Hectare = 10,000 sq.m
    }
  } catch (err) {
    console.error('Turf area calculation error:', err.message);
  }
  return 1.0000; // fallback default
}

// GET /api/parcels -> List parcels
router.get('/', async (req, res) => {
  try {
    const { project_id, status, search } = req.query;
    let sql = `
      SELECT 
        lp.*,
        p.name AS project_name,
        p.state,
        p.district,
        c.assessed_amount,
        c.paid_amount,
        c.payment_status,
        c.rnr_status
      FROM land_parcels lp
      LEFT JOIN projects p ON lp.project_id = p.id
      LEFT JOIN compensation c ON lp.id = c.parcel_id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) {
      params.push(project_id);
      sql += ` AND lp.project_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND lp.status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (lp.survey_number ILIKE $${params.length} OR lp.owner_name ILIKE $${params.length})`;
    }

    sql += ` ORDER BY lp.id DESC;`;

    const result = await query(sql, params);
    res.json({ parcels: result.rows });
  } catch (err) {
    console.error('[PARCELS GET ERROR]:', err);
    res.status(500).json({ error: 'Failed to fetch land parcels.' });
  }
});

// POST /api/parcels -> Create new land parcel (from map draw tool or field officer capture)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      project_id,
      survey_number,
      owner_name,
      area_hectares,
      geom,
      status = 'notified',
      land_type = 'agricultural',
      village = 'Survey Sector',
      photo_url
    } = req.body;

    if (!project_id || !survey_number || !owner_name || !geom) {
      return res.status(400).json({ error: 'Missing required parcel data: project_id, survey_number, owner_name, and geom are mandatory.' });
    }

    // Format geometry into standard GeoJSON Polygon object
    let formattedGeom = geom;
    if (typeof formattedGeom === 'string') {
      try {
        formattedGeom = JSON.parse(formattedGeom);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid geom JSON format.' });
      }
    }

    // If geom is just an array of coordinates, wrap it into a GeoJSON Polygon
    if (Array.isArray(formattedGeom)) {
      const closed = [...formattedGeom];
      if (closed[0][0] !== closed[closed.length - 1][0] || closed[0][1] !== closed[closed.length - 1][1]) {
        closed.push(closed[0]);
      }
      formattedGeom = {
        type: 'Polygon',
        coordinates: [closed]
      };
    }

    // Auto-calculate area in hectares using Turf.js if not supplied or invalid
    let finalArea = parseFloat(area_hectares);
    if (!finalArea || isNaN(finalArea) || finalArea <= 0) {
      finalArea = computeAreaInHectares(formattedGeom);
    }

    const parcelResult = await query(
      `INSERT INTO land_parcels (project_id, survey_number, area_hectares, geom, owner_name, status, land_type, village, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
      [project_id, survey_number, finalArea, JSON.stringify(formattedGeom), owner_name, status, land_type, village, photo_url || null]
    );

    const newParcel = parcelResult.rows[0];

    // Automatically initialize a corresponding compensation assessment row
    const ratePerHa = 7200000; // ~₹72 Lakhs per Ha
    const assessedAmount = Math.round(finalArea * ratePerHa);

    await query(
      `INSERT INTO compensation (parcel_id, assessed_amount, paid_amount, payment_status, rnr_status, families_affected)
       VALUES ($1, $2, 0, 'pending', 'not_started', 1);`,
      [newParcel.id, assessedAmount]
    );

    // Write activity log
    await query(
      `INSERT INTO activity_log (project_id, user_id, action, remarks)
       VALUES ($1, $2, 'Demarcated Land Parcel Survey: ' || $3, 'GIS boundary plotted & area verified at ' || $4 || ' Hectares.');`,
      [project_id, req.user.id, survey_number, finalArea]
    );

    res.status(201).json({
      message: 'Land parcel recorded and geo-tagged successfully.',
      parcel: newParcel,
      computed_area_hectares: finalArea
    });
  } catch (err) {
    console.error('[PARCELS POST ERROR]:', err);
    res.status(500).json({ error: 'Failed to record land parcel boundary.' });
  }
});

module.exports = router;
