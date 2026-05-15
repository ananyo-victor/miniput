const express = require('express');
const contentService = require('./content.service');
const { authGuard } = require('../../common/middlewares/auth.guard');

const router = express.Router();

router.get('/home/:brand', async (req, res) => {
    try {
        const result = await contentService.getHomeContentByBrand(req.params.brand);
        res.json(result);
    } catch (error) {
        const status = error.message.includes('Invalid brand') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

router.put('/home/:brand', authGuard, async (req, res) => {
    try {
        const result = await contentService.upsertHomeContentByBrand(req.params.brand, req.body || {});
        res.json(result);
    } catch (error) {
        const status = error.message.includes('Invalid brand') || error.message.includes('cannot exceed 4') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

router.get('/about', async (req, res) => {
    try {
        const result = await contentService.getAboutContent();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/about', authGuard, async (req, res) => {
    try {
        const result = await contentService.upsertAboutContent(req.body || {});
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
