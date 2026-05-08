const jwt = require('jsonwebtoken');
const pool = require('../../config/database.config');
require('dotenv').config();

exports.verifyAdminCredentials = (userId, password) => {
    return userId === process.env.ADMIN_ID && password === process.env.ADMIN_PASS;
};

exports.generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId, role: 'admin' }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

exports.generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId, role: 'admin' }, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Keep for backward compatibility
exports.generateToken = (userId) => {
    return exports.generateAccessToken(userId);
};