const cron = require('node-cron');
const { aggregateData } = require('./controllers/aggregatorController');
const fs = require('fs');

// Scheduler to aggregate data every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily aggregation job...');
    try {
        const aggregatedData = await aggregateData();

        // Optionally save results to a JSON file or database
        fs.writeFileSync(
            './aggregatedData.json',
            JSON.stringify(aggregatedData, null, 2)
        );

        console.log('Data aggregation completed successfully.');
    } catch (error) {
        console.error('Error in aggregation job:', error.message);
    }
});
