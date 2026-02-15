const express = require('express');
const router = express.Router();
const controller = require('../controllers/purchase.controller');
const auth = require('../../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Supplier
 *   description: Supplier management
 */

// SUPPLIER ROUTES

/**
 * @swagger
 * /api/suppliers/list:
 *   get:
 *     summary: Get all suppliers
 *     tags: [Supplier]
 *     responses:
 *       200:
 *         description: List of suppliers
 */
router.get('/', controller.findAllSuppliers);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Supplier]
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
 *     tags: [Supplier]
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
 * /api/suppliers/new:
 *   post:
 *     summary: Create new supplier
 *     tags: [Supplier]
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
 *     tags: [Supplier]
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
 *     tags: [Supplier]
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
