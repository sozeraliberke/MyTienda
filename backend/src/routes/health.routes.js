const express = require('express');
const { checkRedis, checkDatabase } = require('../utils/healthcheck');

const router = express.Router();

/**
 * GET /api/health
 * Returns the live status of Redis and Supabase connections.
 */
router.get('/health', async (req, res) => {
    const result = {
        status: 'ok',
        redis: 'unknown',
        database: 'unknown',
        timestamp: new Date().toISOString(),
    };

    const [redisResult, dbResult] = await Promise.allSettled([
        checkRedis(),
        checkDatabase(),
    ]);

    result.redis = redisResult.status === 'fulfilled' ? 'connected' : `error: ${redisResult.reason?.message}`;
    result.database = dbResult.status === 'fulfilled' ? 'connected' : `error: ${dbResult.reason?.message}`;

    const allOk = redisResult.status === 'fulfilled' && dbResult.status === 'fulfilled';
    result.status = allOk ? 'ok' : 'degraded';

    return res.status(allOk ? 200 : 503).json(result);
});

module.exports = router;
