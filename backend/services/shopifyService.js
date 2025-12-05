const axios = require('axios');

const fetchShopifyData = async (domain, token, endpoint, params = {}) => {
    try {
        const response = await axios.get(`https://${domain}/admin/api/2023-10/${endpoint}.json`, {
            headers: { 'X-Shopify-Access-Token': token },
            params
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${endpoint} from Shopify:`, error.message);
        throw error;
    }
};

module.exports = { fetchShopifyData };
