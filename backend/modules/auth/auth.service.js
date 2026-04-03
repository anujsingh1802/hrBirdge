const User = require('../../models/User');
const generateToken = require('../../utils/generateToken');

const GOOGLE_ROLE = 'candidate';

// Keep the frontend payload aligned with the existing email/password login response.
const buildSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  bio: user.bio,
  skills: user.skills,
  resumeUrl: user.resumeUrl,
  location: user.location,
  createdAt: user.createdAt,
  profilePicture: user.profilePicture,
});

const normalizeProfile = (profile) => {
  const email = profile.emails?.[0]?.value?.trim().toLowerCase();
  const name = profile.displayName?.trim();
  const googleId = profile.id?.trim();
  const profilePicture = profile.photos?.[0]?.value?.trim() || '';

  if (!email || !name || !googleId) {
    const error = new Error('Google account is missing required profile data');
    error.statusCode = 400;
    throw error;
  }

  return { email, name, googleId, profilePicture };
};

const findOrCreateGoogleUser = async (profile) => {
  const normalizedProfile = normalizeProfile(profile);
  const { email, name, googleId, profilePicture } = normalizedProfile;

  let user = await User.findOne({ email });

  if (!user) {
    // New Google accounts enter the platform as candidate users by default.
    user = await User.create({
      name,
      email,
      googleId,
      profilePicture,
      role: GOOGLE_ROLE,
      isVerified: true,
    });
  } else {
    // Existing email accounts can be upgraded to support Google sign-in without changing their role.
    const updates = {};

    if (!user.googleId) updates.googleId = googleId;
    if (!user.profilePicture && profilePicture) updates.profilePicture = profilePicture;
    if (!user.isVerified) updates.isVerified = true;

    if (Object.keys(updates).length > 0) {
      user = await User.findByIdAndUpdate(user._id, updates, { new: true, runValidators: true });
    }
  }

  if (!user || !user.isActive) {
    const error = new Error('Your account is unavailable');
    error.statusCode = 401;
    throw error;
  }

  return user;
};

const buildGoogleAuthResponse = async (profile) => {
  const user = await findOrCreateGoogleUser(profile);
  const token = generateToken(user._id, user.role);

  return {
    token,
    user: buildSafeUser(user),
  };
};

module.exports = {
  buildGoogleAuthResponse,
  buildSafeUser,
  findOrCreateGoogleUser,
};
