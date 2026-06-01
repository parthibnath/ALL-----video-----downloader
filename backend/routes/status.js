const express = require('express');
const router = express.Router();
const { checkYtDlp } = require('../utils/ytdlp');

let cachedStatus = null;
let lastCheck = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

router.get('/', async (req, res) => {
  const now = Date.now();

  if (cachedStatus && (now - lastCheck) < CACHE_TTL) {
    return res.json(cachedStatus);
  }

  const ytDlpStatus = await checkYtDlp();

  cachedStatus = {
    status: ytDlpStatus.available ? 'operational' : 'degraded',
    ytdlp: ytDlpStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
  lastCheck = now;

  res.json(cachedStatus);
});

module.exports = router;
