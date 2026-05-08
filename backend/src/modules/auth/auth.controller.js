const express = require('express');
const authService = require('./auth.service');

const router = express.Router();

const adminLogin = (req, res) => {
    try {
        const { userId, password } = req.body;
        const isValid = authService.verifyAdminCredentials(userId, password);

        if (isValid) {
            const accessToken = authService.generateAccessToken(userId);
            const refreshToken = authService.generateRefreshToken(userId);
            
            return res.json({ 
                success: true, 
                message: 'Admin authenticated',
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        }

        res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
};

const refreshAdminToken = (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token required' });
        }

        const decoded = authService.verifyRefreshToken(refreshToken);
        
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
        }

        const newAccessToken = authService.generateAccessToken(decoded.id);
        const newRefreshToken = authService.generateRefreshToken(decoded.id);
        
        return res.json({ 
            success: true, 
            message: 'Token refreshed',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Token refresh failed', error: error.message });
    }
};

router.post('/admin/login', adminLogin);
router.post('/admin/refresh', refreshAdminToken);

module.exports = router;