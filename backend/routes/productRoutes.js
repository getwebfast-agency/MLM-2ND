const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');

// Public route to view products
router.get('/', getAllProducts);
router.get('/:id', getProductById);

const upload = require('../middleware/uploadMiddleware');

// Protected Admin routes
router.post('/', authenticateToken, isAdmin, upload.single('image'), createProduct);
router.put('/:id', authenticateToken, isAdmin, updateProduct);
router.delete('/:id', authenticateToken, isAdmin, deleteProduct);

module.exports = router;
