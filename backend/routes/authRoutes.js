const express = require('express');
const router = express.Router();

const { register, login, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, registerSchema, loginSchema, updateMeSchema } = require('../middleware/validate');

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me  — protected
router.get('/me', protect, getMe);

const { resumeUpload } = require('../middleware/upload');

// PATCH /api/auth/me — protected
router.patch('/me', protect, validate(updateMeSchema), updateMe);

// POST /api/auth/resume — protected
router.post('/resume', protect, resumeUpload.single('file'), require('../controllers/authController').uploadResume);

module.exports = router;
