const path = require('path');
const dotenv = require('dotenv');

// Resolve from this file rather than the current working directory, so the
// shared project .env works with both `node backend/server.js` and `npm start`.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const nerRoutes = require('./routes/nerRoutes');

const app = express();

const DEFAULT_PORT = 5000;
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

function getPort() {
  const configuredPort = Number.parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

  return Number.isInteger(configuredPort) && configuredPort > 0 && configuredPort <= 65535
    ? configuredPort
    : DEFAULT_PORT;
}

function getAllowedOrigins() {
  const configuredOrigins = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = getAllowedOrigins();

app.disable('x-powered-by');

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (for example, curl or a local health check)
      // do not need browser CORS protection.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error('This origin is not allowed to access the API.');
      error.status = 403;
      return callback(error);
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  })
);

// The text limit is also enforced in the controller. This parser limit prevents
// unusually large JSON payloads from reaching application logic.
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '128kb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'MemoryCare NER Backend'
  });
});

app.use('/api/ner', nerRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'The requested API endpoint was not found.'
  });
});

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON request body.'
    });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'The submitted text is too large for this demo.'
    });
  }

  if (error.status === 403) {
    return res.status(403).json({
      success: false,
      error: 'This browser origin is not allowed to access the API.'
    });
  }

  // Do not include raw request content or stack traces in the response.
  console.error('[MemoryCare NER backend] Unexpected error:', error.message);
  return res.status(500).json({
    success: false,
    error: 'Unable to process the request right now. Please try again.'
  });
});

if (require.main === module) {
  const port = getPort();

  app.listen(port, () => {
    console.log(`MemoryCare NER backend listening on port ${port}`);
  });
}

module.exports = app;
