const { pool } = require('./pool');

async function seedFieldOfficer() {
  const client = await pool.connect();
  try {
    console.log('[SEED] Starting realistic Field Officer data seeding...');
    await client.query('BEGIN');

    // Fetch field officer
    const userRes = await client.query(`SELECT id FROM users WHERE role = 'field_officer' LIMIT 1;`);
    if (userRes.rows.length === 0) {
      console.log('[SEED] No field_officer found, skipping field officer seed.');
      await client.query('ROLLBACK');
      return;
    }
    const officerId = userRes.rows[0].id;

    // Fetch existing land parcels
    const parcelsRes = await client.query(`SELECT id, survey_number, area_hectares, geom FROM land_parcels ORDER BY id ASC LIMIT 8;`);
    const parcels = parcelsRes.rows;
    if (parcels.length === 0) {
      console.log('[SEED] No parcels found to assign.');
      await client.query('ROLLBACK');
      return;
    }

    // Clean previous field officer seed data to make it idempotent
    await client.query(`DELETE FROM field_evidence WHERE officer_id = $1;`, [officerId]);
    await client.query(`DELETE FROM field_documents WHERE officer_id = $1;`, [officerId]);
    await client.query(`DELETE FROM field_issues WHERE officer_id = $1;`, [officerId]);
    await client.query(`DELETE FROM possession_evidence WHERE officer_id = $1;`, [officerId]);
    await client.query(`DELETE FROM family_verifications WHERE officer_id = $1;`, [officerId]);
    await client.query(`DELETE FROM affected_families;`);
    await client.query(`DELETE FROM field_verifications WHERE officer_id = $1;`, [officerId]);
    await client.query(`DELETE FROM field_assignments WHERE officer_id = $1;`, [officerId]);

    // 1. Seed Assignments
    const assignmentConfigs = [
      { parcelIdx: 0, status: 'submitted_for_review', priority: 'high', daysDue: 5 },
      { parcelIdx: 1, status: 'in_progress', priority: 'urgent', daysDue: 2 },
      { parcelIdx: 2, status: 'disputed', priority: 'high', daysDue: 4 },
      { parcelIdx: 3, status: 'pending', priority: 'medium', daysDue: 10 },
      { parcelIdx: 4, status: 'pending', priority: 'urgent', daysDue: -2 }, // Overdue task!
      { parcelIdx: 5, status: 'in_progress', priority: 'low', daysDue: 15 },
    ];

    for (const conf of assignmentConfigs) {
      if (parcels[conf.parcelIdx]) {
        const pId = parcels[conf.parcelIdx].id;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + conf.daysDue);
        
        await client.query(`
          INSERT INTO field_assignments (parcel_id, officer_id, assigned_date, due_date, priority, status)
          VALUES ($1, $2, CURRENT_TIMESTAMP - INTERVAL '3 days', $3, $4, $5)
          ON CONFLICT (parcel_id, officer_id) DO UPDATE 
          SET status = EXCLUDED.status, priority = EXCLUDED.priority, due_date = EXCLUDED.due_date;
        `, [pId, officerId, dueDate.toISOString().split('T')[0], conf.priority, conf.status]);
      }
    }

    // 2. Seed Affected Families for parcels
    const sampleFamilies = [
      { parcelIdx: 0, head: 'Ramesh Kisan Patel', aadh: 'XXXX-XXXX-9812', members: 5, aff: true, disp: true, rnr: true, cat: 'OBC' },
      { parcelIdx: 0, head: 'Bhikaji Hari Patil', aadh: 'XXXX-XXXX-4532', members: 4, aff: true, disp: false, rnr: true, cat: 'General' },
      { parcelIdx: 1, head: 'Savitribai Ganpat More', aadh: 'XXXX-XXXX-4421', members: 3, aff: true, disp: true, rnr: true, cat: 'SC' },
      { parcelIdx: 1, head: 'Namdeo Rama More', aadh: 'XXXX-XXXX-7721', members: 6, aff: true, disp: false, rnr: true, cat: 'SC' },
      { parcelIdx: 2, head: 'Murlidhar Somnath Koli', aadh: 'XXXX-XXXX-1109', members: 7, aff: true, disp: true, rnr: true, cat: 'ST' },
      { parcelIdx: 3, head: 'Prakash Mahadev Vartak', aadh: 'XXXX-XXXX-6632', members: 4, aff: true, disp: false, rnr: false, cat: 'General' },
      { parcelIdx: 4, head: 'Dattatray Babanrao Gawade', aadh: 'XXXX-XXXX-3341', members: 5, aff: true, disp: true, rnr: true, cat: 'General' }
    ];

    const familyIdMap = [];
    for (const fam of sampleFamilies) {
      if (parcels[fam.parcelIdx]) {
        const res = await client.query(`
          INSERT INTO affected_families (parcel_id, family_head_name, aadhaar_masked, member_count, is_affected, is_displaced, rnr_required, category)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, parcel_id, family_head_name;
        `, [parcels[fam.parcelIdx].id, fam.head, fam.aadh, fam.members, fam.aff, fam.disp, fam.rnr, fam.cat]);
        familyIdMap.push(res.rows[0]);
      }
    }

    // 3. Seed Field Verifications
    // Parcel 0 (submitted_for_review)
    if (parcels[0]) {
      const v0 = await client.query(`
        INSERT INTO field_verifications (
          parcel_id, officer_id, status, step_progress,
          gps_lat, gps_lng, gps_accuracy, gps_captured_at,
          boundary_match, observed_area_hectares, area_mismatch_flag, boundary_remarks,
          land_use, occupancy, actual_condition, observation_remarks,
          general_remarks, submitted_at
        ) VALUES (
          $1, $2, 'submitted_for_review', 7,
          19.882415, 72.748231, 4.2, CURRENT_TIMESTAMP - INTERVAL '1 day',
          'yes', 4.8520, false, 'Boundary stones intact on all 4 cardinal coordinates.',
          'agricultural', 'owner_occupied', '["accessible", "crop_present", "trees_present"]'::jsonb,
          'Active paddy crop detected on southern 2.1 Ha. North side contains mango grove.',
          'Verification complete and matches SLAO preliminary notification. Recommended for award declaration.',
          CURRENT_TIMESTAMP - INTERVAL '12 hours'
        ) RETURNING id;
      `, [parcels[0].id, officerId]);

      // Seed family verification for parcel 0
      if (familyIdMap[0]) {
        await client.query(`
          INSERT INTO family_verifications (family_id, verification_id, officer_id, verified_affected, verified_displaced, verified_rnr_required, verified_member_count, remarks)
          VALUES ($1, $2, $3, 'yes', 'yes', 'yes', 5, 'Physical house structure located inside alignment. Displaced family eligible for R&R housing grant.');
        `, [familyIdMap[0].id, v0.rows[0].id, officerId]);
      }

      // Evidence photos
      await client.query(`
        INSERT INTO field_evidence (parcel_id, verification_id, officer_id, category, file_name, file_path, file_type, file_size, caption, gps_lat, gps_lng, is_draft)
        VALUES 
        ($1, $2, $3, 'site_photo', 'vangaon_site_inspection.jpg', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop', 'image/jpeg', 1420500, 'Survey boundary corner peg A-1 facing north.', 19.882415, 72.748231, false),
        ($1, $2, $3, 'boundary_photo', 'vangaon_boundary_stone.jpg', 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800&auto=format&fit=crop', 'image/jpeg', 1890200, 'Official cadastral survey marker located at southwest corner.', 19.881980, 72.747890, false);
      `, [parcels[0].id, v0.rows[0].id, officerId]);
    }

    // Parcel 1 (in_progress)
    if (parcels[1]) {
      await client.query(`
        INSERT INTO field_verifications (
          parcel_id, officer_id, status, step_progress,
          gps_lat, gps_lng, gps_accuracy, gps_captured_at,
          boundary_match, observed_area_hectares, area_mismatch_flag, boundary_remarks,
          land_use, occupancy, actual_condition, observation_remarks
        ) VALUES (
          $1, $2, 'in_progress', 3,
          19.883820, 72.749510, 5.8, CURRENT_TIMESTAMP - INTERVAL '4 hours',
          'partially', 2.9800, true, 'Minor shift on western edge due to irrigation canal servitude.',
          'agricultural', 'owner_occupied', '["accessible", "crop_present"]'::jsonb,
          'Draft in progress. Field officer returning for neighbor verification tomorrow.'
        );
      `, [parcels[1].id, officerId]);
    }

    // 4. Seed Field Issues / Discrepancies
    if (parcels[2]) {
      // Disputed parcel
      await client.query(`
        INSERT INTO field_issues (parcel_id, officer_id, issue_type, priority, title, description, gps_lat, gps_lng, status)
        VALUES ($1, $2, 'boundary_mismatch', 'red', 'Major Boundary Encroachment on Western Margin', 'Observed illegal perimeter brick fencing built across 45 meters of the notified railway ROW. Owner claims historic ancestral possession.', 19.885500, 72.754000, 'open');
      `, [parcels[2].id, officerId]);
    }

    if (parcels[1]) {
      await client.query(`
        INSERT INTO field_issues (parcel_id, officer_id, issue_type, priority, title, description, gps_lat, gps_lng, status)
        VALUES ($1, $2, 'minor_area_discrepancy', 'orange', 'Minor Area Discrepancy (0.14 Ha)', 'Observed area is 2.98 Ha vs Gazette notification 3.12 Ha due to canal embankment deduction.', 19.883820, 72.749510, 'under_review');
      `, [parcels[1].id, officerId]);
    }

    // 5. Seed Possession Evidence sample
    if (parcels[0]) {
      await client.query(`
        INSERT INTO possession_evidence (parcel_id, officer_id, possession_date, gps_lat, gps_lng, site_photo_url, remarks, status)
        VALUES ($1, $2, CURRENT_DATE - INTERVAL '2 days', 19.882415, 72.748231, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop', 'Physical vacant possession taken peacefully in presence of Sarpanch and 2 independent witnesses. Panchnama executed.', 'possession_evidence_submitted');
      `, [parcels[0].id, officerId]);
    }

    await client.query('COMMIT');
    console.log('[SEED] Field Officer realistic data seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[SEED ERROR in Field Officer]:', err);
    throw err;
  } finally {
    client.release();
    if (require.main === module) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  seedFieldOfficer();
}

module.exports = seedFieldOfficer;
