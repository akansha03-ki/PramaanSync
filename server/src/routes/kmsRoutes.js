const express = require('express');
const router = express.Router();
const kmsController = require('../controllers/kmsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

router.get('/keys', authMiddleware, kmsController.getKeys);
router.post('/rotate', authMiddleware, rbacMiddleware(['Admin']), kmsController.rotateKey);
router.post('/revoke', authMiddleware, rbacMiddleware(['Admin']), kmsController.revokeKey);

module.exports = router;
