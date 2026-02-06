const express = require('express');
const router = express.Router();
const controller = require('../controllers/sales.controller');
const auth = require('../../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sales management
 */

// SALES ROUTES

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: List of sales
 */
router.get('/', controller.findAllSales);

/**
 * @swagger
 * /api/sales/summary:
 *   get:
 *     summary: Get sales summary
 *     tags: [Sales]
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
 *         description: Sales summary
 */
router.get('/summary', controller.getSalesSummary);

/**
 * @swagger
 * /api/sales/date-range:
 *   get:
 *     summary: Get sales by date range
 *     tags: [Sales]
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
 *         description: Sales in date range
 */
router.get('/date-range', controller.getSalesByDateRange);

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale details
 */
router.get('/:id', controller.findSaleById);

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_id, product_id, quantity, unit_price]
 *             properties:
 *               customer_id: { type: string, format: uuid }
 *               product_id: { type: string, format: uuid }
 *               quantity: { type: integer }
 *               unit_price: { type: number }
 *               total: { type: number }
 *     responses:
 *       201:
 *         description: Sale created
 */
router.post('/', auth, controller.createSale);

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Update sale
 *     tags: [Sales]
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
 *         description: Sale updated
 */
router.put('/:id', auth, controller.updateSale);

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Sale deleted
 */
router.delete('/:id', auth, controller.deleteSale);

// CUSTOMER ROUTES

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/list', controller.findAllCustomers);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 */
router.get('/:id', controller.findCustomerById);

/**
 * @swagger
 * /api/customers/{id}/sales:
 *   get:
 *     summary: Get customer with sales history
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer with sales
 */
router.get('/:id/sales', controller.getCustomerWithSales);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create new customer
 *     tags: [Sales]
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
 *               address: { type: string }
 *     responses:
 *       201:
 *         description: Customer created
 */
router.post('/new', auth, controller.createCustomer);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Sales]
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
 *         description: Customer updated
 */
router.put('/:id', auth, controller.updateCustomer);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Customer deleted
 */
router.delete('/:id', auth, controller.deleteCustomer);

module.exports = router;
