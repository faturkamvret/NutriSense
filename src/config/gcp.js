const { Firestore } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');
const serviceAccount = require('./serviceAccount');

// Konfigurasi Firestore
const firestore = new Firestore({
  projectId: serviceAccount.project_id,
  databaseId: '(default)',
});

// Konfigurasi Google Cloud Storage
const storage = new Storage({
  projectId: serviceAccount.project_id,
  credentials: serviceAccount,
});

const bucketName = 'scan';
const bucket = storage.bucket(bucketName);

module.exports = {
  firestore,
  bucket,
};
