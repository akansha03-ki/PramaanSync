const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');
const { authMiddleware } = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');

router.get('/', authMiddleware, cameraController.getAllCameras);
router.get('/:id', authMiddleware, cameraController.getCameraById);
router.post('/', authMiddleware, rbacMiddleware(['Admin', 'Inspector']), cameraController.registerCamera);
router.post('/ingest', authMiddleware, cameraController.ingestNvrStream);

module.exports = router;
