const express = require('express');
const router = express.Router();
const oemController = require('../controllers/oemController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/detect', authMiddleware, oemController.detectVendor);
router.get('/test-suite', authMiddleware, oemController.runTestSuite);
router.get('/drives', authMiddleware, oemController.getForensicDrives);
router.post('/drives/acquire', authMiddleware, oemController.acquireDrive);

module.exports = router;
