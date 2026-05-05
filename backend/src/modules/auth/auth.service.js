const pool = require('../../config/database.config');
require('dotenv').config();

exports.verifyAdminCredentials = (userId, password) => {
    return userId === process.env.ADMIN_ID && password === process.env.ADMIN_PASS;
};