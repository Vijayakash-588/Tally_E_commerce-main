const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventory.controller');
const auth = require('../../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Stock and inventory management
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all stock movements
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of stock movements
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /api/inventory/levels:
 *   get:
 *     summary: Get current stock levels for all products
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Current stock levels
 */
router.get('/levels', controller.getStockLevels);

/**
 * @swagger
 * /api/inventory/inwards:
 *   get:
 *     summary: Get all inward stock movements
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of inward movements
 */
router.get('/inwards', controller.getInwards);

/**
 * @swagger
 * /api/inventory/outwards:
 *   get:
 *     summary: Get all outward stock movements
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of outward movements
 */
router.get('/outwards', controller.getOutwards);

/**
 * @swagger
 * /api/inventory/summary:
 *   get:
 *     summary: Get inventory summary for date range
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Inventory summary
 */
router.get('/summary', controller.getSummary);

/**
 * @swagger
 * /api/inventory/product/{productId}:
 *   get:
 *     summary: Get stock movements for product
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock movements for product
 */
router.get('/product/:productId', controller.getByProduct);

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get stock movement by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock movement details
 */
router.get('/:id', controller.findById);

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Record stock movement
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, type, quantity]
 *             properties:
 *               product_id: { type: string, format: uuid }
 *               type: { type: string, enum: [IN, OUT] }
 *               quantity: { type: integer }
 *               reference: { type: string }
 *     responses:
 *       201:
 *         description: Stock movement recorded
 */
router.post('/', auth, controller.create);

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update stock movement
 *     tags: [Inventory]
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
 *         description: Stock movement updated
 */
router.put('/:id', auth, controller.update);

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete stock movement
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Stock movement deleted
 */
router.delete('/:id', auth, controller.remove);

module.exports = router;
