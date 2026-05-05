const express = require('express');
const productsService = require('./products.service');

const router = express.Router();

const getProducts = async (req, res) => {
    try {
        const includeHidden = req.query.includeHidden === 'true';
        const products = await productsService.getAllProducts(includeHidden);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const newProduct = await productsService.createProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await productsService.updateProduct(req.params.id, req.body);
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateVisibility = async (req, res) => {
    try {
        const { isHidden } = req.body;
        const updatedProduct = await productsService.updateVisibility(req.params.id, isHidden);
        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await productsService.deleteProduct(req.params.id);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id/visibility', updateVisibility);
router.delete('/:id', deleteProduct);

module.exports = router;
