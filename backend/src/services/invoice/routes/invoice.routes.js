const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoice.controller');
const auth = require('../../../middlewares/auth');

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create new invoice
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - issueDate
 *               - dueDate
 *               - items
 *             properties:
 *               customerId:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date-time
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity, unitPrice]
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *               notes:
 *                 type: string
 *               tax:
 *                 type: number
 *               discount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Invoice created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, controller.create);
router.get('/', auth, controller.findAll);

/**
 * @swagger
 * /api/invoices/summary:
 *   get:
 *     summary: Get invoice summary with analytics
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Invoice summary
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', auth, controller.getSummary);
router.get('/tax-rates', auth, controller.getTaxRates);

/**
 * @swagger
 * /api/invoices/overdue:
 *   get:
 *     summary: Get overdue invoices
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of overdue invoices
 *       401:
 *         description: Unauthorized
 */
router.get('/overdue', auth, controller.getOverdue);

/**
 * @swagger
 * /api/invoices/status/{status}:
 *   get:
 *     summary: Get invoices by status
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         description: Invoice status (draft, sent, paid, partial, overdue, cancelled)
 *         schema:
 *           type: string
 *           enum: [draft, sent, paid, partial, overdue, cancelled]
 *     responses:
 *       200:
 *         description: List of invoices with specified status
 *       401:
 *         description: Unauthorized
 */
router.get('/status/:status', auth, controller.getByStatus);

/**
 * @swagger
 * /api/invoices/customer/{customerId}:
 *   get:
 *     summary: Get invoices for a specific customer
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customer invoices
 *       401:
 *         description: Unauthorized
 */
router.get('/customer/:customerId', auth, controller.getByCustomer);

/**
 * @swagger
 * /api/invoices/range:
 *   get:
 *     summary: Get invoices by date range
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
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
 *         description: List of invoices in date range
 *       401:
 *         description: Unauthorized
 */
router.get('/range', auth, controller.getByDateRange);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice details
 *       404:
 *         description: Invoice not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update invoice
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               issueDate:
 *                 type: string
 *                 format: date-time
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               tax:
 *                 type: number
 *               discount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Invoice updated
 *       404:
 *         description: Invoice not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete invoice
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice deleted
 *       404:
 *         description: Invoice not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, controller.findById);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.remove);

/**
 * @swagger
 * /api/invoices/{id}/status:
 *   patch:
 *     summary: Update invoice status
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, sent, paid, partial, overdue, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/status', auth, controller.updateStatus);

/**
 * @swagger
 * /api/invoices/{id}/send:
 *   post:
 *     summary: Send invoice
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice sent
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/send', auth, controller.send);

/**
 * @swagger
 * /api/invoices/{id}/payment:
 *   post:
 *     summary: Record payment for invoice
 *     tags: [Invoices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, cheque, credit_card, bank_transfer, upi]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment recorded
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/payment', auth, controller.recordPayment);

/**
 * @swagger
 * /api/invoices/{id}/items:
 *   get:
 *     summary: Get invoice line items
 *     tags: [Invoice Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of line items
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Add line item to invoice
 *     tags: [Invoice Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *               - unitPrice
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Line item added
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/items', auth, controller.getLineItems);
router.post('/:id/items', auth, controller.addLineItem);

/**
 * @swagger
 * /api/invoices/items/{lineItemId}:
 *   put:
 *     summary: Update line item
 *     tags: [Invoice Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lineItemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Line item updated
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete line item
 *     tags: [Invoice Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lineItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Line item deleted
 *       401:
 *         description: Unauthorized
 */
router.put('/items/:lineItemId', auth, controller.updateLineItem);
router.delete('/items/:lineItemId', auth, controller.deleteLineItem);

module.exports = router;
