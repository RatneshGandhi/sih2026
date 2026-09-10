const { pool } = require('./pool');

async function seedStateGovernment() {
  const client = await pool.connect();
  try {
    console.log('[SEED] Starting State Government data seeding for Maharashtra...');
    await client.query('BEGIN');

    // Clean previous state-level test records to make script idempotent
    await client.query(`DELETE FROM state_alerts WHERE state = 'Maharashtra';`);
    await client.query(`DELETE FROM state_approvals;`);
    await client.query(`DELETE FROM project_milestones;`);

    // Fetch district collector user for submissions
    const distUserRes = await client.query(`SELECT id FROM users WHERE role = 'district_official' LIMIT 1;`);
    const distOfficerId = distUserRes.rows[0]?.id || null;

    // Check existing projects in Maharashtra
    // Let's ensure we have projects across Pune, Palghar, Mumbai Sub, Nashik, Ratnagiri, Nagpur, Solapur
    const additionalMhProjects = [
      {
        name: 'Ratnagiri-Konkan Marine Industrial Expressway Corridor',
        project_code: 'PROP-2025-MH-2041',
        project_type: 'highway',
        requesting_body: 'Maharashtra State Road Development Corporation (MSRDC)',
        state: 'Maharashtra',
        district: 'Ratnagiri',
        status: 'district_scrutiny',
        target_completion_date: '2026-11-30',
        estimated_budget_cr: 1250.00,
        description: 'Coastal expressway link connecting Jaigad Port with National Highway corridor. Delayed due to complex hilly terrain, title disputes, and environmental clearances.'
      },
      {
        name: 'Nagpur Multi-Modal Logistics Hub & Dry Port Connectivity',
        project_code: 'PROP-2025-MH-2042',
        project_type: 'industrial_corridor',
        requesting_body: 'Container Corporation of India (CONCOR) & MIDC',
        state: 'Maharashtra',
        district: 'Nagpur',
        status: 'state_approval',
        target_completion_date: '2027-08-15',
        estimated_budget_cr: 890.00,
        description: 'Multi-modal cargo aggregation yard and dedicated rail siding connecting MIHAN SEZ with the Western DFC.'
      },
      {
        name: 'Mumbai Coastal Transit Connector & Metro Line 12 Depot',
        project_code: 'PROP-2025-MH-2043',
        project_type: 'urban_development',
        requesting_body: 'Mumbai Metropolitan Region Development Authority (MMRDA)',
        state: 'Maharashtra',
        district: 'Mumbai Sub',
        status: 'award_declared',
        target_completion_date: '2027-12-31',
        estimated_budget_cr: 1840.00,
        description: 'Elevated connector and maintenance stabling depot for metro transit expansion across the eastern suburbs.'
      },
      {
        name: 'Nashik Multi-Modal Agro Logistics Export Park',
        project_code: 'PROP-2025-MH-2044',
        project_type: 'industrial_corridor',
        requesting_body: 'Maharashtra Industrial Development Corporation (MIDC)',
        state: 'Maharashtra',
        district: 'Nashik',
        status: 'compensation_disbursed',
        target_completion_date: '2027-05-30',
        estimated_budget_cr: 620.00,
        description: 'Cold-chain aggregation center and perishables freight corridor for onion, grape, and vegetable agro-exports.'
      },
      {
        name: 'Solapur Ultra-Mega Renewable Solar Park Grid Link',
        project_code: 'PROP-2025-MH-2045',
        project_type: 'renewable_energy',
        requesting_body: 'Maharashtra State Power Generation Company (MAHAGENCO)',
        state: 'Maharashtra',
        district: 'Solapur',
        status: 'award_declared',
        target_completion_date: '2026-12-31',
        estimated_budget_cr: 480.00,
        description: 'Solar grid evacuation corridor and 765kV substation expansion across barren rain-shadow tracts.'
      },
      {
        name: 'Pune Ring Road & Industrial Corridor Phase II',
        project_code: 'PROP-2025-MH-2046',
        project_type: 'highway',
        requesting_body: 'MSRDC & Pune Metropolitan Region Development Authority (PMRDA)',
        state: 'Maharashtra',
        district: 'Pune',
        status: 'possession_taken',
        target_completion_date: '2027-02-28',
        estimated_budget_cr: 2100.00,
        description: 'Southern bypass ring road interconnecting Chakan industrial zone with the Pune-Bengaluru expressway.'
      }
    ];

    for (const p of additionalMhProjects) {
      const existing = await client.query(`SELECT id FROM projects WHERE project_code = $1;`, [p.project_code]);
      let projId;
      if (existing.rows.length === 0) {
        const ins = await client.query(`
          INSERT INTO projects (name, project_code, project_type, requesting_body, state, district, status, target_completion_date, estimated_budget_cr, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id;
        `, [p.name, p.project_code, p.project_type, p.requesting_body, p.state, p.district, p.status, p.target_completion_date, p.estimated_budget_cr, p.description]);
        projId = ins.rows[0].id;
      } else {
        projId = existing.rows[0].id;
        await client.query(`
          UPDATE projects SET status = $1, target_completion_date = $2, estimated_budget_cr = $3, description = $4
          WHERE id = $5;
        `, [p.status, p.target_completion_date, p.estimated_budget_cr, p.description, projId]);
      }
    }

    // Fetch all Maharashtra project IDs
    const mhProjectsRes = await client.query(`SELECT id, name, district, status FROM projects WHERE state = 'Maharashtra' ORDER BY id ASC;`);
    const mhProjects = mhProjectsRes.rows;

    // Seed parcels and compensation for projects that don't have enough parcels
    for (const proj of mhProjects) {
      const pCountRes = await client.query(`SELECT COUNT(*) as count FROM land_parcels WHERE project_id = $1;`, [proj.id]);
      if (parseInt(pCountRes.rows[0].count, 10) < 3) {
        // Add realistic parcels
        const sampleParcels = [
          { survey: `SY-${proj.id}01/A`, area: 4.5200, owner: 'Dattatray Shinde & Co-owners', status: proj.status === 'possession_taken' ? 'possession_taken' : (proj.status === 'compensation_disbursed' ? 'acquired' : 'notified') },
          { survey: `SY-${proj.id}02/B`, area: 6.8400, owner: 'Babasaheb Kadam', status: proj.status === 'possession_taken' ? 'possession_taken' : 'acquired' },
          { survey: `SY-${proj.id}03/C`, area: 3.2100, owner: 'Suresh Vishnu Pawar', status: proj.district === 'Ratnagiri' ? 'disputed' : (proj.status === 'possession_taken' ? 'possession_taken' : 'notified') }
        ];

        for (const sp of sampleParcels) {
          const lat = proj.district === 'Pune' ? 18.5204 : (proj.district === 'Ratnagiri' ? 16.9902 : (proj.district === 'Nagpur' ? 21.1458 : (proj.district === 'Mumbai Sub' ? 19.0760 : (proj.district === 'Nashik' ? 19.9975 : 17.6599))));
          const lng = proj.district === 'Pune' ? 73.8567 : (proj.district === 'Ratnagiri' ? 73.3120 : (proj.district === 'Nagpur' ? 79.0882 : (proj.district === 'Mumbai Sub' ? 72.8777 : (proj.district === 'Nashik' ? 73.7898 : 75.9064))));
          const offset = 0.004;
          const geom = {
            type: 'Polygon',
            coordinates: [[
              [lng - offset, lat - offset],
              [lng + offset, lat - offset],
              [lng + offset, lat + offset],
              [lng - offset, lat + offset],
              [lng - offset, lat - offset]
            ]]
          };

          const pRes = await client.query(`
            INSERT INTO land_parcels (project_id, survey_number, area_hectares, geom, owner_name, status, land_type, village)
            VALUES ($1, $2, $3, $4, $5, $6, 'agricultural', $7)
            RETURNING id;
          `, [proj.id, sp.survey, sp.area, JSON.stringify(geom), sp.owner, sp.status, `${proj.district} Sector`]);

          const newParcelId = pRes.rows[0].id;
          const assessed = Math.round(sp.area * 7500000);
          const isPaid = proj.status === 'possession_taken' || proj.status === 'compensation_disbursed' || (proj.status === 'award_declared' && sp.status === 'acquired');
          const paidAmt = isPaid ? assessed : (proj.district === 'Ratnagiri' ? Math.round(assessed * 0.2) : 0);
          const payStatus = isPaid ? 'paid' : (paidAmt > 0 ? 'processing' : 'pending');
          const rnrStatus = isPaid ? 'completed' : (proj.district === 'Ratnagiri' ? 'in_progress' : 'not_started');

          await client.query(`
            INSERT INTO compensation (parcel_id, assessed_amount, paid_amount, payment_status, rnr_status, families_affected, bank_account_masked, ifsc_code)
            VALUES ($1, $2, $3, $4, $5, 2, 'XXXX-XXXX-8921', 'SBIN0001045')
            ON CONFLICT DO NOTHING;
          `, [newParcelId, assessed, paidAmt, payStatus, rnrStatus]);

          await client.query(`
            INSERT INTO affected_families (parcel_id, family_head_name, aadhaar_masked, member_count, is_affected, is_displaced, rnr_required, category)
            VALUES ($1, $2, 'XXXX-XXXX-7721', 4, true, $3, true, 'OBC')
            ON CONFLICT DO NOTHING;
          `, [newParcelId, sp.owner, proj.district === 'Ratnagiri']);
        }
      }
    }

    // Seed Milestones for all Maharashtra projects
    for (const proj of mhProjects) {
      const isDelayed = proj.district === 'Ratnagiri';
      const milestones = [
        {
          title: 'Section 4(1) Preliminary Notification & SIA Scrutiny',
          stage: 'proposal_submitted',
          planned: '2025-02-15',
          actual: '2025-02-10',
          status: 'completed',
          delay_days: 0,
          remarks: 'Social Impact Assessment published and approved by Expert Group.'
        },
        {
          title: 'Section 11 Gazette Declaration & Cadastral Demarcation',
          stage: 'document_verification',
          planned: '2025-06-30',
          actual: isDelayed ? null : '2025-06-25',
          status: isDelayed ? 'delayed' : 'completed',
          delay_days: isDelayed ? 64 : 0,
          remarks: isDelayed ? 'Delayed due to public hearing disputes in coastal tehsils.' : 'Gazette notification issued in State Official Gazette.'
        },
        {
          title: 'District Scrutiny & Collector Joint Measurement (SLAO)',
          stage: 'district_scrutiny',
          planned: '2025-10-31',
          actual: isDelayed ? null : (proj.status === 'document_verification' ? null : '2025-10-28'),
          status: isDelayed ? 'delayed' : (proj.status === 'document_verification' ? 'pending' : 'completed'),
          delay_days: isDelayed ? 128 : 0,
          remarks: isDelayed ? 'Critical bottleneck: Land acquisition objections pending under Section 15.' : 'Joint measurement survey completed.'
        },
        {
          title: 'Section 19 State Government Declaration & Cabinet Clearance',
          stage: 'state_approval',
          planned: '2026-03-31',
          actual: proj.status === 'state_approval' ? null : (['award_declared', 'compensation_disbursed', 'possession_taken'].includes(proj.status) ? '2026-03-20' : null),
          status: proj.status === 'state_approval' ? 'in_progress' : (['award_declared', 'compensation_disbursed', 'possession_taken'].includes(proj.status) ? 'completed' : (isDelayed ? 'delayed' : 'pending')),
          delay_days: isDelayed ? 95 : 0,
          remarks: proj.status === 'state_approval' ? 'Statutory file submitted for Principal Secretary (Revenue) approval.' : 'Awaiting formal declaration.'
        },
        {
          title: 'Section 23 Award Declaration & Valuation Determination',
          stage: 'award_declared',
          planned: '2026-07-31',
          actual: ['compensation_disbursed', 'possession_taken'].includes(proj.status) ? '2026-07-15' : null,
          status: ['compensation_disbursed', 'possession_taken'].includes(proj.status) ? 'completed' : 'pending',
          delay_days: 0,
          remarks: 'Collector award formulation with 100% Solatium and 12% additional market value.'
        },
        {
          title: 'Direct Benefit Transfer (PFMS) Compensation Disbursement',
          stage: 'compensation_disbursed',
          planned: '2026-10-31',
          actual: proj.status === 'possession_taken' ? '2026-10-20' : null,
          status: proj.status === 'possession_taken' ? 'completed' : (proj.status === 'compensation_disbursed' ? 'in_progress' : 'pending'),
          delay_days: 0,
          remarks: 'Direct electronic credit to verified bank accounts via PFMS/NPCI portal.'
        }
      ];

      for (const m of milestones) {
        await client.query(`
          INSERT INTO project_milestones (project_id, title, stage, planned_date, actual_date, status, delay_days, remarks)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `, [proj.id, m.title, m.stage, m.planned, m.actual, m.status, m.delay_days, m.remarks]);
      }
    }

    // Seed State Approvals (Inbox for State Government user)
    // Find Nagpur project (which is in state_approval stage)
    const nagpurProj = mhProjects.find(p => p.district === 'Nagpur');
    if (nagpurProj) {
      await client.query(`
        INSERT INTO state_approvals (project_id, request_type, title, submitted_by, submitted_date, status, priority, justification, supporting_doc_url)
        VALUES (
          $1,
          'section_19_declaration',
          'Statutory Section 19 Gazette Declaration Approval - Nagpur Logistics Hub',
          $2,
          CURRENT_TIMESTAMP - INTERVAL '4 days',
          'pending',
          'urgent',
          'All Section 15 objection hearings completed by District Collector Nagpur. Joint measurement survey report and SIA Rehabilitation & Resettlement scheme ready for sovereign state declaration.',
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop'
        );
      `, [nagpurProj.id, distOfficerId]);
    }

    // Also add another clearance request (e.g. Special R&R Package for Ratnagiri corridor)
    const ratnagiriProj = mhProjects.find(p => p.district === 'Ratnagiri');
    if (ratnagiriProj) {
      await client.query(`
        INSERT INTO state_approvals (project_id, request_type, title, submitted_by, submitted_date, status, priority, justification, supporting_doc_url)
        VALUES (
          $1,
          'special_rnr_sanction',
          'Cabinet Special Relief & Rehabilitation Ex-Gratia Package Sanction',
          $2,
          CURRENT_TIMESTAMP - INTERVAL '8 days',
          'pending',
          'high',
          'Special ex-gratia allowance sanction requested for 145 displaced fishermen and horticultural families in Jaigad coastal corridor to resolve litigation bottleneck.',
          'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop'
        );
      `, [ratnagiriProj.id, distOfficerId]);
    }

    // Seed State Alerts
    await client.query(`
      INSERT INTO state_alerts (state, district, project_id, alert_type, priority, title, description)
      VALUES 
      ('Maharashtra', 'Ratnagiri', $1, 'timeline_delayed', 'critical', 'Critical Corridor Bottleneck: Ratnagiri Expressway Exceeds SLA by 128 Days', 'Overdue Section 15 objection hearings and compensation disputes have halted progress at 67%. Immediate State Secretariat intervention recommended.'),
      ('Maharashtra', 'Ratnagiri', $1, 'compensation_pending', 'high', 'High Compensation Backlog: ₹142.50 Cr Awaiting Disbursement in Ratnagiri', 'Pending disbursals are creating farmer unrest along Jaigad alignment. Bank account seeding verification required.'),
      ('Maharashtra', 'Nagpur', $2, 'approval_pending', 'high', 'Section 19 Gazette Clearance Pending State Review for 4+ Days', 'Statutory 12-month window under RFCTLARR Act approaching. Cabinet note clearance needed.'),
      ('Maharashtra', 'Pune', $3, 'dispute_density', 'medium', 'Notice: 3 Minor Boundary Servitude Disputes Flagged in Chakan Sector', 'Field Officers reported minor irrigation canal overlap. Local SLAO mediation in progress.');
    `, [
      ratnagiriProj?.id || mhProjects[0].id,
      nagpurProj?.id || mhProjects[0].id,
      mhProjects.find(p => p.district === 'Pune')?.id || mhProjects[0].id
    ]);

    await client.query('COMMIT');
    console.log('[SEED] State Government realistic data for Maharashtra seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[SEED ERROR in State Government]:', err);
    throw err;
  } finally {
    client.release();
    if (require.main === module) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  seedStateGovernment();
}

module.exports = seedStateGovernment;
