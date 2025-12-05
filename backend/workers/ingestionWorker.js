const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const { Tenant, Customer, Order, Product } = require('../models');
const { fetchShopifyData } = require('../services/shopifyService');

const ingestionWorker = new Worker('shopify-ingestion', async job => {
    console.log(`Job started: ${job.name}`);
    const { tenantId, type } = job.data;
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    console.log(`Processing ${type} for ${tenant.shopName}`);

    if (type === 'customers') {
        let params = { limit: 250 };
        let hasNext = true;
        while (hasNext) {
            const data = await fetchShopifyData(tenant.shopifyDomain, tenant.accessToken, 'customers', params);
            for (const c of data.customers) {
                // Fallback logic for name
                let finalFirstName = c.first_name;
                let finalLastName = c.last_name;

                if (!finalFirstName && !finalLastName) {
                    if (c.default_address) {
                        finalFirstName = c.default_address.first_name;
                        finalLastName = c.default_address.last_name;
                    }
                }

                if (!finalFirstName && !finalLastName && c.email) {
                    finalFirstName = c.email.split('@')[0];
                }

                if (!finalFirstName && !finalLastName) {
                    finalFirstName = "Customer";
                    finalLastName = `#${c.id}`;
                }

                await Customer.upsert({
                    shopifyCustomerId: c.id,
                    firstName: finalFirstName,
                    lastName: finalLastName,
                    email: c.email,
                    totalSpent: c.total_spent,
                    TenantId: tenant.id
                });
            }
            // Pagination logic would go here (simplified for now)
            hasNext = false; 
        }
    } else if (type === 'orders') {
        let params = { limit: 250, status: 'any' };
        let hasNext = true;
        while (hasNext) {
            const data = await fetchShopifyData(tenant.shopifyDomain, tenant.accessToken, 'orders', params);
            for (const o of data.orders) {
                // Find customer
                let customerId = null;
                if (o.customer) {
                    const customer = await Customer.findOne({ where: { shopifyCustomerId: o.customer.id, TenantId: tenant.id } });
                    if (customer) customerId = customer.id;
                }

                // Use processed_at if available, else created_at
                const orderDate = o.processed_at || o.created_at;

                await Order.upsert({
                    shopifyOrderId: o.id,
                    shopifyOrderNumber: o.name,
                    totalPrice: o.total_price,
                    financialStatus: o.financial_status,
                    createdAt: orderDate,
                    TenantId: tenant.id,
                    CustomerId: customerId
                });
            }
            hasNext = false;
        }
    } else if (type === 'products') {
        let params = { limit: 250 };
        let hasNext = true;
        while (hasNext) {
            const data = await fetchShopifyData(tenant.shopifyDomain, tenant.accessToken, 'products', params);
            for (const p of data.products) {
                await Product.upsert({
                    shopifyProductId: p.id,
                    title: p.title,
                    price: p.variants[0]?.price || 0,
                    TenantId: tenant.id
                });
            }
            hasNext = false;
        }
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
