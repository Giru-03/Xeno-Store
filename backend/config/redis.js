const IORedis = require('ioredis');
require('dotenv').config();

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null 
});

module.exports = redisConnection;
