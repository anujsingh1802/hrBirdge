const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

app.use((req, res, next) => {
  const normalizedUrl = req.url.replace(/%(?:0A|0D)|[\r\n]+/gi, '').trimEnd();

  if (normalizedUrl && normalizedUrl !== req.url) {
    req.url = normalizedUrl;
  }

  next();
});

app.use(helmet());

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .concat(['http://127.0.0.1:3000', 'http://localhost:3000']);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      
      // Check if origin is explicitly allowed OR is a Vercel deployment
      if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      return callback(new Error(`CORS: origin "${origin}" not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);


const cookieParser = require('cookie-parser');

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key]) => !key.startsWith('$'))
      .map(([key, value]) => [key, sanitizeObject(value)])
  );
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
});

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});

app.use(globalLimiter);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the HYREIN API',
    docs: 'Append /api/jobs or /api/companies to explore'
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HYREIN API Gateway is Active',
    version: '1.0.0'
  });
});

app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/apply', require('./routes/applicationRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.use(notFound);

// Custom Error Handler to hide stack in production
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});


module.exports = app;
