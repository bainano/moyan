const path = require('path');
const fs = require('fs').promises;
const fileService = require('./fileService');

const DELETED_RECORDS_FILE = 'deleted-records.json';

async function getDeletedRecordsPath(dataDir) {
  return path.join(dataDir, DELETED_RECORDS_FILE);
}

async function getDeletedRecords(dataDir) {
  try {
    const filePath = await getDeletedRecordsPath(dataDir);
    const data = await fileService.readJsonFile(filePath);
    return data || { posts: [], images: [] };
  } catch (error) {
    return { posts: [], images: [] };
  }
}

async function saveDeletedRecords(dataDir, records) {
  const filePath = await getDeletedRecordsPath(dataDir);
  await fileService.writeJsonFile(filePath, records);
}

async function recordDeletedPost(dataDir, postId) {
  const records = await getDeletedRecords(dataDir);
  if (!records.posts.includes(postId)) {
    records.posts.push(postId);
    await saveDeletedRecords(dataDir, records);
  }
}

async function recordDeletedImage(dataDir, filename) {
  const records = await getDeletedRecords(dataDir);
  if (!records.images.includes(filename)) {
    records.images.push(filename);
    await saveDeletedRecords(dataDir, records);
  }
}

async function clearDeletedRecords(dataDir) {
  await saveDeletedRecords(dataDir, { posts: [], images: [] });
}

module.exports = {
  getDeletedRecords,
  recordDeletedPost,
  recordDeletedImage,
  clearDeletedRecords,
};
