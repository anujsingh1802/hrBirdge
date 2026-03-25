const express = require('express');

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  hardDeleteJob,
  uploadFile,
} = require('../controllers/jobController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validate, createJobSchema } = require('../middleware/validate');
const { jobsUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/', getJobs);
router.post('/upload', protect, adminOnly, jobsUpload.single('file'), uploadFile);
router.get('/:id', getJobById);

router.post('/', protect, adminOnly, validate(createJobSchema), createJob);
router.put('/:id', protect, adminOnly, validate(createJobSchema), updateJob);
router.delete('/:id', protect, adminOnly, deleteJob);
router.delete('/:id/hard', protect, adminOnly, hardDeleteJob);

module.exports = router;
