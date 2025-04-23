const express = require('express');
const presentationAttainmentController = require('../controllers/presentationAttainmentController');

const router = express.Router();

router.post('/marks/save', presentationAttainmentController.savePresentationMarks);
router.get('/calculate', presentationAttainmentController.calculatePresentationAttainment);
router.get('/marks/fetch', presentationAttainmentController.fetchPresentationMarks);

module.exports = router;