const express = require('express');

const {
  googleAuth,
  googleCallback,
  googleFailure,
} = require('./auth.controller');

const router = express.Router();

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/google/failure', googleFailure);

module.exports = router;
