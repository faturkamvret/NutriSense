const dotenv = require('dotenv');

dotenv.config();
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

module.exports = serviceAccount;
