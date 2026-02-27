const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { checkRedis, checkDatabase } = require('./utils/healthcheck');
const healthRoutes = require('./routes/health.routes');
const storeRoutes = require('./routes/store.routes');
const integrationRoutes = require('./routes/integration.routes');
const ordersRoutes = require('./routes/orders.routes');
const qnaRoutes = require('./routes/qna.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Explicit CORS allowlist — avoids 'Unexpected token <' on wrong-port fetch
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL, // production URL e.g. https://mytienda.vercel.app
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow same-origin / server-to-server requests (no origin header)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin '${origin}' is not allowed.`));
        }
    },
    credentials: true,
}));

app.use(express.json());


// Routes
app.use('/api', healthRoutes);
app.use('/api', storeRoutes);
app.use('/api', integrationRoutes);
app.use('/api', ordersRoutes);
app.use('/api', qnaRoutes);

// Startup: verify external connections before accepting traffic
async function startServer() {
    console.log('\n🚀 MyTienda Backend — Booting up...\n');

    // Check Redis
    try {
        await checkRedis();
        console.log('  [✓] Connected to Upstash Redis');
    } catch (err) {
        console.error(`  [✗] Redis connection FAILED: ${err.message}`);
    }

    // Check Supabase
    try {
        await checkDatabase();
        console.log('  [✓] Connected to Supabase Database');
    } catch (err) {
        console.error(`  [✗] Supabase connection FAILED: ${err.message}`);
    }

    app.listen(PORT, () => {
        console.log(`  [✓] Backend server is running on port ${PORT}`);
        console.log(`\n  Health endpoint: http://localhost:${PORT}/api/health\n`);
    });
}

startServer();

