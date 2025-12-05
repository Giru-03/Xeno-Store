const { Customer, Order, Product, Tenant } = require('../models');

exports.handleWebhook = async (req, res) => {
    const topic = req.headers['x-shopify-topic'];
    const domain = req.headers['x-shopify-shop-domain'];
    const data = req.body;

    console.log(`Received webhook: ${topic} for ${domain}`);

    try {
        const tenant = await Tenant.findOne({ where: { shopifyDomain: domain } });
        if (!tenant) return res.status(404).send('Tenant not found');

        if (topic === 'customers/create' || topic === 'customers/update') {
             // Fallback logic for name
             let finalFirstName = data.first_name;
             let finalLastName = data.last_name;

             if (!finalFirstName && !finalLastName) {
                 if (data.default_address) {
                     finalFirstName = data.default_address.first_name;
                     finalLastName = data.default_address.last_name;
                 }
             }

             if (!finalFirstName && !finalLastName && data.email) {
                 finalFirstName = data.email.split('@')[0];
             }

             if (!finalFirstName && !finalLastName) {
                 finalFirstName = "Customer";
                 finalLastName = `#${data.id}`;
             }

            await Customer.upsert({
                shopifyCustomerId: data.id,
                firstName: finalFirstName,
                lastName: finalLastName,
                email: data.email,
                totalSpent: data.total_spent,
                TenantId: tenant.id
            });
        } else if (topic === 'orders/create' || topic === 'orders/updated') {
            let customerId = null;
            if (data.customer) {
                const customer = await Customer.findOne({ where: { shopifyCustomerId: data.customer.id, TenantId: tenant.id } });
                if (customer) customerId = customer.id;
            }
            
            const orderDate = data.processed_at || data.created_at;

            await Order.upsert({
                shopifyOrderId: data.id,
                shopifyOrderNumber: data.name,
                totalPrice: data.total_price,
                financialStatus: data.financial_status,
                createdAt: orderDate,
                TenantId: tenant.id,
                CustomerId: customerId
            });
        } else if (topic === 'products/create' || topic === 'products/update') {
            await Product.upsert({
                shopifyProductId: data.id,
                title: data.title,
                price: data.variants[0]?.price || 0,
                TenantId: tenant.id
            });
        }

        res.status(200).send('Webhook processed');
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).send('Error processing webhook');
    }
};
