const SiteConfig = require('../models/SiteConfig');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      // Create default if not exists
      config = await SiteConfig.create({});
    }
    res.status(200).json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig({});
    }

    const {
      leftBannerImage,
      leftBannerUrl,
      rightBannerImage,
      rightBannerUrl,
      isBannerEnabled
    } = req.body;

    if (leftBannerImage !== undefined) config.leftBannerImage = leftBannerImage;
    if (leftBannerUrl !== undefined) config.leftBannerUrl = leftBannerUrl;
    if (rightBannerImage !== undefined) config.rightBannerImage = rightBannerImage;
    if (rightBannerUrl !== undefined) config.rightBannerUrl = rightBannerUrl;
    if (isBannerEnabled !== undefined) config.isBannerEnabled = isBannerEnabled;

    await config.save();

    res.status(200).json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
