const express = require('express');
const router = express.Router();
const assignmentAttainmentController = require('../controllers/assignmentAttainmentController');

// Routes for assignment mapping
router.post('/save', assignmentAttainmentController.saveMapping);
router.get('/fetch', assignmentAttainmentController.fetchMapping);

// Routes for assignment marks
router.post('/marks/save', assignmentAttainmentController.saveMarks);
router.get('/marks/fetch', assignmentAttainmentController.fetchMarks);

module.exports = router;