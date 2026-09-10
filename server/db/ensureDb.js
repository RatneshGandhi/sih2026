const net = require('net');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

function checkPort(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;

    socket.setTimeout(timeout);

    socket.once('connect', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(true);
      }
    });

    socket.once('timeout', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.once('error', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, host);
  });
}

function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

function findPostgresExecutable() {
  const candidatePaths = [
    'C:\\Program Files\\PostgreSQL\\18\\bin\\postgres.exe',
    'C:\\Program Files\\PostgreSQL\\17\\bin\\postgres.exe',
    'C:\\Program Files\\PostgreSQL\\16\\bin\\postgres.exe',
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  try {
    const stdout = execSync('where.exe postgres', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const lines = stdout.trim().split(/\r?\n/);
    if (lines.length > 0 && fs.existsSync(lines[0])) {
      return lines[0];
    }
  } catch (e) {
    // not in PATH
  }

  return null;
}

async function ensurePostgresRunning() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5433/nlams_db';
  
  // Extract port from DATABASE_URL
  let port = 5433;
  try {
    const parsed = new URL(dbUrl);
    port = parseInt(parsed.port, 10) || 5432;
  } catch (e) {
    const match = dbUrl.match(/:(\d+)\//);
    if (match) port = parseInt(match[1], 10);
  }

  const isUp = await checkPort(port, '127.0.0.1', 600);
  if (isUp) {
    console.log(`[NLAMS DB] PostgreSQL is running on port ${port}.`);
    return true;
  }

  console.log(`[NLAMS DB] PostgreSQL not responding on port ${port}. Checking for local cluster...`);

  const userProfile = process.env.USERPROFILE || process.env.HOME || '';
  const pgDataDir = path.join(userProfile, 'pgdata_nlams');

  if (!fs.existsSync(pgDataDir)) {
    console.warn(`[NLAMS DB] No local cluster found at ${pgDataDir}. Cannot auto-start.`);
    return false;
  }

  // Handle stale postmaster.pid
  const pidFile = path.join(pgDataDir, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    try {
      const pidContent = fs.readFileSync(pidFile, 'utf8');
      const pid = parseInt(pidContent.split(/\r?\n/)[0], 10);
      if (!isPidAlive(pid)) {
        console.log(`[NLAMS DB] Cleaning stale postmaster.pid (PID: ${pid})...`);
        fs.unlinkSync(pidFile);
      }
    } catch (e) {
      try { fs.unlinkSync(pidFile); } catch (_) {}
    }
  }

  const postgresExe = findPostgresExecutable();
  if (!postgresExe) {
    console.warn('[NLAMS DB] postgres.exe executable not found in standard paths.');
    return false;
  }

  console.log(`[NLAMS DB] Launching PostgreSQL service on port ${port}...`);

  try {
    const psCmd = `Start-Process '${postgresExe}' -ArgumentList '-D', '${pgDataDir}', '-p', '${port}' -WindowStyle Hidden`;
    execSync(`powershell.exe -NoProfile -NonInteractive -Command "${psCmd}"`, {
      stdio: 'ignore',
      timeout: 5000,
    });

    // Poll until port becomes available (up to 10 seconds)
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const ready = await checkPort(port, '127.0.0.1', 400);
      if (ready) {
        console.log(`[NLAMS DB] Successfully started PostgreSQL on port ${port}!`);
        return true;
      }
    }
    console.warn(`[NLAMS DB] PostgreSQL process started, but port ${port} did not become ready in time.`);
    return false;
  } catch (err) {
    console.error('[NLAMS DB] Failed to auto-launch PostgreSQL:', err.message);
    return false;
  }
}

module.exports = {
  ensurePostgresRunning,
  checkPort,
};
