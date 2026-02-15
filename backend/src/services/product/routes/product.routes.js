const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');
const auth = require('../../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /api/products/group/{group}:
 *   get:
 *     summary: Get products by group
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: group
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products in group
 */
router.get('/group/:group', controller.getByGroup);

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products in category
 */
router.get('/category/:category', controller.getByCategory);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/:id', controller.findById);

/**
 * @swagger
 * /api/products/barcode/{barcode}:
 *   get:
 *     summary: Get product by Barcode
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/barcode/:barcode', controller.findByBarcode);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sku]
 *             properties:
 *               name: { type: string }
 *               sku: { type: string, unique: true }
 *               group: { type: string }
 *               category: { type: string }
 *               unit: { type: string }
 *               opening_qty: { type: integer }
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', auth, controller.create);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated
 */
router.put('/:id', auth, controller.update);

/**
 * @swagger
 * /api/products/{id}/toggle:
 *   patch:
 *     summary: Toggle product active status
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Status toggled
 */
router.patch('/:id/toggle', auth, controller.toggleStatus);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete('/:id', auth, controller.remove);

module.exports = router;
