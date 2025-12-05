const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');
const { syncCustomers, syncOrders, syncProducts } = require('../services/ingestionService');

const ingestionQueue = new Queue('shopify-ingestion', { connection: redisConnection });

exports.triggerSync = async (req, res) => {
    try {
        const tenantId = req.user.id;

        // If running on Vercel (Serverless), run synchronously
        if (process.env.VERCEL) {
            console.log('Running sync synchronously (Serverless Mode)...');
            
            // Run in parallel but await completion
            await Promise.all([
                syncCustomers(tenantId),
                syncOrders(tenantId),
                syncProducts(tenantId)
            ]);

            return res.json({ message: 'Sync completed successfully (Serverless Mode)' });
        }

        // Otherwise, use the queue
        await ingestionQueue.add('sync-customers', { tenantId, type: 'customers' });
        await ingestionQueue.add('sync-orders', { tenantId, type: 'orders' });
        await ingestionQueue.add('sync-products', { tenantId, type: 'products' });
        res.json({ message: 'Sync started' });
    } catch (err) {
        console.error('Sync Error:', err);
        res.status(500).json({ error: err.message });
    }
};
