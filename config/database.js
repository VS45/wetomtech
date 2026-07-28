const mongoose = require('mongoose');

let databaseReady = false;
let listenersRegistered = false;

function getMongoUri() {
  return process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wetomtech';
}

function registerConnectionListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    databaseReady = true;
  });

  mongoose.connection.on('disconnected', () => {
    databaseReady = false;
    console.warn('MongoDB disconnected. New submissions will use JSON fallback storage.');
  });

  mongoose.connection.on('error', (error) => {
    databaseReady = false;
    console.warn('MongoDB connection error:', error.message);
  });
}

async function initialiseDatabase() {
  if (process.env.DB_ENABLED !== 'true') {
    console.log('MongoDB disabled. Lead submissions will be saved to storage/submissions.json.');
    return false;
  }

  registerConnectionListeners();

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(getMongoUri(), {
      serverSelectionTimeoutMS:
        Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
      maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE) || 10,
      minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE) || 0,
      autoIndex: process.env.NODE_ENV !== 'production'
    });

    const Lead = require('../models/Lead');
    await Lead.init();

    databaseReady = true;
    console.log(`MongoDB connection established: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    databaseReady = false;
    console.warn('MongoDB unavailable. Falling back to JSON lead storage:', error.message);
    return false;
  }
}

function isDatabaseReady() {
  return databaseReady && mongoose.connection.readyState === 1;
}

async function closeDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  databaseReady = false;
}

module.exports = {
  initialiseDatabase,
  isDatabaseReady,
  closeDatabase,
  getMongoUri
};
