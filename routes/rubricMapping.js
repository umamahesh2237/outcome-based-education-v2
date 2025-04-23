const express = require('express');
const router = express.Router();
const rubricMappingController = require('../controllers/rubricMappingController');

// Add a new rubric mapping
router.post('/add', rubricMappingController.addRubricMapping);

// Generate excel template for a specific assessment type and category
router.get('/generate-template', rubricMappingController.generateRubricExcelTemplate);

// Get rubrics by category and assessment type
router.get('/by-category-and-type', rubricMappingController.getRubricsByCategoryAndType);

// Delete a rubric
router.delete('/delete/:id', rubricMappingController.deleteRubric);

module.exports = router;