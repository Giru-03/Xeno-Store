const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/sync', authenticateToken, syncController.triggerSync);

module.exports = router;
