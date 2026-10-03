const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidenceController');
const { authMiddleware } = require('../middleware/authMiddleware');
const rbacMiddleware = require('../middleware/rbacMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', authMiddleware, evidenceController.getAllEvidence);
router.get('/:id', authMiddleware, evidenceController.getEvidenceById);
router.post('/', authMiddleware, rbacMiddleware(['Admin', 'Inspector', 'Investigator']), upload.single('file'), evidenceController.uploadEvidence);
router.delete('/:id', authMiddleware, rbacMiddleware(['Admin', 'Inspector']), evidenceController.deleteEvidence);
router.get('/:id/timeline', authMiddleware, evidenceController.getTimeline);
router.post('/integrity/verify/:id', authMiddleware, evidenceController.verifyIntegrity);
router.post('/recovery/:id', authMiddleware, rbacMiddleware(['Admin', 'Inspector', 'Investigator']), evidenceController.recoverFootage);

module.exports = router;
