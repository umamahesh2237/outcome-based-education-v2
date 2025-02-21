// courseOutcomes.js
const express = require('express');
const courseOutcomeController = require('../controllers/courseOutcomeController');
const router = express.Router();

// Add course outcomes
router.post('/add', async (req, res) => {
  try {
    await courseOutcomeController.addCourseOutcomes(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add course outcomes', details: error.message });
  }
});

// Fetch course outcomes
router.get('/fetch', courseOutcomeController.fetchCourseOutcomes);

module.exports = router;