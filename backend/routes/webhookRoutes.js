const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Handle all webhook paths (e.g., /webhooks/shopify, /webhooks/orders/create)
// Note: Express 5 requires (.*) instead of * for wildcards
router.post('(.*)', webhookController.handleWebhook);

module.exports = router;
