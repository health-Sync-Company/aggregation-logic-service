const express = require('express');
const router = express.Router();
const os = require('os');
const mongoose = require('mongoose');

// Health Check Endpoint
router.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({
        status: 'UP',
        database: dbStatus,
        uptime: process.uptime(),
        timestamp: new Date(),
        memoryUsage: process.memoryUsage(),
        systemInfo: {
            platform: os.platform(),
            arch: os.arch(),
            release: os.release(),
            hostname: os.hostname(),
        },
    });
});

module.exports = router;
