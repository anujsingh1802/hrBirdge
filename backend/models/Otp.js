const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-remove OTP once expiry time is reached
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
