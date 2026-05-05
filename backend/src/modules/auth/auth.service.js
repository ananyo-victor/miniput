const jwt = require('jsonwebtoken');
const pool = require('../../config/database.config');
require('dotenv').config();

exports.verifyAdminCredentials = (userId, password) => {
    return userId === process.env.ADMIN_ID && password === process.env.ADMIN_PASS;
};

exports.generateToken = (userId) => {
    return jwt.sign(
        { id: userId, role: 'admin' }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};