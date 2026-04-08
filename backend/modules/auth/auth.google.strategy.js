const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const { buildGoogleAuthResponse } = require('./auth.service');

let strategyRegistered = false;

const sanitizeEnvValue = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/^['"]|['"]$/g, '').replace(/\\n/g, '');
};

const getGoogleClientId = () => sanitizeEnvValue(process.env.GOOGLE_CLIENT_ID);
const getGoogleClientSecret = () => sanitizeEnvValue(process.env.GOOGLE_CLIENT_SECRET);
// Google OAuth requires an EXACT match for the redirect URI.
// A common cause of 'redirect_uri_mismatch' is a mismatch between 'http' vs 'https',
// 'www' vs 'non-www', or 'localhost' vs '127.0.0.1'.
// The callback URL configured in the Google Cloud Console MUST match this value exactly.
// For production, set GOOGLE_CALLBACK_URL=https://www.hyrein.in/auth/google/callback.
// In local development, use http://localhost:5000/auth/google/callback.
const getGoogleCallbackUrl = (req) => {
  const envCallbackUrl = sanitizeEnvValue(process.env.GOOGLE_CALLBACK_URL);
  const isLocalRequest = req && req.get && /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(req.get('host'));

  if (process.env.NODE_ENV === 'production' && envCallbackUrl) {
    return envCallbackUrl;
  }

  if (isLocalRequest && req && req.protocol && typeof req.get === 'function') {
    return `${req.protocol}://${req.get('host')}/auth/google/callback`;
  }

  if (envCallbackUrl) {
    return envCallbackUrl;
  }

  return 'http://localhost:5000/auth/google/callback';
};

const getMissingGoogleOAuthEnv = () => {
  const envMap = {
    GOOGLE_CLIENT_ID: getGoogleClientId(),
    GOOGLE_CLIENT_SECRET: getGoogleClientSecret(),
  };

  return Object.entries(envMap)
    .filter(([, value]) => !value)
    .map(([key]) => key);
};

const initializeGoogleStrategy = () => {
  if (strategyRegistered) return passport;

  const missing = getMissingGoogleOAuthEnv();
  if (missing.length > 0) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[AUTH] Google OAuth not configured. Missing: ${missing.join(', ')}`);
    }
    return passport;
  }

  const callbackURL = getGoogleCallbackUrl();

  if (process.env.NODE_ENV !== 'test') {
    // Validation log to help debug redirect_uri_mismatch issues
    console.log("Google Callback URL:", callbackURL);
    console.info(`[AUTH] Google OAuth client ID suffix: ${getGoogleClientId().slice(-12)}`);
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: getGoogleClientId(),
        clientSecret: getGoogleClientSecret(),
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const authResult = await buildGoogleAuthResponse(profile);
          return done(null, authResult);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  strategyRegistered = true;
  return passport;
};

const isGoogleOAuthConfigured = () => getMissingGoogleOAuthEnv().length === 0;

module.exports = initializeGoogleStrategy;
module.exports.isGoogleOAuthConfigured = isGoogleOAuthConfigured;
module.exports.getMissingGoogleOAuthEnv = getMissingGoogleOAuthEnv;
module.exports.getGoogleCallbackUrl = getGoogleCallbackUrl;
