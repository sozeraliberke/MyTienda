const express = require('express');
const cors = require('cors');
require('dotenv').config();
const storeRoutes = require('./routes/store.routes');
const integrationRoutes = require('./routes/integration.routes');
const ordersRoutes = require('./routes/orders.routes');
const qnaRoutes = require('./routes/qna.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', storeRoutes);
app.use('/api', integrationRoutes);
app.use('/api', ordersRoutes);
app.use('/api', qnaRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
