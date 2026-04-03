const passport = require('passport');
const { isGoogleOAuthConfigured } = require('./auth.google.strategy');

const CLIENT_URL = (process.env.CLIENT_URL || 'https://hyrein.in').replace(/\/+$/, '');

// The frontend consumes this token from the query string and turns it into a normal app session.
const buildRedirectUrl = (token) => {
  return `${CLIENT_URL}/?token=${token}`;
};

const ensureGoogleOAuthConfigured = (next) => {
  if (isGoogleOAuthConfigured()) return false;

  const error = new Error('Google OAuth is not configured on the server');
  error.statusCode = 500;
  next(error);
  return true;
};

const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

const startGoogleAuth = (req, res, next) => {
  if (ensureGoogleOAuthConfigured(next)) return;
  return googleAuth(req, res, next);
};

const googleCallback = (req, res, next) => {
  if (ensureGoogleOAuthConfigured(next)) return;

  passport.authenticate('google', { session: false }, (err, authResult) => {
    if (err) {
      return next(err);
    }

    if (!authResult?.token) {
      const error = new Error('Google authentication failed');
      error.statusCode = 401;
      return next(error);
    }

    return res.redirect(buildRedirectUrl(authResult.token));
  })(req, res, next);
};

const googleFailure = (req, res, next) => {
  const error = new Error('Google authentication failed');
  error.statusCode = 401;
  next(error);
};

module.exports = {
  googleAuth: startGoogleAuth,
  googleCallback,
  googleFailure,
};
