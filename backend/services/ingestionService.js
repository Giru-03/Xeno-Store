const { Tenant, Customer, Order, Product } = require('../models');
const { fetchShopifyData } = require('./shopifyService');

const syncCustomers = async (tenantId) => {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    console.log(`Processing customers for ${tenant.shopName}`);
    let params = { limit: 250 };
    let hasNext = true;
    
    // Simplified pagination (just one page for demo)
    while (hasNext) {
        const data = await fetchShopifyData(tenant.shopifyDomain, tenant.accessToken, 'customers', params);
        if (!data || !data.customers) break;

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
        hasNext = false; 
    }
};

const syncOrders = async (tenantId) => {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    console.log(`Processing orders for ${tenant.shopName}`);
    let params = { limit: 250, status: 'any' };
    let hasNext = true;

    while (hasNext) {
        const data = await fetchShopifyData(tenant.shopifyDomain, tenant.accessToken, 'orders', params);
        if (!data || !data.orders) break;

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
};

const syncProducts = async (tenantId) => {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    console.log(`Processing products for ${tenant.shopName}`);
    let params = { limit: 250 };
    let hasNext = true;

    while (hasNext) {
        const data = await fetchShopifyData(tenant.shopifyDomain, tenant.accessToken, 'products', params);
        if (!data || !data.products) break;

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
};

module.exports = { syncCustomers, syncOrders, syncProducts };
