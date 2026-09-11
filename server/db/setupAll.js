const migrate = require('./migrations');
const seed = require('./seed');
const migrateFieldOfficer = require('./fieldOfficerMigrations');
const seedFieldOfficer = require('./seedFieldOfficer');
const migrateStateGovernment = require('./stateGovernmentMigrations');
const seedStateGovernment = require('./seedStateGovernment');
const { pool } = require('./pool');

async function setupAll() {
  console.log('====================================================');
  console.log('  NLAMS - Full Database Setup (Migrations + Seeds)  ');
  console.log('====================================================');
  try {
    console.log('\n[1/6] Running core migrations...');
    await migrate();

    console.log('\n[2/6] Running Field Officer migrations...');
    await migrateFieldOfficer();

    console.log('\n[3/6] Running State Government migrations...');
    await migrateStateGovernment();

    console.log('\n[4/6] Seeding core demo data...');
    await seed();

    console.log('\n[5/6] Seeding Field Officer data...');
    await seedFieldOfficer();

    console.log('\n[6/6] Seeding State Government data...');
    await seedStateGovernment();

    console.log('\n>>> All NLAMS tables and demo records successfully prepared! <<<');
  } catch (err) {
    console.error('\n[SETUP ERROR]:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  setupAll();
}

module.exports = setupAll;
