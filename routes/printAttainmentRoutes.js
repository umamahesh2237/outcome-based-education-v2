const express = require('express');
const router = express.Router();
const printAttainmentController = require('../controllers/printAttainmentController');

router.get('/generate', printAttainmentController.generatePrintAttainmentData);

module.exports = router;