const express = require('express');
const router = express.Router();
const aiController = require('../ai.controller');
const auth = require('../../../middlewares/auth');

router.post('/chat', auth, aiController.chat);

module.exports = router;
