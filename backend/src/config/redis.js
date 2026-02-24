const Redis = require('ioredis');

// Skeleton setup for Upstash Serverless Redis
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';

// We define it as a mock skeleton for now to prevent connection errors
const redis = redisUrl ? new Redis(redisUrl) : null;

module.exports = redis;
