const express = require('express');
const router = express.Router();
const printAttainmentController = require('../controllers/printAttainmentController');

router.get('/generate', printAttainmentController.getPrintAttainmentData);

module.exports = router;