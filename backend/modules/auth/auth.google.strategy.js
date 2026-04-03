const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const { buildGoogleAuthResponse } = require('./auth.service');

let strategyRegistered = false;

const getMissingGoogleOAuthEnv = () => {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  return required.filter((key) => !process.env[key]);
};

const initializeGoogleStrategy = () => {
  if (strategyRegistered) return passport;
  if (getMissingGoogleOAuthEnv().length > 0) return passport;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://hyrein.in/auth/google/callback',
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
