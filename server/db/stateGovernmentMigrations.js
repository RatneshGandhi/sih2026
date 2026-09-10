const { pool } = require('./pool');

async function migrateStateGovernment() {
  const client = await pool.connect();
  try {
    console.log('[MIGRATION] Starting State Government schema migrations...');
    await client.query('BEGIN');

    // 1. Project Milestones table (tracks planned vs actual dates & statutory milestone delays)
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_milestones (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        stage VARCHAR(50),
        planned_date DATE NOT NULL,
        actual_date DATE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'in_progress', 'delayed', 'pending')),
        delay_days INTEGER DEFAULT 0,
        remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. State Approvals table (tracks requests submitted for State Government approval / gazette clearance)
    await client.query(`
      CREATE TABLE IF NOT EXISTS state_approvals (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        request_type VARCHAR(100) NOT NULL DEFAULT 'section_19_declaration',
        title VARCHAR(255) NOT NULL,
        submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        submitted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned_for_correction', 'clarification_requested')),
        priority VARCHAR(20) NOT NULL DEFAULT 'high' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
        justification TEXT,
        official_remarks TEXT,
        state_officer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action_date TIMESTAMP WITH TIME ZONE,
        supporting_doc_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. State Alerts table (stores executive alerts across state districts)
    await client.query(`
      CREATE TABLE IF NOT EXISTS state_alerts (
        id SERIAL PRIMARY KEY,
        state VARCHAR(100) NOT NULL,
        district VARCHAR(100),
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        acknowledged BOOLEAN DEFAULT FALSE,
        acknowledged_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        acknowledged_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);
      CREATE INDEX IF NOT EXISTS idx_milestones_status ON project_milestones(status);
      CREATE INDEX IF NOT EXISTS idx_state_approvals_project ON state_approvals(project_id);
      CREATE INDEX IF NOT EXISTS idx_state_approvals_status ON state_approvals(status);
      CREATE INDEX IF NOT EXISTS idx_state_alerts_state ON state_alerts(state, acknowledged);
      CREATE INDEX IF NOT EXISTS idx_projects_state_district ON projects(state, district);
    `);

    await client.query('COMMIT');
    console.log('[MIGRATION] State Government tables and indexes created successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION ERROR in State Government]:', err);
    throw err;
  } finally {
    client.release();
    if (require.main === module) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  migrateStateGovernment();
}

module.exports = migrateStateGovernment;
