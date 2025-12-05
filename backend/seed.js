require('dotenv').config();

// FIX: Automatically remove https:// and trailing slashes if present in the .env variable
const SHOP = (process.env.SHOP_DOMAIN || 'your-store.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
    console.error("❌ Error: SHOPIFY_ACCESS_TOKEN is missing from .env file");
    process.exit(1);
}

// --- UTILS ---

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ENHANCED API CALL: Handles 429 Too Many Requests automatically
const apiCall = async (endpoint, method, body) => {
    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
        try {
            const headers = {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': ACCESS_TOKEN
            };

            const response = await fetch(`https://${SHOP}/admin/api/2024-01/${endpoint}`, {
                method: method,
                headers: headers,
                body: body ? JSON.stringify(body) : null
            });

            // Handle Rate Limiting
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || 2;
                console.log(`⏳ Rate limit hit. Cooling down for ${retryAfter}s...`);
                await sleep(retryAfter * 1000 + 2000); // Wait + 2s buffer
                retries++;
                continue;
            }

            if (!response.ok) {
                console.error(`❌ API Error ${endpoint}: ${response.status} ${response.statusText}`);
                const text = await response.text();
                // console.error(text); // Uncomment to see full error details
                return null;
            }

            return await response.json();

        } catch (err) {
            console.error(`Network Error: ${err.message}`);
            await sleep(5000);
            retries++;
        }
    }
    return null;
};

// --- DATA FETCHING (Instead of Creation) ---

async function getExistingProducts() {
    console.log("Fetching existing products...");
    const data = await apiCall('products.json?limit=250&fields=id,variants', 'GET');
    if (!data || !data.products) return [];
    
    // Flatten to just get a list of all variant IDs
    const variants = data.products.flatMap(p => 
        p.variants.map(v => ({ id: v.id, price: v.price }))
    );
    console.log(`✅ Found ${variants.length} product variants.`);
    return variants;
}

async function getExistingCustomers() {
    console.log("Fetching existing customers...");
    const data = await apiCall('customers.json?limit=250&fields=id', 'GET');
    if (!data || !data.customers) return [];
    
    console.log(`✅ Found ${data.customers.length} customers.`);
    return data.customers;
}



// --- ORDER GENERATION ---

async function createMixedOrders(customers, variants) {
    const totalOrders = 2; // You asked for 150+, since you have 12, adding 140 more
    console.log(`Creating ${totalOrders} Mixed Orders...`);
    
    let successCount = 0;

    for (let i = 0; i < totalOrders; i++) {
        const customer = getRandom(customers);
        
        // Items
        const numItems = Math.floor(Math.random() * 4) + 1;
        const line_items = [];
        for (let j = 0; j < numItems; j++) {
            const variant = getRandom(variants);
            line_items.push({
                variant_id: variant.id,
                quantity: Math.floor(Math.random() * 2) + 1
            });
        }

        // Randomize Date (Last 6 months for good analytics data)
        const daysAgo = Math.floor(Math.random() * 180);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString();

        // MIX STATUS LOGIC
        const rand = Math.random();
        let financial_status = 'paid';
        let fulfillment_status = null; // Default unfulfilled
        let cancelled_at = null;

        if (rand < 0.6) {
            // 60% : Paid & Fulfilled (Completed)
            financial_status = 'paid';
            fulfillment_status = 'fulfilled';
        } else if (rand < 0.8) {
            // 20% : Paid & Unfulfilled (Processing)
            financial_status = 'paid';
            fulfillment_status = null;
        } else if (rand < 0.9) {
            // 10% : Pending (Unpaid / COD)
            financial_status = 'pending';
            fulfillment_status = null;
        } else {
            // 10% : Canceled / Voided
            financial_status = 'voided';
            cancelled_at = dateStr; // Set cancellation date
        }

        const payload = {
            order: {
                customer: { id: customer.id },
                line_items: line_items,
                financial_status: financial_status,
                created_at: dateStr, 
                processed_at: dateStr,
                currency: "USD",
                ...(fulfillment_status && { fulfillment_status }), // Only add if not null
                ...(cancelled_at && { cancelled_at }) // Only add if cancelled
            }
        };

        const data = await apiCall('orders.json', 'POST', payload);
        if (data && data.order) {
            successCount++;
            process.stdout.write(`\r✅ Orders Created: ${successCount}/${totalOrders} `);
        }
        
        // Aggressive sleep to prevent 429
        // Even with retry logic, it's faster to sleep 1s than to hit error, wait 4s, and retry.
        await sleep(1000); 
    }
    console.log("\n🎉 Order Seeding Complete!");
}

async function main() {
    console.log("🚀 Starting Script...");
    
    // 1. Fetch Existing Data
    const variants = await getExistingProducts();
    const customers = await getExistingCustomers();

    if (variants.length === 0 || customers.length === 0) {
        console.error("❌ No products or customers found! Please run the previous script to generate products/customers first.");
        return;
    }

    // 3. Create Orders
    await createMixedOrders(customers, variants);
}

main();