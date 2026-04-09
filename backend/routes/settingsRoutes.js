const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route to get settings (e.g., banners)
router.get('/', getSettings);

// Admin only route to update settings
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;
