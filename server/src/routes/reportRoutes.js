const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/:caseId', authMiddleware, reportController.getCaseReport);

module.exports = router;
