const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Handle all webhook paths (e.g., /webhooks/shopify, /webhooks/orders/create)
router.post('*', webhookController.handleWebhook);

module.exports = router;
