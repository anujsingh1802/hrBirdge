const express = require('express');
const router = express.Router();

const { register, login, getMe, updateMe, sendOtp, verifyOtp, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, registerSchema, loginSchema, updateMeSchema } = require('../middleware/validate');

// Legacy Registration & Login
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// OTP Endpoints (deprecated)
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is available. Use POST /api/auth/login or /api/auth/register.',
  });
});

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// GET /api/auth/me  — protected
router.get('/me', protect, getMe);

const { resumeUpload } = require('../middleware/upload');

// PATCH /api/auth/me — protected
router.patch('/me', protect, validate(updateMeSchema), updateMe);

// POST /api/auth/resume — protected
router.post('/resume', protect, resumeUpload.single('file'), require('../controllers/authController').uploadResume);

module.exports = router;
