// routes/objectiveAttainmentRoutes.js
const express = require('express');
const router = express.Router();
const objectiveAttainmentController = require('../controllers/objectiveAttainmentController');

// Routes for objective mapping
router.post('/save', objectiveAttainmentController.saveMapping);
router.get('/fetch', objectiveAttainmentController.fetchMapping);

// Routes for objective marks
router.post('/marks/save', objectiveAttainmentController.saveMarks);
router.get('/marks/fetch', objectiveAttainmentController.fetchMarks);

module.exports = router;