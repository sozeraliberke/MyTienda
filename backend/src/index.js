const express = require('express');
const cors = require('cors');
require('dotenv').config();
const storeRoutes = require('./routes/store.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', storeRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
