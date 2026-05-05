const express = require('express');
const uploadsService = require('./uploads.service');
const { authGuard } = require('../../common/middlewares/auth.guard');

const router = express.Router();

const uploadProductImage = async (req, res) => {
    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ message: 'imageData is required' });
        }

        const result = await uploadsService.uploadProductImage(imageData);

        res.status(201).json({
            success: true,
            imageUrl: result.imageUrl,
            publicId: result.publicId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

router.post('/product-image', authGuard, uploadProductImage);

module.exports = router;
