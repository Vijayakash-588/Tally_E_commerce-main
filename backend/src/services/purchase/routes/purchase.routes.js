const express = require('express');
const router = express.Router();
const controller = require('../controllers/purchase.controller');
const auth = require('../../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Purchase
 *   description: Purchase management
 */

// PURCHASE ROUTES

/**
 * @swagger
 * /api/purchases:
 *   get:
 *     summary: Get all purchases
 *     tags: [Purchase]
 *     responses:
 *       200:
 *         description: List of purchases
 */
router.get('/', controller.findAllPurchases);

/**
 * @swagger
 * /api/purchases/summary:
 *   get:
 *     summary: Get purchase summary
 *     tags: [Purchase]
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
 *         description: Purchase summary
 */
router.get('/summary', controller.getPurchaseSummary);

/**
 * @swagger
 * /api/purchases/date-range:
 *   get:
 *     summary: Get purchases by date range
 *     tags: [Purchase]
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
 *         description: Purchases in date range
 */
router.get('/date-range', controller.getPurchasesByDateRange);

/**
 * @swagger
 * /api/purchases/{id}:
 *   get:
 *     summary: Get purchase by ID
 *     tags: [Purchase]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase details
 */
router.get('/:id', controller.findPurchaseById);

/**
 * @swagger
 * /api/purchases:
 *   post:
 *     summary: Create new purchase
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supplier_id, product_id, quantity, unit_price]
 *             properties:
 *               supplier_id: { type: string, format: uuid }
 *               product_id: { type: string, format: uuid }
 *               quantity: { type: integer }
 *               unit_price: { type: number }
 *               total: { type: number }
 *     responses:
 *       201:
 *         description: Purchase created
 */
router.post('/', auth, controller.createPurchase);

/**
 * @swagger
 * /api/purchases/{id}:
 *   put:
 *     summary: Update purchase
 *     tags: [Purchase]
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
 *         description: Purchase updated
 */
router.put('/:id', auth, controller.updatePurchase);

/**
 * @swagger
 * /api/purchases/{id}:
 *   delete:
 *     summary: Delete purchase
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Purchase deleted
 */
router.delete('/:id', auth, controller.deletePurchase);

// SUPPLIER ROUTES

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Get all suppliers
 *     tags: [Purchase]
 *     responses:
 *       200:
 *         description: List of suppliers
 */
router.get('/list', controller.findAllSuppliers);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Purchase]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supplier details
 */
router.get('/:id', controller.findSupplierById);

/**
 * @swagger
 * /api/suppliers/{id}/purchases:
 *   get:
 *     summary: Get supplier with purchase history
 *     tags: [Purchase]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supplier with purchases
 */
router.get('/:id/purchases', controller.getSupplierWithPurchases);

/**
 * @swagger
 * /api/suppliers:
 *   post:
 *     summary: Create new supplier
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               contact: { type: string }
 *               address: { type: string }
 *     responses:
 *       201:
 *         description: Supplier created
 */
router.post('/new', auth, controller.createSupplier);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   put:
 *     summary: Update supplier
 *     tags: [Purchase]
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
 *         description: Supplier updated
 */
router.put('/:id', auth, controller.updateSupplier);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   delete:
 *     summary: Delete supplier
 *     tags: [Purchase]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Supplier deleted
 */
router.delete('/:id', auth, controller.deleteSupplier);

module.exports = router;
