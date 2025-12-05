const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const { syncCustomers, syncOrders, syncProducts } = require('../services/ingestionService');

const ingestionWorker = new Worker('shopify-ingestion', async job => {
    console.log(`Job started: ${job.name}`);
    const { tenantId, type } = job.data;

    if (type === 'customers') {
        await syncCustomers(tenantId);
    } else if (type === 'orders') {
        await syncOrders(tenantId);
    } else if (type === 'products') {
        await syncProducts(tenantId);
    }
}, { connection: redisConnection });

ingestionWorker.on('completed', job => {
    console.log(`Job ${job.id} completed!`);
});

ingestionWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
});

console.log('🚀 Ingestion Worker Started');

module.exports = ingestionWorker;
