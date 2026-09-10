const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { ensurePostgresRunning } = require('./db/ensureDb');

// Check and auto-start PostgreSQL if needed
ensurePostgresRunning().catch(err => {
  console.warn('[NLAMS SERVER] DB auto-start warning:', err.message);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'NLAMS Central Sovereign Core API',
    version: '2.6.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/parcels', require('./routes/parcels'));
app.use('/api/compensation', require('./routes/compensation'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/citizen', require('./routes/citizen'));
app.use('/api/admin', require('./routes/admin'));

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Statutory route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

const server = app.listen(PORT, () => {
  console.log(`[NLAMS SERVER] Running on port ${PORT}`);
  console.log(`[NLAMS SERVER] Health: http://localhost:${PORT}/api/health`);
});

module.exports = { app, server };
