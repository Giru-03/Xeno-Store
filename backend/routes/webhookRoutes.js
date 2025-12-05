const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Handle all webhook paths (e.g., /webhooks/shopify, /webhooks/orders/create)
// Using RegExp to avoid Express 5 string parsing issues with wildcards
router.post(/.*/, webhookController.handleWebhook);

module.exports = router;
