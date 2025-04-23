const express = require('express');
const router = express.Router();
const subjectiveAttainmentController = require('../controllers/subjectiveAttainmentController');

// Routes for subjective mapping
router.post('/save', subjectiveAttainmentController.saveMapping);
router.get('/fetch', subjectiveAttainmentController.fetchMapping);

// Routes for subjective marks
router.post('/marks/save', subjectiveAttainmentController.saveMarks);
router.get('/marks/fetch', subjectiveAttainmentController.fetchMarks);

module.exports = router;