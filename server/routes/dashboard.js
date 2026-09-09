const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const { authenticateToken } = require('../middleware/auth');

// GET /api/dashboard/summary -> Aggregated KPI metrics computed with real SQL
router.get('/summary', async (req, res) => {
  try {
    // 1. Parcel Area Aggregates
    const areaStats = await query(`
      SELECT 
        COALESCE(SUM(area_hectares), 0) AS total_area_notified,
        COALESCE(SUM(CASE WHEN status IN ('acquired', 'possession_taken') THEN area_hectares ELSE 0 END), 0) AS total_area_acquired,
        COALESCE(SUM(CASE WHEN status = 'possession_taken' THEN area_hectares ELSE 0 END), 0) AS total_area_possessed,
        COUNT(*) AS total_parcels_count,
        COUNT(CASE WHEN status = 'possession_taken' THEN 1 END) AS possession_parcels_count,
        COUNT(CASE WHEN status = 'disputed' THEN 1 END) AS disputed_parcels_count
      FROM land_parcels;
    `);

    // 2. Compensation & R&R Aggregates
    const compStats = await query(`
      SELECT 
        COALESCE(SUM(assessed_amount), 0) AS total_assessed,
        COALESCE(SUM(paid_amount), 0) AS total_paid,
        COALESCE(SUM(families_affected), 0) AS total_families,
        COUNT(*) AS total_comp_records,
        COUNT(CASE WHEN rnr_status = 'completed' THEN 1 END) AS rnr_completed_count,
        COUNT(CASE WHEN rnr_status = 'in_progress' THEN 1 END) AS rnr_in_progress_count
      FROM compensation;
    `);

    // 3. Projects Count by Workflow Stage (for donut chart)
    const stageStats = await query(`
      SELECT status, COUNT(*) AS count
      FROM projects
      GROUP BY status;
    `);

    // 4. Projects Needing Attention (e.g. In scrutiny or with disputed parcels)
    const attentionProjects = await query(`
      SELECT 
        p.id, 
        p.name, 
        p.project_code,
        p.project_type, 
        p.state, 
        p.district, 
        p.status,
        COUNT(lp.id) AS total_parcels,
        COUNT(CASE WHEN lp.status = 'disputed' THEN 1 END) AS disputed_parcels
      FROM projects p
      LEFT JOIN land_parcels lp ON p.id = lp.project_id
      WHERE p.status IN ('district_scrutiny', 'document_verification') OR lp.status = 'disputed'
      GROUP BY p.id
      ORDER BY disputed_parcels DESC, p.created_at DESC
      LIMIT 5;
    `);

    const area = areaStats.rows[0];
    const comp = compStats.rows[0];

    const notifiedHa = parseFloat(area.total_area_notified) || 0;
    const acquiredHa = parseFloat(area.total_area_acquired) || 0;
    const possessedHa = parseFloat(area.total_area_possessed) || 0;
    const assessedCr = (parseFloat(comp.total_assessed) / 1e7) || 0; // in Crores
    const paidCr = (parseFloat(comp.total_paid) / 1e7) || 0;         // in Crores

    const pctAcquired = notifiedHa > 0 ? ((acquiredHa / notifiedHa) * 100).toFixed(1) : '0.0';
    const pctPossession = notifiedHa > 0 ? ((possessedHa / notifiedHa) * 100).toFixed(1) : '0.0';
    const pctPaid = comp.total_assessed > 0 ? ((comp.total_paid / comp.total_assessed) * 100).toFixed(1) : '0.0';
    const pctRnr = comp.total_comp_records > 0 ? ((comp.rnr_completed_count / comp.total_comp_records) * 100).toFixed(1) : '0.0';

    res.json({
      kpis: {
        total_area_notified_ha: notifiedHa.toFixed(2),
        total_area_acquired_ha: acquiredHa.toFixed(2),
        total_area_possessed_ha: possessedHa.toFixed(2),
        pct_acquired: pctAcquired,
        pct_possession: pctPossession,
        total_compensation_assessed_cr: assessedCr.toFixed(2),
        total_compensation_paid_cr: paidCr.toFixed(2),
        pct_compensation_disbursed: pctPaid,
        total_families_affected: parseInt(comp.total_families, 10) || 0,
        pct_rnr_completed: pctRnr,
        total_parcels: parseInt(area.total_parcels_count, 10) || 0,
        disputed_parcels: parseInt(area.disputed_parcels_count, 10) || 0
      },
      projects_by_stage: stageStats.rows,
      projects_needing_attention: attentionProjects.rows
    });
  } catch (err) {
    console.error('[DASHBOARD SUMMARY ERROR]:', err);
    res.status(500).json({ error: 'Failed to aggregate dashboard summary metrics.' });
  }
});

// GET /api/dashboard/map-data -> GeoJSON FeatureCollection of all parcels
router.get('/map-data', async (req, res) => {
  try {
    const parcels = await query(`
      SELECT 
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
        p.project_type,
        p.state,
        p.district,
        c.assessed_amount,
        c.paid_amount,
        c.payment_status,
        c.rnr_status
      FROM land_parcels lp
      LEFT JOIN projects p ON lp.project_id = p.id
      LEFT JOIN compensation c ON lp.id = c.parcel_id;
    `);

    const features = parcels.rows.map(row => {
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
        geometry: geometry,
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
          project_type: row.project_type,
          state: row.state,
          district: row.district,
          assessed_amount: row.assessed_amount ? parseFloat(row.assessed_amount) : 0,
          paid_amount: row.paid_amount ? parseFloat(row.paid_amount) : 0,
          payment_status: row.payment_status,
          rnr_status: row.rnr_status
        }
      };
    });

    res.json({
      type: 'FeatureCollection',
      features: features
    });
  } catch (err) {
    console.error('[MAP DATA ERROR]:', err);
    res.status(500).json({ error: 'Failed to generate cadastral map GeoJSON dataset.' });
  }
});

module.exports = router;
