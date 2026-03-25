const mongoose = require('mongoose');

const APPLICATION_STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected'];

const applicationSchema = new mongoose.Schema(
  {
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    resume_url: {
      type: String,
      default: '',
      trim: true,
    },
    cover_letter: {
      type: String,
      default: '',
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'pending',
    },
  },
  { timestamps: true }
);

applicationSchema.index({ user_id: 1, job_id: 1 }, { unique: true });
applicationSchema.index({ job_id: 1 });
applicationSchema.index({ user_id: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
