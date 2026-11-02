// AI-assisted: see docs/AI_LOG.md #2
const express = require('express');

const SERVICE_NAME = 'uber-clone-backend';

// Builds the Express app without opening a port, so it can be tested in isolation.
function createApp() {
  const app = express();

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: SERVICE_NAME,
      uptime: process.uptime(),
    });
  });

  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
