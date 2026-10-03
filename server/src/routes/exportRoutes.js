const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authMiddleware } = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

// Only Admin can generate secure export packages
router.post('/generate', authMiddleware, rbacMiddleware(['Admin']), exportController.generateExportPackage);
router.get('/logs', authMiddleware, rbacMiddleware(['Admin', 'Inspector']), exportController.getExportLogs);

module.exports = router;
