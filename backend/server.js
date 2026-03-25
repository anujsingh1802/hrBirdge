require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log('-----------------------------------------');
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment  : ${NODE_ENV}`);
      console.log(`Health check : http://localhost:${PORT}/health`);
      console.log('-----------------------------------------');
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  const closeServer = new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }

    server.close(() => {
      console.log('HTTP server closed');
      resolve();
    });
  });

  const closeDb = mongoose.connection.readyState
    ? mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed');
      })
    : Promise.resolve();

  Promise.allSettled([closeServer, closeDb]).then(() => {
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  shutdown('uncaughtException');
});
