const express = require('express');
const router = express.Router();
const { getAdminStats, getCandidateStats } = require('../controllers/statsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/admin', protect, adminOnly, getAdminStats);
router.get('/candidate', protect, getCandidateStats);

module.exports = router;
