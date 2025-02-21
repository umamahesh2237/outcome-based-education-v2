// courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Add a new course
router.post('/add', async (req, res) => {
  try {
    await courseController.addCourse(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add course', details: error.message });
  }
});

// Get courses by regulation and semester
router.get('/by-regulation-semester', async (req, res) => {
  try {
    await courseController.getCoursesByRegulationAndSemester(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
  }
});

module.exports = router;