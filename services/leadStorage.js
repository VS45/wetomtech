const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { isDatabaseReady } = require('../config/database');

const STORAGE_DIR = path.join(__dirname, '..', 'storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'submissions.json');
let jsonWriteQueue = Promise.resolve();

async function readJsonRecords() {
  try {
    const existing = await fs.readFile(STORAGE_FILE, 'utf8');
    const parsed = JSON.parse(existing || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function saveToJson(payload) {
  jsonWriteQueue = jsonWriteQueue.then(async () => {
    await fs.mkdir(STORAGE_DIR, { recursive: true });

    const records = await readJsonRecords();
    const record = {
      id: crypto.randomUUID(),
      ...payload,
      storage: 'json-fallback',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    records.push(record);

    const temporaryFile = `${STORAGE_FILE}.tmp`;
    await fs.writeFile(temporaryFile, JSON.stringify(records, null, 2), 'utf8');
    await fs.rename(temporaryFile, STORAGE_FILE);

    return record;
  });

  return jsonWriteQueue;
}

async function saveLead(payload) {
  if (isDatabaseReady()) {
    try {
      const Lead = require('../models/Lead');
      return await Lead.create(payload);
    } catch (error) {
      console.warn('MongoDB lead write failed. Saving to JSON fallback:', error.message);
    }
  }

  return saveToJson(payload);
}

module.exports = { saveLead, saveToJson };
