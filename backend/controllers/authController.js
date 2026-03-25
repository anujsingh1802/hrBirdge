const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * POST /api/auth/register
 * Public — create a new user account
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email: normalizedEmail, password, role: 'user' });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Public — authenticate and receive a token
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Protected — return the currently logged-in user's profile
 */
exports.getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      bio: req.user.bio,
      skills: req.user.skills,
      resumeUrl: req.user.resumeUrl,
      location: req.user.location,
      createdAt: req.user.createdAt,
    },
  });
};

/**
 * PATCH /api/auth/me
 * Protected — update the currently logged-in user's profile
 */
exports.updateMe = async (req, res, next) => {
  try {
    const { name, bio, skills, resumeUrl, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, skills, resumeUrl, location },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        resumeUrl: user.resumeUrl,
        location: user.location,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};


/**
 * POST /api/auth/resume
 * Protected — upload a resume and update the currently logged-in user's profile
 */
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const protocol = req.protocol === 'http' ? 'http' : 'https';
    const baseUrl = process.env.VITE_API_BASE_URL ? process.env.VITE_API_BASE_URL.replace('/api', '') : `${protocol}://${req.get('host')}`;
    const resumeUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeUrl },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        resumeUrl: user.resumeUrl,
        location: user.location,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
