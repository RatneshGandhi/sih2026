@echo off
echo Starting PostgreSQL for NLAMS on port 5433...
node -e "require('./server/db/ensureDb').ensurePostgresRunning()"
pause
