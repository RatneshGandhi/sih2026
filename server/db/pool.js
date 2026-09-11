const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5433/nlams_db';
const isRemoteDb = connectionString.includes('neon.tech') ||
                   connectionString.includes('supabase.co') ||
                   connectionString.includes('render.com') ||
                   connectionString.includes('amazonaws.com') ||
                   connectionString.includes('railway.app') ||
                   (process.env.NODE_ENV === 'production' && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1'));

const poolConfig = {
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

if (isRemoteDb || process.env.PGSSLMODE === 'require') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

