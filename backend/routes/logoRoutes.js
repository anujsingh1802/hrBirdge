const express = require('express');
const { getLogoUrl } = require('../services/logoService');

const router = express.Router();

/**
 * GET /api/logos/:companyName
 * Retrieves a valid logo URL for a given company name.
 * Returns { success: true, logoUrl: 'https://...' }
 */
router.get('/:companyName', async (req, res, next) => {
  try {
    const { companyName } = req.params;
    
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const logoUrl = await getLogoUrl(companyName);
    
    // Using a proper caching header for performance on identical requests
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day in browser
    
    return res.status(200).json({
      success: true,
      logoUrl
    });
  } catch (error) {
    console.error('Error fetching logo:', error);
    // Even if it fails entirely, we should just send a fallback ideally, but getLogoUrl should never throw.
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
