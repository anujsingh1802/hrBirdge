const Joi = require('joi');

/**
 * Returns an Express middleware that validates req.body against the given Joi schema.
 * On failure, responds 422 with a clear list of validation errors.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    const errors = error.details.map((d) => d.message.replace(/['"]/g, ''));
    return res.status(422).json({ success: false, message: 'Validation failed', errors });
  }

  req.body = value;
  next();
};

// ─── Schemas ──────────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const createJobSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  company: Joi.string().min(1).max(200).required(),
  location: Joi.string().max(200).allow('').default(''),
  job_type: Joi.string()
    .valid('full-time', 'part-time', 'contract', 'internship', 'freelance', 'remote', '')
    .default(''),
  salary: Joi.string().max(100).allow('').default(''),
  salary_min: Joi.number().min(0).default(0),
  salary_max: Joi.number().min(0).default(0),
  skills: Joi.array().items(Joi.string().max(50)).max(20).default([]),
  description: Joi.string().max(5000).allow('').default(''),
});

const applyJobSchema = Joi.object({
  job_id: Joi.string().hex().length(24).required(),
  resume_url: Joi.string().uri().allow('').default(''),
  cover_letter: Joi.string().max(2000).allow('').default(''),
});

const applicationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'reviewed', 'shortlisted', 'rejected').required(),
});

const updateMeSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  bio: Joi.string().max(500).allow(''),
  skills: Joi.array().items(Joi.string().max(50)).max(20),
  resumeUrl: Joi.string().uri().allow(''),
  location: Joi.string().max(200).allow(''),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createJobSchema,
  applyJobSchema,
  applicationStatusSchema,
  updateMeSchema,
};
