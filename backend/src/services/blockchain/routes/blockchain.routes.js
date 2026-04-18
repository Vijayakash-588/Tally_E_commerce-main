const express = require('express');
const auth = require('../../../middlewares/auth');
const { authorize } = auth;
const controller = require('../controllers/blockchain.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Blockchain
 *     description: Ethereum anchoring and verification APIs
 */

/**
 * @swagger
 * /api/blockchain/health:
 *   get:
 *     summary: Get blockchain integration health and anchor totals
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health and counters
 */
router.get('/health', auth, authorize('admin', 'manager'), controller.health);

/**
 * @swagger
 * /api/blockchain/anchors:
 *   get:
 *     summary: List anchors with optional entity filters
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of anchor records
 *   post:
 *     summary: Create a new Ethereum anchor record
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entityType, entityId]
 *             properties:
 *               entityType:
 *                 type: string
 *               entityId:
 *                 type: string
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Anchor processed (or skipped by feature flag)
 */
router.get('/anchors', auth, authorize('admin', 'manager'), controller.listAnchors);
router.post('/anchors', auth, authorize('admin', 'manager'), controller.anchor);

/**
 * @swagger
 * /api/blockchain/anchors/{id}/verify:
 *   get:
 *     summary: Verify a specific anchor against Ethereum transaction receipt
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification result
 */
router.get('/anchors/:id/verify', auth, authorize('admin', 'manager'), controller.verifyAnchor);

/**
 * @swagger
 * /api/blockchain/verify/{entityType}/{entityId}:
 *   get:
 *     summary: Verify latest anchor for an entity
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entity verification result
 */
router.get('/verify/:entityType/:entityId', auth, authorize('admin', 'manager'), controller.verifyEntity);

/**
 * @swagger
 * /api/blockchain/anchors/retry-failed:
 *   post:
 *     summary: Retry processing failed Ethereum anchors
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: integer
 *                 default: 25
 *     responses:
 *       200:
 *         description: Retry queue summary
 */
router.post('/anchors/retry-failed', auth, authorize('admin', 'manager'), controller.retryFailed);

module.exports = router;
