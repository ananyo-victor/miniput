const express = require('express');
const authService = require('./auth.service');

const router = express.Router();

const adminLogin = (req, res) => {
    try {
        const { userId, password } = req.body;
        const isValid = authService.verifyAdminCredentials(userId, password);

        if (isValid) {
            const token = authService.generateToken(userId);
            
            return res.json({ 
                success: true, 
                message: 'Admin authenticated',
                token: token
            });
        }

        res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
};

router.post('/admin/login', adminLogin);

module.exports = router;