const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./serviceAccount');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});

module.exports = firebaseAdmin;
