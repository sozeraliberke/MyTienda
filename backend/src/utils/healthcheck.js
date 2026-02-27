require('dotenv').config();
const IORedis = require('ioredis');
const { createClient } = require('@supabase/supabase-js');

/**
 * Pings Redis to verify the connection is alive.
 * @returns {Promise<void>} Resolves if connected, rejects with an error if not.
 */
async function checkRedis() {
    if (!process.env.REDIS_URL) {
        throw new Error('REDIS_URL is not set in environment variables.');
    }

    const redis = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        connectTimeout: 5000,
    });

    try {
        const pong = await redis.ping();
        if (pong !== 'PONG') throw new Error(`Unexpected Redis response: ${pong}`);
    } finally {
        redis.disconnect();
    }
}

/**
 * Runs a lightweight query against Supabase to verify connectivity.
 * @returns {Promise<void>} Resolves if connected, rejects if not.
 */
async function checkDatabase() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not set in environment variables.');
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    // Lightweight query — just checks we can reach the API
    const { error } = await supabase.from('stores').select('id').limit(1);
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
}

module.exports = { checkRedis, checkDatabase };
