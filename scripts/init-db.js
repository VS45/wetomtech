require('dotenv').config();

const { initialiseDatabase, closeDatabase } = require('../config/database');
const Lead = require('../models/Lead');

async function initialise() {
  process.env.DB_ENABLED = 'true';

  const connected = await initialiseDatabase();
  if (!connected) {
    throw new Error('Could not connect to MongoDB. Check MONGODB_URI in your .env file.');
  }

  await Lead.createIndexes();
  console.log('MongoDB is ready and the leads collection indexes have been created.');
  await closeDatabase();
}

initialise().catch(async (error) => {
  console.error(error.message);
  await closeDatabase().catch(() => {});
  process.exit(1);
});
