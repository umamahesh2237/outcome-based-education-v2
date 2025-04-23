const express = require('express');
const router = express.Router();
const endExamAttainmentController = require('../controllers/endExamAttainmentController');

// Routes for end exam mapping
router.post('/save', endExamAttainmentController.saveMapping);
router.get('/fetch', endExamAttainmentController.fetchMapping);

// Routes for end exam marks
router.post('/marks/save', endExamAttainmentController.saveMarks);
router.get('/marks/fetch', endExamAttainmentController.fetchMarks);

module.exports = router;