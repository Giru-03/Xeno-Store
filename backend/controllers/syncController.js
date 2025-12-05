const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');

const ingestionQueue = new Queue('shopify-ingestion', { connection: redisConnection });

exports.triggerSync = async (req, res) => {
    try {
        const tenantId = req.user.id;
        await ingestionQueue.add('sync-customers', { tenantId, type: 'customers' });
        await ingestionQueue.add('sync-orders', { tenantId, type: 'orders' });
        await ingestionQueue.add('sync-products', { tenantId, type: 'products' });
        res.json({ message: 'Sync started' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
