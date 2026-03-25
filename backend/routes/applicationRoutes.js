const express = require('express');
const router = express.Router();

const {
  applyJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
} = require('../controllers/applicationController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validate, applyJobSchema, applicationStatusSchema } = require('../middleware/validate');

// ─── User routes (any logged-in user) ─────────────────────────────────────────

// POST /api/apply            — submit a job application
router.post('/', protect, validate(applyJobSchema), applyJob);

// GET  /api/apply/my         — get my own applications
router.get('/my', protect, getMyApplications);

// ─── Admin routes ─────────────────────────────────────────────────────────────

// GET  /api/apply/job/:jobId — get all applicants for a specific job
router.get('/job/:jobId', protect, adminOnly, getJobApplicants);

// PATCH /api/apply/:id/status — update application status
router.patch('/:id/status', protect, adminOnly, validate(applicationStatusSchema), updateApplicationStatus);

module.exports = router;
