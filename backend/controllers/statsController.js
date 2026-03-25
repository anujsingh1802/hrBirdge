const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

/**
 * GET /api/stats/admin
 * Protected — admin only
 * Returns high-level recruitment statistics
 */
exports.getAdminStats = async (req, res, next) => {
  try {
    const [jobs, applications] = await Promise.all([
      Job.aggregate([
        {
          $group: {
            _id: null,
            totalJobs: { $sum: 1 },
            activeJobs: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } }
          }
        }
      ]),
      Application.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const jobStats = jobs[0] || { totalJobs: 0, activeJobs: 0 };
    const appStats = {
      total: 0,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0
    };

    applications.forEach(stat => {
      appStats.total += stat.count;
      if (appStats.hasOwnProperty(stat._id)) {
        appStats[stat._id] = stat.count;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        jobs: jobStats,
        applications: appStats
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/stats/candidate
 * Protected — user only
 * Returns statistics for the logged-in candidate
 */
exports.getCandidateStats = async (req, res, next) => {
  try {
    const applications = await Application.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0
    };

    applications.forEach(stat => {
      stats.total += stat.count;
      if (stats.hasOwnProperty(stat._id)) {
        stats[stat._id] = stat.count;
      }
    });

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};
