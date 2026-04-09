const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
  leftBannerImage: {
    type: String,
    default: '',
  },
  leftBannerUrl: {
    type: String,
    default: '',
  },
  rightBannerImage: {
    type: String,
    default: '',
  },
  rightBannerUrl: {
    type: String,
    default: '',
  },
  isBannerEnabled: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
