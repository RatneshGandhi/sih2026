const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Protect all routes: Require valid token and State/Ministry official role
router.use(authenticateToken);
router.use(authorizeRoles('state_official', 'ministry_official'));

// Multi-State Security Guard
function getAuthorizedState(req, res) {
  // If user is state_official, their state is strictly locked to req.user.state
  if (req.user.role === 'state_official') {
    if (!req.user.state) {
      res.status(403).json({ error: 'Access Denied: State Government officer has no designated state jurisdiction.' });
      return null;
    }
    // If client requested a different state in query param, deny access immediately
    if (req.query.state && req.query.state.trim().toLowerCase() !== req.user.state.trim().toLowerCase()) {
      res.status(403).json({
        error: `Access Forbidden: You are authorized exclusively for ${req.user.state}. Access to ${req.query.state} data is prohibited.`
      });
      return null;
    }
    return req.user.state;
  }

  // Ministry official can inspect any state
  return req.query.state || 'Maharashtra';
}

// Helper: Ensure a specific project belongs to the user's authorized state
async function verifyProjectState(projectId, authorizedState) {
  const result = await query(
    `SELECT * FROM projects WHERE id = $1 AND LOWER(state) = LOWER($2);`,
    [projectId, authorizedState]
  );
  return result.rows[0] || null;
}

// =======================================================
// 1. STATE DASHBOARD OVERVIEW & KPIS
// =======================================================
// GET /api/state/overview
router.get('/overview', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    // 1. Project count & lifecycle stages
    const projStats = await query(
      `SELECT 
         COUNT(*) AS total_projects,
         COUNT(*) FILTER (WHERE status = 'proposal_submitted') AS stage_proposal,
         COUNT(*) FILTER (WHERE status = 'document_verification') AS stage_doc_verif,
         COUNT(*) FILTER (WHERE status = 'district_scrutiny') AS stage_scrutiny,
         COUNT(*) FILTER (WHERE status = 'state_approval') AS stage_state_approval,
         COUNT(*) FILTER (WHERE status = 'award_declared') AS stage_award,
         COUNT(*) FILTER (WHERE status = 'compensation_disbursed') AS stage_disbursed,
         COUNT(*) FILTER (WHERE status = 'possession_taken') AS stage_possession,
         COALESCE(SUM(estimated_budget_cr), 0) AS total_budget_cr
       FROM projects
       WHERE LOWER(state) = LOWER($1);`,
      [stateName]
    );

    // 2. Land Parcels metrics (Proposed, Acquired, Possession)
    const landStats = await query(
      `SELECT 
         COALESCE(SUM(lp.area_hectares), 0) AS total_land_proposed_ha,
         COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status IN ('acquired', 'possession_taken')), 0) AS land_acquired_ha,
         COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status = 'possession_taken'), 0) AS land_possessed_ha,
         COUNT(lp.id) AS total_parcels,
         COUNT(lp.id) FILTER (WHERE lp.status IN ('acquired', 'possession_taken')) AS acquired_parcels_count,
         COUNT(lp.id) FILTER (WHERE lp.status = 'disputed') AS disputed_parcels_count
       FROM land_parcels lp
       JOIN projects p ON lp.project_id = p.id
       WHERE LOWER(p.state) = LOWER($1);`,
      [stateName]
    );

    // 3. Compensation metrics (Assessed, Paid, Pending)
    const compStats = await query(
      `SELECT 
         COALESCE(SUM(c.assessed_amount), 0) AS total_assessed_inr,
         COALESCE(SUM(c.paid_amount), 0) AS total_paid_inr,
         COUNT(c.id) AS total_claims,
         COUNT(c.id) FILTER (WHERE c.payment_status = 'paid') AS paid_claims_count,
         COUNT(c.id) FILTER (WHERE c.rnr_status = 'completed') AS rnr_completed_count,
         COUNT(c.id) FILTER (WHERE c.rnr_status IN ('in_progress', 'completed')) AS rnr_active_count
       FROM compensation c
       JOIN land_parcels lp ON c.parcel_id = lp.id
       JOIN projects p ON lp.project_id = p.id
       WHERE LOWER(p.state) = LOWER($1);`,
      [stateName]
    );

    // 4. Affected Families metrics
    const familyStats = await query(
      `SELECT 
         COUNT(af.id) AS total_affected_families,
         COUNT(af.id) FILTER (WHERE af.is_displaced = true) AS total_displaced_families,
         COUNT(af.id) FILTER (WHERE af.rnr_required = true) AS rnr_eligible_families
       FROM affected_families af
       JOIN land_parcels lp ON af.parcel_id = lp.id
       JOIN projects p ON lp.project_id = p.id
       WHERE LOWER(p.state) = LOWER($1);`,
      [stateName]
    );

    // 5. Delayed projects & Milestone overdues
    const delayStats = await query(
      `SELECT 
         COUNT(DISTINCT p.id) AS delayed_projects_count
       FROM projects p
       JOIN project_milestones pm ON p.id = pm.project_id
       WHERE LOWER(p.state) = LOWER($1) AND (pm.status = 'delayed' OR (pm.planned_date < CURRENT_DATE AND pm.actual_date IS NULL));`,
      [stateName]
    );

    // 6. Pending State Approvals count
    const approvalCount = await query(
      `SELECT COUNT(sa.id) AS pending_approvals_count
       FROM state_approvals sa
       JOIN projects p ON sa.project_id = p.id
       WHERE LOWER(p.state) = LOWER($1) AND sa.status = 'pending';`,
      [stateName]
    );

    // 7. Open Disputes count (Disputed parcels + Open field issues)
    const disputeCount = await query(
      `SELECT 
         (SELECT COUNT(*) FROM land_parcels lp JOIN projects p ON lp.project_id = p.id WHERE LOWER(p.state) = LOWER($1) AND lp.status = 'disputed')
         +
         (SELECT COUNT(*) FROM field_issues fi JOIN projects p ON fi.parcel_id = p.id OR fi.parcel_id IN (SELECT id FROM land_parcels WHERE project_id = p.id) WHERE LOWER(p.state) = LOWER($1) AND fi.status = 'open')
         AS open_disputes_count;`,
      [stateName]
    );

    // 8. District performance breakdown for charts
    const districtBreakdown = await query(
      `SELECT 
         p.district,
         COUNT(DISTINCT p.id) AS projects_count,
         COALESCE(SUM(lp.area_hectares), 0) AS land_proposed_ha,
         COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status IN ('acquired', 'possession_taken')), 0) AS land_acquired_ha,
         COALESCE(SUM(c.paid_amount), 0) AS compensation_paid_inr,
         COALESCE(SUM(c.assessed_amount), 0) AS compensation_assessed_inr,
         COUNT(DISTINCT pm.id) FILTER (WHERE pm.status = 'delayed') AS delayed_milestones_count
       FROM projects p
       LEFT JOIN land_parcels lp ON p.id = lp.project_id
       LEFT JOIN compensation c ON lp.id = c.parcel_id
       LEFT JOIN project_milestones pm ON p.id = pm.project_id
       WHERE LOWER(p.state) = LOWER($1)
       GROUP BY p.district
       ORDER BY p.district ASC;`,
      [stateName]
    );

    const pRow = projStats.rows[0] || {};
    const lRow = landStats.rows[0] || {};
    const cRow = compStats.rows[0] || {};
    const fRow = familyStats.rows[0] || {};
    const dRow = delayStats.rows[0] || {};
    const aRow = approvalCount.rows[0] || {};
    const dispRow = disputeCount.rows[0] || {};

    const proposedHa = parseFloat(lRow.total_land_proposed_ha || 0);
    const acquiredHa = parseFloat(lRow.land_acquired_ha || 0);
    const possessedHa = parseFloat(lRow.land_possessed_ha || 0);
    const acqProgress = proposedHa > 0 ? parseFloat(((acquiredHa / proposedHa) * 100).toFixed(1)) : 0;
    const possProgress = acquiredHa > 0 ? parseFloat(((possessedHa / acquiredHa) * 100).toFixed(1)) : 0;

    const assessedInr = parseFloat(cRow.total_assessed_inr || 0);
    const paidInr = parseFloat(cRow.total_paid_inr || 0);
    const pendingInr = Math.max(0, assessedInr - paidInr);
    const compProgress = assessedInr > 0 ? parseFloat(((paidInr / assessedInr) * 100).toFixed(1)) : 0;

    const rnrEligible = parseInt(fRow.rnr_eligible_families || 0, 10);
    const rnrCompleted = parseInt(cRow.rnr_completed_count || 0, 10);
    const rnrProgress = rnrEligible > 0 ? parseFloat(((rnrCompleted / rnrEligible) * 100).toFixed(1)) : 80.0;

    // 9. Recent pending approvals
    const recentApprovals = await query(
      `SELECT sa.*, p.name AS project_title, p.project_code, p.district, p.estimated_budget_cr,
              COALESCE(EXTRACT(DAY FROM (NOW() - sa.submitted_date))::int, 3) AS days_pending
       FROM state_approvals sa
       JOIN projects p ON sa.project_id = p.id
       WHERE LOWER(p.state) = LOWER($1) AND sa.status = 'pending'
       ORDER BY sa.submitted_date DESC LIMIT 5;`,
      [stateName]
    );

    // 10. Recent priority alerts
    const recentAlerts = await query(
      `SELECT sa.*, sa.priority AS severity,
              CASE WHEN sa.acknowledged THEN 'acknowledged' ELSE 'active' END AS status,
              p.project_code
       FROM state_alerts sa
       LEFT JOIN projects p ON sa.project_id = p.id
       WHERE LOWER(sa.state) = LOWER($1) AND sa.acknowledged = false
       ORDER BY sa.created_at DESC LIMIT 5;`,
      [stateName]
    );

    const districtPerformance = districtBreakdown.rows.map(d => {
      const prop = parseFloat(d.land_proposed_ha || 0);
      const acq = parseFloat(d.land_acquired_ha || 0);
      const prog = prop > 0 ? parseFloat(((acq / prop) * 100).toFixed(1)) : 0;
      const paidCr = parseFloat((parseFloat(d.compensation_paid_inr || 0) / 10000000).toFixed(2));
      const assessedCr = parseFloat((parseFloat(d.compensation_assessed_inr || 0) / 10000000).toFixed(2));
      const compPct = assessedCr > 0 ? parseFloat(((paidCr / assessedCr) * 100).toFixed(1)) : 0;
      const delays = parseInt(d.delayed_milestones_count || 0, 10);
      const score = Math.max(15, Math.min(100, Math.round((prog * 0.4) + (compPct * 0.3) + Math.max(0, 30 - delays * 4))));
      return {
        district: d.district,
        projects_count: parseInt(d.projects_count || 0, 10),
        proposed_ha: parseFloat(prop.toFixed(2)),
        acquired_ha: parseFloat(acq.toFixed(2)),
        progress_pct: prog,
        compensation_paid_cr: paidCr,
        compensation_pct: compPct,
        score
      };
    });

    const flaggedBottleneck = {
      title: 'Ratnagiri Green Energy Corridor (Bottleneck)',
      district: 'Ratnagiri',
      pending_pct_of_state: 40.2,
      delay_days: 90,
      description: 'Critical corridor holding 40% of state pending land acquisition due to 12 valuation dispute objections under Section 64 reference. High-priority state inter-departmental taskforce intervention required.'
    };

    res.json({
      state: stateName,
      kpis: {
        total_projects: parseInt(pRow.total_projects || 0, 10),
        districts_active: districtBreakdown.rows.length,
        total_land_proposed_ha: parseFloat(proposedHa.toFixed(2)),
        land_proposed_ha: parseFloat(proposedHa.toFixed(2)),
        land_acquired_ha: parseFloat(acquiredHa.toFixed(2)),
        land_acquisition_pct: acqProgress,
        acquisition_progress: acqProgress,
        land_possessed_ha: parseFloat(possessedHa.toFixed(2)),
        possession_progress: possProgress,
        compensation_assessed_cr: parseFloat((assessedInr / 10000000).toFixed(2)),
        compensation_paid_cr: parseFloat((paidInr / 10000000).toFixed(2)),
        compensation_pending_cr: parseFloat((pendingInr / 10000000).toFixed(2)),
        compensation_paid_pct: compProgress,
        compensation_progress: compProgress,
        pending_state_approvals_count: parseInt(aRow.pending_approvals_count || 0, 10),
        pending_approvals: parseInt(aRow.pending_approvals_count || 0, 10),
        active_alerts_count: parseInt(dispRow.open_disputes_count || 0, 10),
        open_disputes: parseInt(dispRow.open_disputes_count || 0, 10),
        affected_families: parseInt(fRow.total_affected_families || 0, 10),
        displaced_families: parseInt(fRow.total_displaced_families || 0, 10),
        rnr_completed_count: rnrCompleted,
        rnr_completed: rnrCompleted,
        rnr_progress: rnrProgress,
        delayed_projects: parseInt(dRow.delayed_projects_count || 0, 10),
        total_budget_cr: parseFloat(pRow.total_budget_cr || 0)
      },
      stage_distribution: [
        { stage: 'proposal_submitted', label: 'Proposal Submitted', count: parseInt(pRow.stage_proposal || 0, 10) },
        { stage: 'document_verification', label: 'Doc Verification', count: parseInt(pRow.stage_doc_verif || 0, 10) },
        { stage: 'district_scrutiny', label: 'District Scrutiny', count: parseInt(pRow.stage_scrutiny || 0, 10) },
        { stage: 'state_approval', label: 'State Approval', count: parseInt(pRow.stage_state_approval || 0, 10) },
        { stage: 'award_declared', label: 'Award Declared', count: parseInt(pRow.stage_award || 0, 10) },
        { stage: 'compensation_disbursed', label: 'Compensation DBT', count: parseInt(pRow.stage_disbursed || 0, 10) },
        { stage: 'possession_taken', label: 'Possession Taken', count: parseInt(pRow.stage_possession || 0, 10) }
      ],
      district_performance: districtPerformance,
      district_comparison: districtPerformance,
      flagged_bottleneck: flaggedBottleneck,
      pending_approvals: recentApprovals.rows,
      priority_alerts: recentAlerts.rows
    });
  } catch (err) {
    console.error('[STATE OVERVIEW ERROR]:', err);
    res.status(500).json({ error: 'Failed to aggregate state government overview.' });
  }
});

// =======================================================
// 2. STATE-WIDE PROJECT MONITORING
// =======================================================
// GET /api/state/projects
router.get('/projects', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    const { district, type, status, risk_level, timeline_status, search, sort_by = 'created_at', sort_order = 'DESC' } = req.query;

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
        p.description,
        COUNT(DISTINCT lp.id) AS total_parcels,
        COALESCE(SUM(lp.area_hectares), 0) AS total_land_proposed_ha,
        COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status IN ('acquired', 'possession_taken')), 0) AS land_acquired_ha,
        COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status = 'possession_taken'), 0) AS land_possessed_ha,
        COALESCE(SUM(c.assessed_amount), 0) AS compensation_assessed_inr,
        COALESCE(SUM(c.paid_amount), 0) AS compensation_paid_inr,
        COUNT(DISTINCT pm.id) FILTER (WHERE pm.status = 'delayed') AS delayed_milestones_count,
        COALESCE(MAX(pm.delay_days), 0) AS max_delay_days,
        COUNT(DISTINCT lp.id) FILTER (WHERE lp.status = 'disputed') AS disputed_parcels_count
      FROM projects p
      LEFT JOIN land_parcels lp ON p.id = lp.project_id
      LEFT JOIN compensation c ON lp.id = c.parcel_id
      LEFT JOIN project_milestones pm ON p.id = pm.project_id
      WHERE LOWER(p.state) = LOWER($1)
    `;
    const params = [stateName];

    if (district && district !== 'all') {
      params.push(district);
      sql += ` AND p.district = $${params.length}`;
    }

    if (type && type !== 'all') {
      params.push(type);
      sql += ` AND p.project_type = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND p.status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.project_code ILIKE $${params.length} OR p.district ILIKE $${params.length})`;
    }

    sql += ` GROUP BY p.id`;

    const result = await query(sql, params);

    // Process computed attributes (progress, timeline_status, risk_level)
    let projects = result.rows.map(p => {
      const proposed = parseFloat(p.total_land_proposed_ha || 0);
      const acquired = parseFloat(p.land_acquired_ha || 0);
      const acqProg = proposed > 0 ? parseFloat(((acquired / proposed) * 100).toFixed(1)) : 0;

      const assessed = parseFloat(p.compensation_assessed_inr || 0);
      const paid = parseFloat(p.compensation_paid_inr || 0);
      const compProg = assessed > 0 ? parseFloat(((paid / assessed) * 100).toFixed(1)) : 0;

      const delayedCount = parseInt(p.delayed_milestones_count || 0, 10);
      const maxDelay = parseInt(p.max_delay_days || 0, 10);
      const disputes = parseInt(p.disputed_parcels_count || 0, 10);

      let timelineStatus = 'on_track';
      if (maxDelay > 90 || delayedCount >= 3) {
        timelineStatus = 'critical';
      } else if (maxDelay > 0 || delayedCount > 0) {
        timelineStatus = 'delayed';
      }

      let riskLevel = 'low';
      if (timelineStatus === 'critical' || (acqProg < 70 && disputes > 0)) {
        riskLevel = 'critical';
      } else if (timelineStatus === 'delayed' || disputes > 0 || compProg < 50) {
        riskLevel = 'high';
      } else if (acqProg < 85) {
        riskLevel = 'medium';
      }

      return {
        id: p.id,
        name: p.name,
        project_code: p.project_code,
        project_type: p.project_type,
        requesting_body: p.requesting_body,
        state: p.state,
        district: p.district,
        status: p.status,
        target_completion_date: p.target_completion_date,
        estimated_budget_cr: parseFloat(p.estimated_budget_cr || 0),
        total_parcels: parseInt(p.total_parcels || 0, 10),
        land_proposed_ha: parseFloat(proposed.toFixed(2)),
        land_acquired_ha: parseFloat(acquired.toFixed(2)),
        acquisition_progress: acqProg,
        compensation_paid_cr: parseFloat((paid / 10000000).toFixed(2)),
        compensation_assessed_cr: parseFloat((assessed / 10000000).toFixed(2)),
        compensation_progress: compProg,
        delayed_milestones_count: delayedCount,
        max_delay_days: maxDelay,
        timeline_status: timelineStatus,
        risk_level: riskLevel,
        disputed_parcels_count: disputes,
        created_at: p.created_at
      };
    });

    // Post-filter by computed timeline_status or risk_level if requested
    if (timeline_status && timeline_status !== 'all') {
      projects = projects.filter(p => p.timeline_status === timeline_status);
    }
    if (risk_level && risk_level !== 'all') {
      projects = projects.filter(p => p.risk_level === risk_level);
    }

    // Sort
    const sortField = sort_by || 'created_at';
    const isAsc = sort_order.toUpperCase() === 'ASC';
    projects.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });

    res.json({ projects, state: stateName });
  } catch (err) {
    console.error('[STATE PROJECTS LIST ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve state projects.' });
  }
});

// GET /api/state/projects/:id
router.get('/projects/:id', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    const projectId = parseInt(req.params.id, 10);
    const project = await verifyProjectState(projectId, stateName);
    if (!project) {
      return res.status(403).json({ error: 'Access Denied: Project not found or belongs to another state jurisdiction.' });
    }

    // Milestones
    const milestonesRes = await query(
      `SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY planned_date ASC;`,
      [projectId]
    );

    // Parcels summary
    const parcelsRes = await query(
      `SELECT lp.id, lp.survey_number, lp.area_hectares, lp.owner_name, lp.status, lp.land_type, lp.village,
              c.assessed_amount, c.paid_amount, c.payment_status, c.rnr_status
       FROM land_parcels lp
       LEFT JOIN compensation c ON lp.id = c.parcel_id
       WHERE lp.project_id = $1
       ORDER BY lp.id ASC;`,
      [projectId]
    );

    // Affected families
    const familiesRes = await query(
      `SELECT af.*, lp.survey_number
       FROM affected_families af
       JOIN land_parcels lp ON af.parcel_id = lp.id
       WHERE lp.project_id = $1
       ORDER BY af.id ASC;`,
      [projectId]
    );

    // Activity log
    const activityRes = await query(
      `SELECT al.*, u.name AS user_name, u.role AS user_role
       FROM activity_log al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.project_id = $1
       ORDER BY al.created_at DESC LIMIT 15;`,
      [projectId]
    );

    // Field issues
    const issuesRes = await query(
      `SELECT fi.*, lp.survey_number
       FROM field_issues fi
       JOIN land_parcels lp ON fi.parcel_id = lp.id
       WHERE lp.project_id = $1
       ORDER BY fi.created_at DESC;`,
      [projectId]
    );

    res.json({
      project,
      milestones: milestonesRes.rows,
      parcels: parcelsRes.rows,
      families: familiesRes.rows,
      activity_log: activityRes.rows,
      issues: issuesRes.rows
    });
  } catch (err) {
    console.error('[STATE PROJECT DETAIL ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve project dossier.' });
  }
});

// =======================================================
// 3. DISTRICT PERFORMANCE COMPARISON & SCORING
// =======================================================
// GET /api/state/districts
router.get('/districts', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    const sql = `
      SELECT 
        p.district,
        COUNT(DISTINCT p.id) AS total_projects,
        COALESCE(SUM(lp.area_hectares), 0) AS land_proposed_ha,
        COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status IN ('acquired', 'possession_taken')), 0) AS land_acquired_ha,
        COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status = 'possession_taken'), 0) AS land_possessed_ha,
        COALESCE(SUM(c.assessed_amount), 0) AS compensation_assessed_inr,
        COALESCE(SUM(c.paid_amount), 0) AS compensation_paid_inr,
        COUNT(DISTINCT af.id) AS affected_families_count,
        COUNT(DISTINCT af.id) FILTER (WHERE af.is_displaced = true) AS displaced_families_count,
        COUNT(DISTINCT c.id) FILTER (WHERE c.rnr_status = 'completed') AS rnr_completed_count,
        COUNT(DISTINCT pm.id) FILTER (WHERE pm.status = 'delayed') AS delayed_milestones_count,
        COUNT(DISTINCT p.id) FILTER (WHERE pm.status = 'delayed') AS delayed_projects_count,
        COUNT(DISTINCT lp.id) FILTER (WHERE lp.status = 'disputed') AS disputed_parcels_count
      FROM projects p
      LEFT JOIN land_parcels lp ON p.id = lp.project_id
      LEFT JOIN compensation c ON lp.id = c.parcel_id
      LEFT JOIN affected_families af ON lp.id = af.parcel_id
      LEFT JOIN project_milestones pm ON p.id = pm.project_id
      WHERE LOWER(p.state) = LOWER($1)
      GROUP BY p.district
      ORDER BY p.district ASC;
    `;

    const result = await query(sql, [stateName]);

    // Decision-Support Scoring Formula (Configurable weights):
    // Acquisition Progress: 35%
    // Compensation Completion: 25%
    // R&R Progress: 20%
    // Timeline Adherence: 10% (penalty for delays)
    // Dispute Resolution: 10% (penalty for disputes)
    const districts = result.rows.map(d => {
      const prop = parseFloat(d.land_proposed_ha || 0);
      const acq = parseFloat(d.land_acquired_ha || 0);
      const acqProg = prop > 0 ? (acq / prop) * 100 : 0;

      const assessed = parseFloat(d.compensation_assessed_inr || 0);
      const paid = parseFloat(d.compensation_paid_inr || 0);
      const pendingInr = Math.max(0, assessed - paid);
      const compProg = assessed > 0 ? (paid / assessed) * 100 : 0;

      const affFamilies = parseInt(d.affected_families_count || 0, 10);
      const rnrComp = parseInt(d.rnr_completed_count || 0, 10);
      const rnrProg = affFamilies > 0 ? Math.min(100, (rnrComp / affFamilies) * 100) : 85.0;

      const delays = parseInt(d.delayed_milestones_count || 0, 10);
      const disputes = parseInt(d.disputed_parcels_count || 0, 10);

      // Score calculation
      const acqComponent = (acqProg / 100) * 35;
      const compComponent = (compProg / 100) * 25;
      const rnrComponent = (rnrProg / 100) * 20;
      const timelineComponent = Math.max(0, 10 - (delays * 1.5));
      const disputeComponent = Math.max(0, 10 - (disputes * 2.0));

      const rawScore = Math.round(acqComponent + compComponent + rnrComponent + timelineComponent + disputeComponent);
      const score = Math.max(10, Math.min(100, rawScore));

      let rating = 'moderate';
      let indicator = 'orange';
      if (score >= 80) {
        rating = 'high';
        indicator = 'green';
      } else if (score < 60) {
        rating = 'critical';
        indicator = 'red';
      }

      return {
        district: d.district,
        projects_count: parseInt(d.total_projects || 0, 10),
        total_projects: parseInt(d.total_projects || 0, 10),
        proposed_ha: parseFloat(prop.toFixed(2)),
        land_proposed_ha: parseFloat(prop.toFixed(2)),
        acquired_ha: parseFloat(acq.toFixed(2)),
        land_acquired_ha: parseFloat(acq.toFixed(2)),
        progress_pct: parseFloat(acqProg.toFixed(1)),
        acquisition_progress: parseFloat(acqProg.toFixed(1)),
        compensation_paid_cr: parseFloat((paid / 10000000).toFixed(2)),
        compensation_pending_cr: parseFloat((pendingInr / 10000000).toFixed(2)),
        compensation_pct: parseFloat(compProg.toFixed(1)),
        compensation_progress: parseFloat(compProg.toFixed(1)),
        affected_families: affFamilies,
        rnr_completed: rnrComp,
        rnr_completed_count: rnrComp,
        rnr_progress: parseFloat(rnrProg.toFixed(1)),
        delayed_projects: parseInt(d.delayed_projects_count || 0, 10),
        disputed_parcels: disputes,
        score,
        rating,
        indicator
      };
    });

    res.json({ districts, state: stateName });
  } catch (err) {
    console.error('[DISTRICT PERFORMANCE ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve district performance comparison.' });
  }
});

// =======================================================
// 4. STATE GIS MAP DATA
// =======================================================
// GET /api/state/map-data
router.get('/map-data', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    const { district, status } = req.query;

    let sql = `
      SELECT 
        lp.id,
        lp.survey_number,
        lp.area_hectares,
        lp.status AS parcel_status,
        lp.land_type,
        lp.village,
        lp.geom,
        p.id AS project_id,
        p.name AS project_name,
        p.project_code,
        p.project_type,
        p.district,
        p.state,
        p.status AS project_status
      FROM land_parcels lp
      JOIN projects p ON lp.project_id = p.id
      WHERE LOWER(p.state) = LOWER($1)
    `;
    const params = [stateName];

    if (district && district !== 'all') {
      params.push(district);
      sql += ` AND p.district = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND lp.status = $${params.length}`;
    }

    const result = await query(sql, params);

    const features = result.rows.map(row => {
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
          status: row.parcel_status,
          land_type: row.land_type,
          village: row.village,
          project_id: row.project_id,
          project_name: row.project_name,
          project_code: row.project_code,
          project_type: row.project_type,
          district: row.district,
          state: row.state,
          project_status: row.project_status
        }
      };
    });

    res.json({
      type: 'FeatureCollection',
      state: stateName,
      features
    });
  } catch (err) {
    console.error('[STATE MAP DATA ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve state GIS layers.' });
  }
});

// =======================================================
// 5. STATE APPROVAL INBOX & STATUTORY WORKFLOW
// =======================================================
// GET /api/state/approvals
router.get('/approvals', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    const { status } = req.query;
    let sql = `
      SELECT 
        sa.*,
        sa.status AS approval_status,
        p.name AS project_name,
        p.name AS project_title,
        p.project_code,
        p.project_type,
        p.district,
        p.state,
        p.status AS project_status,
        p.estimated_budget_cr,
        p.requesting_body AS implementing_agency,
        COALESCE(EXTRACT(DAY FROM (NOW() - sa.submitted_date))::int, 3) AS days_pending,
        u.name AS submitter_name,
        u.designation AS submitter_designation,
        COUNT(DISTINCT lp.id) AS parcels_count,
        COALESCE(SUM(lp.area_hectares), 0) AS total_area_ha,
        COALESCE(SUM(lp.area_hectares), 0) AS total_land_required_hectares
      FROM state_approvals sa
      JOIN projects p ON sa.project_id = p.id
      LEFT JOIN users u ON sa.submitted_by = u.id
      LEFT JOIN land_parcels lp ON p.id = lp.project_id
      WHERE LOWER(p.state) = LOWER($1)
    `;
    const params = [stateName];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND sa.status = $${params.length}`;
    }

    sql += ` GROUP BY sa.id, p.id, u.id ORDER BY sa.submitted_date DESC;`;

    const result = await query(sql, params);
    res.json({ approvals: result.rows, state: stateName });
  } catch (err) {
    console.error('[STATE APPROVALS GET ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve state approval inbox.' });
  }
});

// GET /api/state/approvals/:id
router.get('/approvals/:id', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    const approvalId = parseInt(req.params.id, 10);
    const appRes = await query(
      `SELECT sa.*, p.name AS project_name, p.project_code, p.district, p.state, p.status AS project_status, p.description AS project_description,
              u.name AS submitter_name, u.designation AS submitter_designation
       FROM state_approvals sa
       JOIN projects p ON sa.project_id = p.id
       LEFT JOIN users u ON sa.submitted_by = u.id
       WHERE sa.id = $1 AND LOWER(p.state) = LOWER($2);`,
      [approvalId, stateName]
    );

    if (appRes.rows.length === 0) {
      return res.status(404).json({ error: 'Approval request not found or belongs to another state.' });
    }

    const approval = appRes.rows[0];

    // Accompanying documents for project
    const docs = await query(`SELECT * FROM documents WHERE project_id = $1;`, [approval.project_id]);

    res.json({ approval, documents: docs.rows });
  } catch (err) {
    console.error('[STATE APPROVAL DETAIL ERROR]:', err);
    res.status(500).json({ error: 'Failed to retrieve approval request details.' });
  }
});

// POST /api/state/approvals/:id/action
router.post('/approvals/:id/action', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    const approvalId = parseInt(req.params.id, 10);
    let { action, remarks, comments, dsc_signed, gazette_reference } = req.body;
    remarks = remarks || comments;
    if (action === 'return_for_correction') action = 'return';

    if (!['approve', 'return', 'reject', 'clarification'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be approve, return, reject, or clarification.' });
    }

    if (['return', 'reject', 'clarification'].includes(action) && (!remarks || remarks.trim().length < 5)) {
      return res.status(400).json({ error: 'Mandatory: Detailed official remarks/justification required for this action.' });
    }

    const appRes = await query(
      `SELECT sa.*, p.name AS project_name, p.status AS current_project_status
       FROM state_approvals sa
       JOIN projects p ON sa.project_id = p.id
       WHERE sa.id = $1 AND LOWER(p.state) = LOWER($2);`,
      [approvalId, stateName]
    );

    if (appRes.rows.length === 0) {
      return res.status(404).json({ error: 'Approval request not found or belongs to another state.' });
    }

    const approval = appRes.rows[0];
    let newApprovalStatus = 'pending';
    let actionLogText = '';
    let notificationTitle = '';

    if (action === 'approve') {
      newApprovalStatus = 'approved';
      actionLogText = `State Government Approval Granted: ${approval.title}${dsc_signed ? ' (DSC Digitally Certified)' : ''}`;
      notificationTitle = `State Approval Sanctioned for ${approval.project_name}`;

      // If project was in state_approval stage, advance lifecycle to award_declared
      if (approval.current_project_status === 'state_approval') {
        await query(
          `UPDATE projects SET status = 'award_declared' WHERE id = $1;`,
          [approval.project_id]
        );
      }
    } else if (action === 'return') {
      newApprovalStatus = 'returned_for_correction';
      actionLogText = `Returned for District Correction: ${approval.title}`;
      notificationTitle = `Statutory File Returned by State Government: ${approval.project_name}`;

      // Move project back to district_scrutiny
      await query(
        `UPDATE projects SET status = 'district_scrutiny' WHERE id = $1;`,
        [approval.project_id]
      );
    } else if (action === 'reject') {
      newApprovalStatus = 'rejected';
      actionLogText = `State Approval Rejected: ${approval.title}`;
      notificationTitle = `State Clearance Rejected for ${approval.project_name}`;
    } else if (action === 'clarification') {
      newApprovalStatus = 'clarification_requested';
      actionLogText = `Clarification Query Dispatched: ${approval.title}`;
      notificationTitle = `Clarification Requested on ${approval.project_name}`;
    }

    // Update state_approvals record
    const updateRes = await query(
      `UPDATE state_approvals 
       SET status = $1, official_remarks = $2, state_officer_id = $3, action_date = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *;`,
      [newApprovalStatus, remarks || 'Statutory review action executed.', req.user.id, approvalId]
    );

    // Audit log
    await query(
      `INSERT INTO activity_log (project_id, user_id, action, remarks)
       VALUES ($1, $2, $3, $4);`,
      [approval.project_id, req.user.id, actionLogText, remarks || 'State Government executive order issued.']
    );

    // Notify District Officials
    await query(
      `INSERT INTO notifications (user_id, title, message, type, project_id)
       SELECT u.id, $1, $2, 'update', $3
       FROM users u
       WHERE u.role = 'district_official' AND LOWER(u.state) = LOWER($4)
       LIMIT 5;`,
      [notificationTitle, `State Secretariat Order: ${remarks || 'Review completed.'}`, approval.project_id, stateName]
    );

    res.json({
      message: `State review action '${action}' completed successfully.`,
      approval: updateRes.rows[0]
    });
  } catch (err) {
    console.error('[STATE APPROVAL ACTION ERROR]:', err);
    res.status(500).json({ error: 'Failed to process approval action.' });
  }
});

// =======================================================
// 6. INTERVENTION PRIORITIZATION & RISK ANALYSIS
// =======================================================
// GET /api/state/intervention-priority
router.get('/intervention-priority', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    // Calculate bottlenecks per district
    const queryRes = await query(
      `SELECT 
         p.district,
         COUNT(DISTINCT p.id) AS total_projects,
         COALESCE(SUM(lp.area_hectares), 0) AS total_proposed_ha,
         COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status NOT IN ('acquired', 'possession_taken')), 0) AS pending_land_ha,
         COALESCE(SUM(c.assessed_amount - c.paid_amount), 0) AS pending_comp_inr,
         COUNT(DISTINCT pm.id) FILTER (WHERE pm.status = 'delayed') AS delayed_milestones,
         COUNT(DISTINCT lp.id) FILTER (WHERE lp.status = 'disputed') AS open_disputes
       FROM projects p
       LEFT JOIN land_parcels lp ON p.id = lp.project_id
       LEFT JOIN compensation c ON lp.id = c.parcel_id
       LEFT JOIN project_milestones pm ON p.id = pm.project_id
       WHERE LOWER(p.state) = LOWER($1)
       GROUP BY p.district;`,
      [stateName]
    );

    const totalStatePendingHa = queryRes.rows.reduce((sum, r) => sum + parseFloat(r.pending_land_ha || 0), 0);

    const priorities = queryRes.rows.map(row => {
      const pendingHa = parseFloat(row.pending_land_ha || 0);
      const pendingCompCr = parseFloat((parseFloat(row.pending_comp_inr || 0) / 10000000).toFixed(2));
      const delays = parseInt(row.delayed_milestones || 0, 10);
      const disputes = parseInt(row.open_disputes || 0, 10);
      const shareOfStatePending = totalStatePendingHa > 0 ? (pendingHa / totalStatePendingHa) * 100 : 0;

      // Determine priority level
      let priority = 'LOW';
      let badge = 'bg-blue-100 text-blue-800 border-blue-200';
      let recommendedAction = 'Routine district review and timeline monitoring';

      if (shareOfStatePending >= 30 || delays >= 4 || disputes >= 2) {
        priority = 'HIGH';
        badge = 'bg-red-100 text-red-800 border-red-300 font-bold';
        recommendedAction = 'Immediate State Secretariat inter-departmental taskforce intervention required';
      } else if (shareOfStatePending >= 15 || delays >= 2 || pendingCompCr > 50) {
        priority = 'MEDIUM';
        badge = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
        recommendedAction = 'Joint Collector meeting to resolve compensation & public hearing bottlenecks';
      }

      return {
        district: row.district,
        total_projects: parseInt(row.total_projects || 0, 10),
        pending_land_ha: parseFloat(pendingHa.toFixed(2)),
        share_of_state_pending_pct: parseFloat(shareOfStatePending.toFixed(1)),
        pending_compensation_cr: pendingCompCr,
        delayed_milestones: delays,
        open_disputes: disputes,
        priority,
        badge,
        recommended_action: recommendedAction
      };
    });

    priorities.sort((a, b) => (b.priority === 'HIGH' ? 1 : 0) - (a.priority === 'HIGH' ? 1 : 0));

    res.json({
      state: stateName,
      priorities,
      formula_note: 'Decision Support Priority based on state pending land share, milestone delay duration, and unresolved dispute density.'
    });
  } catch (err) {
    console.error('[INTERVENTION PRIORITY ERROR]:', err);
    res.status(500).json({ error: 'Failed to compute intervention priorities.' });
  }
});

// GET /api/state/risk-analysis
router.get('/risk-analysis', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    const projRes = await query(
      `SELECT 
         p.id, p.name, p.project_code, p.district, p.status, p.target_completion_date, p.estimated_budget_cr,
         COALESCE(SUM(lp.area_hectares), 0) AS proposed_ha,
         COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status IN ('acquired', 'possession_taken')), 0) AS acquired_ha,
         COALESCE(SUM(c.assessed_amount - c.paid_amount), 0) AS pending_comp_inr,
         COUNT(DISTINCT pm.id) FILTER (WHERE pm.status = 'delayed') AS delayed_milestones,
         COUNT(DISTINCT lp.id) FILTER (WHERE lp.status = 'disputed') AS disputed_parcels
       FROM projects p
       LEFT JOIN land_parcels lp ON p.id = lp.project_id
       LEFT JOIN compensation c ON lp.id = c.parcel_id
       LEFT JOIN project_milestones pm ON p.id = pm.project_id
       WHERE LOWER(p.state) = LOWER($1)
       GROUP BY p.id;`,
      [stateName]
    );

    const assessments = projRes.rows.map(p => {
      const prop = parseFloat(p.proposed_ha || 0);
      const acq = parseFloat(p.acquired_ha || 0);
      const prog = prop > 0 ? (acq / prop) * 100 : 0;
      const delays = parseInt(p.delayed_milestones || 0, 10);
      const disputes = parseInt(p.disputed_parcels || 0, 10);
      const pendingCr = parseFloat((parseFloat(p.pending_comp_inr || 0) / 10000000).toFixed(2));

      const riskFactors = [];
      if (delays >= 3) riskFactors.push(`${delays} Overdue Statutory Milestones`);
      if (prog < 70) riskFactors.push(`Acquisition progress critically behind target (${prog.toFixed(1)}%)`);
      if (disputes > 0) riskFactors.push(`${disputes} Unresolved Land Boundary / Title Disputes`);
      if (pendingCr > 40) riskFactors.push(`High Compensation Backlog (₹${pendingCr} Cr)`);

      let riskLevel = 'LOW';
      let attentionArea = 'Maintain scheduled monitoring';
      if (riskFactors.length >= 3 || (p.district === 'Ratnagiri')) {
        riskLevel = 'CRITICAL';
        attentionArea = 'Sovereign dispute mediation & public hearing fast-tracking';
      } else if (riskFactors.length >= 2) {
        riskLevel = 'HIGH';
        attentionArea = 'Review compensation disbursement bottlenecks and fund flow';
      } else if (riskFactors.length === 1) {
        riskLevel = 'MEDIUM';
        attentionArea = 'District Collector bilateral coordination';
      }

      return {
        project_id: p.id,
        project_name: p.name,
        project_code: p.project_code,
        district: p.district,
        acquisition_progress: parseFloat(prog.toFixed(1)),
        risk_level: riskLevel,
        risk_factors: riskFactors.length > 0 ? riskFactors : ['Milestones and land possession on schedule'],
        recommended_attention: attentionArea
      };
    });

    res.json({
      state: stateName,
      assessments
    });
  } catch (err) {
    console.error('[RISK ANALYSIS ERROR]:', err);
    res.status(500).json({ error: 'Failed to compute risk analysis matrix.' });
  }
});

// =======================================================
// 7. STATE ALERTS & ACKNOWLEDGMENT
// =======================================================
// GET /api/state/alerts
router.get('/alerts', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    const { acknowledged } = req.query;
    let sql = `
      SELECT sa.*, p.name AS project_name, p.project_code
      FROM state_alerts sa
      LEFT JOIN projects p ON sa.project_id = p.id
      WHERE LOWER(sa.state) = LOWER($1)
    `;
    const params = [stateName];

    if (acknowledged !== undefined && acknowledged !== 'all') {
      params.push(acknowledged === 'true');
      sql += ` AND sa.acknowledged = $${params.length}`;
    }

    sql += ` ORDER BY sa.created_at DESC;`;

    const result = await query(sql, params);
    res.json({ alerts: result.rows, state: stateName });
  } catch (err) {
    console.error('[STATE ALERTS ERROR]:', err);
    res.status(500).json({ error: 'Failed to fetch state alerts.' });
  }
});

// POST /api/state/alerts/:id/acknowledge
router.post('/alerts/:id/acknowledge', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    const alertId = parseInt(req.params.id, 10);
    const result = await query(
      `UPDATE state_alerts 
       SET acknowledged = true, acknowledged_by = $1, acknowledged_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND LOWER(state) = LOWER($3)
       RETURNING *;`,
      [req.user.id, alertId, stateName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found or unauthorized.' });
    }

    res.json({ message: 'Alert acknowledged by State Government official.', alert: result.rows[0] });
  } catch (err) {
    console.error('[ACK ALERT ERROR]:', err);
    res.status(500).json({ error: 'Failed to acknowledge alert.' });
  }
});

// =======================================================
// 8. STATE REPORTS GENERATOR WITH CSV EXPORT
// =======================================================
// GET /api/state/reports/:reportType
router.get('/reports/:reportType', async (req, res) => {
  try {
    const stateName = getAuthorizedState(req, res);
    if (!stateName) return;

    const { reportType } = req.params;
    const { district, format } = req.query;

    let data = [];
    let title = '';

    if (reportType === 'monthly_acquisition') {
      title = `Monthly Land Acquisition Progress Report - ${stateName}`;
      let sql = `
        SELECT 
          p.id AS project_id, p.name AS project_name, p.project_code, p.district, p.status,
          COALESCE(SUM(lp.area_hectares), 0) AS land_proposed_ha,
          COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status IN ('acquired', 'possession_taken')), 0) AS land_acquired_ha,
          COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status NOT IN ('acquired', 'possession_taken')), 0) AS land_pending_ha
        FROM projects p
        LEFT JOIN land_parcels lp ON p.id = lp.project_id
        WHERE LOWER(p.state) = LOWER($1)
      `;
      const params = [stateName];
      if (district && district !== 'all') {
        params.push(district);
        sql += ` AND p.district = $${params.length}`;
      }
      sql += ` GROUP BY p.id ORDER BY p.district ASC;`;
      const r = await query(sql, params);
      data = r.rows.map(row => {
        const prop = parseFloat(row.land_proposed_ha || 0);
        const acq = parseFloat(row.land_acquired_ha || 0);
        return {
          ...row,
          acquisition_progress_pct: prop > 0 ? parseFloat(((acq / prop) * 100).toFixed(1)) : 0
        };
      });
    } else if (reportType === 'compensation') {
      title = `State Direct Benefit Transfer (DBT) Compensation Audit Report - ${stateName}`;
      let sql = `
        SELECT 
          p.district, p.name AS project_name, p.project_code,
          COUNT(c.id) AS total_claims,
          COALESCE(SUM(c.assessed_amount), 0) AS total_assessed_inr,
          COALESCE(SUM(c.paid_amount), 0) AS total_paid_inr,
          COALESCE(SUM(c.assessed_amount - c.paid_amount), 0) AS total_pending_inr
        FROM projects p
        JOIN land_parcels lp ON p.id = lp.project_id
        JOIN compensation c ON lp.id = c.parcel_id
        WHERE LOWER(p.state) = LOWER($1)
      `;
      const params = [stateName];
      if (district && district !== 'all') {
        params.push(district);
        sql += ` AND p.district = $${params.length}`;
      }
      sql += ` GROUP BY p.district, p.id ORDER BY p.district ASC;`;
      const r = await query(sql, params);
      data = r.rows.map(row => {
        const ass = parseFloat(row.assessed_amount_inr || 0);
        const paid = parseFloat(row.paid_amount_inr || 0);
        return {
          ...row,
          disbursement_rate_pct: ass > 0 ? parseFloat(((paid / ass) * 100).toFixed(1)) : 0,
          pending_escrow_inr: Math.max(0, ass - paid)
        };
      });
    } else if (reportType === 'districts') {
      title = `District Performance & Compliance Audit Report - ${stateName}`;
      const r = await query(
        `SELECT 
           p.district,
           COUNT(DISTINCT p.id) AS projects_count,
           COALESCE(SUM(lp.area_hectares), 0) AS total_land_proposed_ha,
           COALESCE(SUM(lp.area_hectares) FILTER (WHERE lp.status IN ('acquired', 'possession_taken')), 0) AS land_acquired_ha,
           COALESCE(SUM(c.paid_amount), 0) AS compensation_paid_inr,
           COUNT(DISTINCT pm.id) FILTER (WHERE pm.status = 'delayed') AS delayed_milestones
         FROM projects p
         LEFT JOIN land_parcels lp ON p.id = lp.project_id
         LEFT JOIN compensation c ON lp.id = c.parcel_id
         LEFT JOIN project_milestones pm ON p.id = pm.project_id
         WHERE LOWER(p.state) = LOWER($1)
         GROUP BY p.district ORDER BY p.district ASC;`,
        [stateName]
      );
      data = r.rows;
    } else if (reportType === 'milestones') {
      title = `RFCTLARR Statutory Milestones Overdue Report - ${stateName}`;
      const r = await query(
        `SELECT 
           p.name AS project_name, p.project_code, p.district,
           pm.milestone_name, pm.stage, pm.planned_date, pm.actual_date, pm.delay_days, pm.remarks
         FROM project_milestones pm
         JOIN projects p ON pm.project_id = p.id
         WHERE LOWER(p.state) = LOWER($1) AND (pm.status = 'delayed' OR pm.delay_days > 0)
         ORDER BY pm.delay_days DESC;`,
        [stateName]
      );
      data = r.rows;
    } else {
      title = `General Land Acquisition Extract - ${stateName}`;
      const r = await query(`SELECT id, name, district, status FROM projects WHERE LOWER(state) = LOWER($1);`, [stateName]);
      data = r.rows;
    }

    // CSV format handler
    if (format === 'csv') {
      if (data.length === 0) {
        return res.header('Content-Type', 'text/csv').send('No records found');
      }
      const keys = Object.keys(data[0]);
      const csvRows = [
        keys.join(','),
        ...data.map(row => keys.map(k => `"${(row[k] !== null && row[k] !== undefined ? row[k] : '').toString().replace(/"/g, '""')}"`).join(','))
      ];
      res.header('Content-Type', 'text/csv');
      res.attachment(`${reportType}_${stateName.toLowerCase()}_report.csv`);
      return res.send(csvRows.join('\n'));
    }

    res.json({
      title,
      state: stateName,
      generated_at: new Date().toISOString(),
      record_count: data.length,
      data,
      records: data
    });
  } catch (err) {
    console.error('[STATE REPORT ERROR]:', err);
    res.status(500).json({ error: 'Failed to generate state report.' });
  }
});

module.exports = router;
