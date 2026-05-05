const express = require('express');
const ordersService = require('./orders.service');
const { authGuard } = require('../../common/middlewares/auth.guard');

const router = express.Router();

const createOrder = async (req, res) => {
    try {
        const newOrder = await ordersService.createOrder(req.body);
        
        const io = req.app.get('io');
        if (io) {
            io.emit('new-order-received', newOrder);
        }

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const approveOrder = async (req, res) => {
    try {
        const result = await ordersService.approveOrder(req.params.id);
        res.json(result);
    } catch (error) {
        const status = error.message.includes('already processed') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
};

const rejectOrder = async (req, res) => {
    try {
        await ordersService.rejectOrder(req.params.id);
        res.json({ success: true, message: "Order Rejected. No stock changed." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const stats = await ordersService.getAdminStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

router.post('/', authGuard, createOrder);
router.get('/stats', authGuard, getAdminStats);
router.patch('/:id/approve', authGuard, approveOrder);
router.patch('/:id/reject', authGuard, rejectOrder);

module.exports = router;
