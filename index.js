require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./app/config/db');
const aggregatorRoutes = require('./app/routes/aggregatorRoutes');
const healthRoutes = require('./app/routes/health');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(`${process.env.BASE_PATH}/aggregator`, aggregatorRoutes);

app.use(`${process.env.BASE_PATH}`, healthRoutes);

// Server start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
