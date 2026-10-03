const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

router.get('/', authMiddleware, locationController.getAllLocations);
router.get('/sync-view', authMiddleware, locationController.getSyncViewData);
router.get('/:id', authMiddleware, locationController.getLocationById);
router.post('/', authMiddleware, rbacMiddleware(['Admin', 'Inspector']), locationController.createLocation);

module.exports = router;
