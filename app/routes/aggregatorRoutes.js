const express = require('express');
const router = express.Router();
const { aggregateData } = require('../controllers/aggregatorController');
const fs = require('fs');

// Endpoint to trigger aggregation manually
router.get('/run', async (req, res) => {
    try {
        const aggregatedData = await aggregateData();
        res.status(200).json(aggregatedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to fetch the latest aggregation results
router.get('/latest', (req, res) => {
    try {
        const data = fs.readFileSync('./aggregatedData.json', 'utf8');
        res.status(200).json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ message: "No aggregated data available" });
    }
});

module.exports = router;

