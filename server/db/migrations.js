const { pool } = require('./pool');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('[MIGRATION] Starting database schema migrations for NLAMS...');

    await client.query('BEGIN');

    // 1. Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('citizen', 'field_officer', 'district_official', 'state_official', 'ministry_official')),
        state VARCHAR(100),
        district VARCHAR(100),
        designation VARCHAR(150),
        department VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        project_code VARCHAR(100) UNIQUE,
        project_type VARCHAR(50) NOT NULL CHECK (project_type IN ('highway', 'railway', 'industrial_corridor', 'irrigation', 'urban_development', 'renewable_energy')),
        requesting_body VARCHAR(255) NOT NULL,
        state VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('proposal_submitted', 'document_verification', 'district_scrutiny', 'state_approval', 'award_declared', 'compensation_disbursed', 'possession_taken')),
        target_completion_date DATE,
        estimated_budget_cr NUMERIC(12, 2) DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Land Parcels table (using JSONB geom fallback per environment specification)
    await client.query(`
      CREATE TABLE IF NOT EXISTS land_parcels (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        survey_number VARCHAR(100) NOT NULL,
        area_hectares NUMERIC(12, 4) NOT NULL,
        geom JSONB NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        aadhaar_masked VARCHAR(20),
        status VARCHAR(50) NOT NULL CHECK (status IN ('notified', 'acquired', 'possession_taken', 'disputed')),
        land_type VARCHAR(100) DEFAULT 'agricultural',
        village VARCHAR(100),
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Compensation table
    await client.query(`
      CREATE TABLE IF NOT EXISTS compensation (
        id SERIAL PRIMARY KEY,
        parcel_id INTEGER REFERENCES land_parcels(id) ON DELETE CASCADE,
        assessed_amount NUMERIC(15, 2) NOT NULL,
        paid_amount NUMERIC(15, 2) DEFAULT 0,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid')),
        rnr_status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (rnr_status IN ('not_started', 'in_progress', 'completed')),
        families_affected INTEGER DEFAULT 1,
        bank_account_masked VARCHAR(50),
        ifsc_code VARCHAR(20),
        utr_number VARCHAR(50),
        disbursed_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // 5. Documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        version INTEGER DEFAULT 1,
        uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        verified BOOLEAN DEFAULT FALSE,
        verified_by VARCHAR(255),
        verified_at TIMESTAMP WITH TIME ZONE,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Activity Log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        from_status VARCHAR(50),
        to_status VARCHAR(50),
        remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('approval_needed', 'delay', 'update')),
        is_read BOOLEAN DEFAULT FALSE,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create useful indexes for queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_projects_state ON projects(state);
      CREATE INDEX IF NOT EXISTS idx_parcels_project ON land_parcels(project_id);
      CREATE INDEX IF NOT EXISTS idx_parcels_status ON land_parcels(status);
      CREATE INDEX IF NOT EXISTS idx_compensation_parcel ON compensation(parcel_id);
      CREATE INDEX IF NOT EXISTS idx_compensation_payment ON compensation(payment_status);
      CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
      CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_log(project_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
    `);

    await client.query('COMMIT');
    console.log('[MIGRATION] All 7 tables and indexes created successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION ERROR]:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    if (require.main === module) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
