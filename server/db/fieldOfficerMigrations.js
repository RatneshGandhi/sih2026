const { pool } = require('./pool');

async function migrateFieldOfficer() {
  const client = await pool.connect();
  try {
    console.log('[MIGRATION] Starting Field Officer schema migrations...');
    await client.query('BEGIN');

    // 1. Field Officer Assignments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS field_assignments (
        id SERIAL PRIMARY KEY,
        parcel_id INTEGER NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
        officer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        due_date DATE,
        priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'verified', 'submitted_for_review', 'disputed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_parcel_officer UNIQUE (parcel_id, officer_id)
      );
    `);

    // 2. Field Verifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS field_verifications (
        id SERIAL PRIMARY KEY,
        parcel_id INTEGER NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
        officer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'draft', 'submitted_for_review', 'verified')),
        step_progress INTEGER DEFAULT 1,
        
        -- GPS Location
        gps_lat NUMERIC(10, 6),
        gps_lng NUMERIC(10, 6),
        gps_accuracy NUMERIC(8, 2),
        gps_captured_at TIMESTAMP WITH TIME ZONE,
        
        -- Boundary Verification
        boundary_match VARCHAR(20) CHECK (boundary_match IN ('yes', 'no', 'partially')),
        observed_area_hectares NUMERIC(12, 4),
        area_mismatch_flag BOOLEAN DEFAULT FALSE,
        boundary_remarks TEXT,
        observed_geom JSONB,
        
        -- Field Observation Form
        land_use VARCHAR(50),
        occupancy VARCHAR(50),
        actual_condition JSONB DEFAULT '[]'::jsonb,
        observation_remarks TEXT,
        
        -- Overall remarks & submission
        general_remarks TEXT,
        submitted_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_verification_parcel_officer UNIQUE (parcel_id, officer_id)
      );
    `);

    // 3. Affected Families table (official records)
    await client.query(`
      CREATE TABLE IF NOT EXISTS affected_families (
        id SERIAL PRIMARY KEY,
        parcel_id INTEGER NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
        family_head_name VARCHAR(255) NOT NULL,
        aadhaar_masked VARCHAR(20),
        member_count INTEGER NOT NULL DEFAULT 4,
        is_affected BOOLEAN DEFAULT TRUE,
        is_displaced BOOLEAN DEFAULT FALSE,
        rnr_required BOOLEAN DEFAULT TRUE,
        category VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Family Verifications (Field Officer proposed updates - leaves official records intact)
    await client.query(`
      CREATE TABLE IF NOT EXISTS family_verifications (
        id SERIAL PRIMARY KEY,
        family_id INTEGER NOT NULL REFERENCES affected_families(id) ON DELETE CASCADE,
        verification_id INTEGER REFERENCES field_verifications(id) ON DELETE CASCADE,
        officer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        verified_affected VARCHAR(20) CHECK (verified_affected IN ('yes', 'no', 'needs_review')),
        verified_displaced VARCHAR(20) CHECK (verified_displaced IN ('yes', 'no', 'needs_review')),
        verified_rnr_required VARCHAR(20) CHECK (verified_rnr_required IN ('yes', 'no', 'needs_review')),
        verified_member_count INTEGER,
        remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_family_officer UNIQUE (family_id, officer_id)
      );
    `);

    // 5. Field Evidence table (geo-tagged photos)
    await client.query(`
      CREATE TABLE IF NOT EXISTS field_evidence (
        id SERIAL PRIMARY KEY,
        parcel_id INTEGER NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
        verification_id INTEGER REFERENCES field_verifications(id) ON DELETE SET NULL,
        officer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL CHECK (category IN ('site_photo', 'boundary_photo', 'land_use_photo', 'structure_photo', 'occupancy_evidence', 'other_evidence')),
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_type VARCHAR(50),
        file_size INTEGER,
        caption TEXT,
        gps_lat NUMERIC(10, 6),
        gps_lng NUMERIC(10, 6),
        is_draft BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Field Documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS field_documents (
        id SERIAL PRIMARY KEY,
        parcel_id INTEGER NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
        verification_id INTEGER REFERENCES field_verifications(id) ON DELETE SET NULL,
        officer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('survey_report', 'field_verification_report', 'supporting_document', 'photographs', 'other_evidence')),
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Field Issues / Discrepancies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS field_issues (
        id SERIAL PRIMARY KEY,
        parcel_id INTEGER NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
        officer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        family_id INTEGER REFERENCES affected_families(id) ON DELETE SET NULL,
        issue_type VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL CHECK (priority IN ('red', 'orange', 'high', 'medium', 'low')),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        gps_lat NUMERIC(10, 6),
        gps_lng NUMERIC(10, 6),
        supporting_evidence_url TEXT,
        status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'requires_correction')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Possession Evidence table
    await client.query(`
      CREATE TABLE IF NOT EXISTS possession_evidence (
        id SERIAL PRIMARY KEY,
        parcel_id INTEGER NOT NULL REFERENCES land_parcels(id) ON DELETE CASCADE,
        officer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        possession_date DATE NOT NULL,
        gps_lat NUMERIC(10, 6),
        gps_lng NUMERIC(10, 6),
        site_photo_url TEXT NOT NULL,
        supporting_doc_url TEXT,
        remarks TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'possession_evidence_submitted',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_field_assignments_officer ON field_assignments(officer_id, status);
      CREATE INDEX IF NOT EXISTS idx_field_assignments_parcel ON field_assignments(parcel_id);
      CREATE INDEX IF NOT EXISTS idx_field_verifications_parcel ON field_verifications(parcel_id);
      CREATE INDEX IF NOT EXISTS idx_affected_families_parcel ON affected_families(parcel_id);
      CREATE INDEX IF NOT EXISTS idx_field_evidence_parcel ON field_evidence(parcel_id);
      CREATE INDEX IF NOT EXISTS idx_field_issues_officer ON field_issues(officer_id, status);
      CREATE INDEX IF NOT EXISTS idx_possession_evidence_parcel ON possession_evidence(parcel_id);
    `);

    await client.query('COMMIT');
    console.log('[MIGRATION] Field Officer tables and indexes created successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION ERROR in Field Officer]:', err);
    throw err;
  } finally {
    client.release();
    if (require.main === module) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  migrateFieldOfficer();
}

module.exports = migrateFieldOfficer;
