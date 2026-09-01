import { openDB } from 'idb';

const DB_NAME = 'CrisisMeshDB';
const DB_VERSION = 1;
const STORE_NAME = 'pendingReports';

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'offlineId', autoIncrement: true });
      }
    },
  });
};

export const saveReportOffline = async (reportData, files = []) => {
  const db = await initDB();
  // Convert files (Blobs) to store them in IndexedDB
  const storedFiles = files.map(file => ({
    blob: file.blob,
    name: file.name,
    type: file.type
  }));

  return db.add(STORE_NAME, {
    reportData: {
      ...reportData,
      source: 'offline_sync',
    },
    files: storedFiles,
    timestamp: Date.now(),
  });
};

export const getPendingReports = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const deleteReport = async (offlineId) => {
  const db = await initDB();
  return db.delete(STORE_NAME, offlineId);
};

export const getPendingCount = async () => {
  const db = await initDB();
  return db.count(STORE_NAME);
};
