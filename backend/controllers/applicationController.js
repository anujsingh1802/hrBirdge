const Application = require('../models/Application');
const Job = require('../models/Job');

/**
 * POST /api/apply
 * Protected — logged-in users only
 * Apply for a job
 */
exports.applyJob = async (req, res, next) => {
  try {
    const { job_id, resume_url, cover_letter } = req.body;
    const user_id = req.user._id;

    // Check job exists and is active
    const job = await Job.findById(job_id);
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: 'Job not found or no longer available' });
    }

    // Check for duplicate application
    const existing = await Application.findOne({ job_id, user_id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job_id,
      user_id,
      resume_url: resume_url || '',
      cover_letter: cover_letter || '',
    });

    const populated = await application.populate([
      { path: 'job_id', select: 'title company location job_type' },
      { path: 'user_id', select: 'name email' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/apply/my
 * Protected — logged-in user
 * Get all applications submitted by the logged-in user
 */
exports.getMyApplications = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const filter = { user_id: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('job_id', 'title company location job_type salary')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Application.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/apply/job/:jobId
 * Protected — admin only
 * Get all applicants for a specific job
 */
exports.getJobApplicants = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.params.jobId && req.params.jobId !== 'all') {
      filter.job_id = req.params.jobId;
    }
    if (req.query.status) filter.status = req.query.status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('user_id', 'name email')
        .populate('job_id', 'title company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Application.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/apply/:id/status
 * Protected — admin only
 * Update the status of an application (pending → reviewed → shortlisted → rejected)
 */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const VALID_STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected'];

    if (!VALID_STATUSES.includes(status)) {
      return res.status(422).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after', runValidators: true }
    ).populate('job_id', 'title company').populate('user_id', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Application status updated to "${status}"`,
      data: application,
    });
  } catch (err) {
    next(err);
  }
};
