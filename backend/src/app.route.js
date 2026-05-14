const express = require('express');
const router = express.Router();

const productsRoutes = require('./modules/products/products.controller');
const ordersRoutes = require('./modules/orders/orders.controller');
const authRoutes = require('./modules/auth/auth.controller');
const uploadsRoutes = require('./modules/uploads/uploads.controller');
const contentRoutes = require('./modules/content/content.controller');

router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/auth', authRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/content', contentRoutes);

module.exports = router;
