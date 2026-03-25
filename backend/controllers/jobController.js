const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const csv = require('csvtojson');
const Job = require('../models/Job');

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_JOB_TYPES = new Set(['full-time', 'part-time', 'contract', 'internship', 'freelance', 'remote']);
const MAX_ROWS = parseInt(process.env.MAX_ROWS_PER_UPLOAD || '5000', 10);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cleanupFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.error('[upload] temp file cleanup failed:', e.message);
  }
};

const capitalize = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const parseSalary = (salary) => {
  if (!salary) return { text: '', min: 0, max: 0 };
  const raw = salary.toString().trim();
  const clean = raw.toLowerCase();

  const lpaRange = clean.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*lpa/);
  if (lpaRange) {
    return { text: raw, min: Math.round(parseFloat(lpaRange[1]) * 100000), max: Math.round(parseFloat(lpaRange[2]) * 100000) };
  }
  const lpaSingle = clean.match(/(\d+(?:\.\d+)?)\s*lpa/);
  if (lpaSingle) {
    const val = Math.round(parseFloat(lpaSingle[1]) * 100000);
    return { text: raw, min: val, max: val };
  }
  const plainRange = clean.match(/(\d+)\s*-\s*(\d+)/);
  if (plainRange) {
    return { text: raw, min: parseInt(plainRange[1], 10), max: parseInt(plainRange[2], 10) };
  }
  const num = parseInt(clean.replace(/[^\d]/g, ''), 10);
  if (!isNaN(num) && num > 0) return { text: raw, min: num, max: num };
  return { text: raw, min: 0, max: 0 };
};

const parseSkills = (raw) => {
  if (!raw || typeof raw !== 'string') return [];
  return [...new Set(raw.split(',').map((s) => s.trim().toLowerCase()).filter((s) => s.length > 0 && s.length <= 50))].slice(0, 20);
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeRow = (row) => {
  const normalized = {};
  const mapping = {
    title: ['title', 'job title', 'jobtitle', 'position', 'role'],
    company: ['company', 'company name', 'companyname', 'organization', 'employer'],
    location: ['location', 'city', 'job location', 'work location'],
    job_type: ['job_type', 'type', 'job type', 'employment type', 'work type'],
    salary: ['salary', 'pay', 'package', 'compensation', 'ctc'],
    skills: ['skills', 'required skills', 'tags', 'technologies'],
    description: ['description', 'about', 'job description', 'requirements'],
  };

  for (const [key, aliases] of Object.entries(mapping)) {
    // Find a key in the row that matches any of the aliases
    const foundKey = Object.keys(row).find((k) => {
      const lowK = k.toString().toLowerCase().trim();
      return aliases.includes(lowK);
    });
    if (foundKey !== undefined) {
      normalized[key] = row[foundKey];
    }
  }
  return normalized;
};

const parseRow = (row, rowIndex) => {
  if (!row.title || typeof row.title !== 'string' || !row.title.trim())
    return { error: { row: rowIndex, field: 'title', message: 'Missing or empty title' } };
  if (!row.company || typeof row.company !== 'string' || !row.company.trim())
    return { error: { row: rowIndex, field: 'company', message: 'Missing or empty company' } };

  const title = row.title.trim().slice(0, 200);
  const company = capitalize(row.company).slice(0, 200);
  if (title.length < 2)
    return { error: { row: rowIndex, field: 'title', message: 'Title too short' } };

  let job_type = row.job_type ? row.job_type.toString().toLowerCase().trim() : '';
  if (job_type && !VALID_JOB_TYPES.has(job_type)) job_type = '';

  const salaryObj = parseSalary(row.salary);

  return {
    job: {
      title,
      company,
      location: row.location ? capitalize(row.location).slice(0, 200) : '',
      job_type,
      salary: salaryObj.text,
      salary_min: salaryObj.min,
      salary_max: salaryObj.max,
      skills: parseSkills(row.skills),
      description: row.description ? row.description.toString().trim().slice(0, 5000) : '',
    },
  };
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/jobs
 * Protected — admin only
 * Create a single job posting
 */
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    return res.status(201).json({ success: true, message: 'Job created successfully', data: job });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs
 * Public — fetch all jobs with search, filter, sort, pagination
 *
 * Query params:
 *   search    — full-text search (title, description)
 *   location  — case-insensitive partial match
 *   job_type  — exact match
 *   skills    — comma-separated list (AND match)
 *   salary_min, salary_max — numeric range
 *   page      — default 1
 *   limit     — default 10, max 50
 *   sort      — newest | oldest | salary_asc | salary_desc (default: newest)
 */
exports.getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      job_type,
      skills,
      salary_min,
      salary_max,
      page = 1,
      limit = 10,
      sort = 'newest',
    } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$text = { $search: search.toString().trim() };
    }
    if (location) {
      filter.location = { $regex: escapeRegex(location.toString().trim()), $options: 'i' };
    }
    if (job_type) {
      filter.job_type = job_type.toString().toLowerCase().trim();
    }
    if (skills) {
      const skillList = skills.toString().split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (skillList.length) filter.skills = { $all: skillList };
    }
    const parsedSalaryMin = Number.parseInt(salary_min, 10);
    const parsedSalaryMax = Number.parseInt(salary_max, 10);

    if (Number.isFinite(parsedSalaryMin)) {
      filter.salary_min = { ...(filter.salary_min || {}), $gte: parsedSalaryMin };
    }

    if (Number.isFinite(parsedSalaryMax)) {
      filter.salary_max = { ...(filter.salary_max || {}), $lte: parsedSalaryMax };
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      salary_asc: { salary_min: 1 },
      salary_desc: { salary_min: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort(sortQuery).skip(skip).limit(limitNum).select('-__v'),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/jobs/:id
 * Public — get a single job by ID
 */
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).select('-__v');
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/jobs/:id
 * Protected — admin only
 * Update a job posting
 */
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { returnDocument: 'after', runValidators: true }
    ).select('-__v');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, message: 'Job updated successfully', data: job });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, message: 'Job updated successfully', data: job });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/jobs/:id
 * Protected — admin only
 * Soft-delete: sets isActive = false
 */
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: 'after' }
    );
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, message: 'Job archived successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/jobs/:id/hard
 * Protected — admin only
 * Hard-delete: removes document from DB
 */
exports.hardDeleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, message: 'Job permanently deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/jobs/upload
 * Protected — admin only
 * Bulk upload jobs from Excel (.xlsx/.xls) or CSV
 */
exports.uploadFile = async (req, res, next) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();

    // ── Parse file ──────────────────────────────────────────────────────────
    let rawData = [];
    try {
      if (ext === '.xlsx' || ext === '.xls') {
        const workbook = XLSX.readFile(filePath, { sheetStubs: false, defval: '' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          cleanupFile(filePath);
          return res.status(400).json({ success: false, message: 'Excel file has no sheets' });
        }
        rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '', raw: false });
      } else {
        rawData = await csv({ noheader: false, trim: true }).fromFile(filePath);
      }
    } catch (parseErr) {
      cleanupFile(filePath);
      return res.status(400).json({ success: false, message: `Could not parse file: ${parseErr.message}` });
    }

    if (!rawData.length) {
      cleanupFile(filePath);
      return res.status(400).json({ success: false, message: 'File is empty or contains no data rows' });
    }

    if (rawData.length > MAX_ROWS) {
      cleanupFile(filePath);
      return res.status(400).json({
        success: false,
        message: `File exceeds the ${MAX_ROWS} row limit. Found ${rawData.length} rows.`,
      });
    }

    // ── Validate & transform rows ────────────────────────────────────────────
    const validJobs = [];
    const errors = [];
    const seenInFile = new Set();

    for (let i = 0; i < rawData.length; i++) {
      const rowNum = i + 2;
      const rawRow = rawData[i];

      const hasValue = Object.values(rawRow).some((v) => v !== '' && v != null);
      if (!hasValue) continue;

      const row = normalizeRow(rawRow);
      const { job, error } = parseRow(row, rowNum);
      if (error) {
        errors.push(error);
        continue;
      }

      const dedupKey = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
      if (seenInFile.has(dedupKey)) {
        errors.push({ row: rowNum, field: 'title+company', message: 'Duplicate row in file' });
        continue;
      }
      seenInFile.add(dedupKey);
      validJobs.push({ ...job, postedBy: req.user._id });
    }

    if (!validJobs.length) {
      cleanupFile(filePath);
      return res.status(400).json({ success: false, message: 'No valid rows found in file', errors });
    }

    // ── Bulk insert ──────────────────────────────────────────────────────────
    let insertResult;
    try {
      insertResult = await Job.insertMany(validJobs, { ordered: false });
    } catch (bulkErr) {
      if (bulkErr.name === 'MongoBulkWriteError' || bulkErr.code === 11000) {
        const nInserted = bulkErr.result?.insertedCount ?? 0;
        const dbErrors = (bulkErr.writeErrors || []).map((we) => ({
          row: null,
          field: 'title+company',
          message: `DB duplicate skipped`,
        }));
        cleanupFile(filePath);
        return res.status(207).json({
          success: true,
          message: `Partial insert: ${nInserted} of ${validJobs.length} jobs saved (duplicates skipped)`,
          total_inserted: nInserted,
          skipped: validJobs.length - nInserted,
          errors: [...errors, ...dbErrors],
        });
      }
      throw bulkErr;
    }

    cleanupFile(filePath);

    return res.status(200).json({
      success: true,
      message: 'Bulk upload successful',
      total_inserted: insertResult.length,
      skipped: rawData.length - insertResult.length,
      errors,
    });
  } catch (err) {
    cleanupFile(filePath);
    next(err);
  }
};
