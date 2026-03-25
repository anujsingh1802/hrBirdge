const mongoose = require('mongoose');

const VALID_JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'remote'];

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    job_type: {
      type: String,
      default: '',
      enum: {
        values: [...VALID_JOB_TYPES, ''],
        message: `job_type must be one of: ${VALID_JOB_TYPES.join(', ')}`,
      },
    },
    salary: {
      type: String,
      default: '',
    },
    salary_min: {
      type: Number,
      default: 0,
      min: 0,
    },
    salary_max: {
      type: Number,
      default: 0,
      min: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index(
  { title: 1, company: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);
jobSchema.index({ location: 1 });
jobSchema.index({ job_type: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ salary_min: 1, salary_max: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
