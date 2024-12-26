const request = require('supertest');
const { app, server } = require('../index'); // Import app and server
const mongoose = require('mongoose'); // For closing MongoDB connection

describe('Health Check Endpoint', () => {
    // Clean up after tests
    afterAll(async () => {
        server.close(); // Close the server
        await mongoose.connection.close(); // Close the MongoDB connection
    });

    it('should return status UP and database connection status', async () => {
        const response = await request(app).get('/api/aggregation-logic-service/health'); // Correct BASE_PATH
        
        // Check HTTP status
        expect(response.status).toBe(200);

        // Validate response body
        expect(response.body.status).toBe('UP');
        expect(response.body.database).toMatch(/Connected|Disconnected/);
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('memoryUsage');
        expect(response.body.systemInfo).toHaveProperty('platform');
        expect(response.body.systemInfo).toHaveProperty('arch');
        expect(response.body.systemInfo).toHaveProperty('release');
        expect(response.body.systemInfo).toHaveProperty('hostname');
    });
});
