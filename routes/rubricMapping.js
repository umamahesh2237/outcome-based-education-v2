const express = require('express');
const router = express.Router();
const rubricMappingController = require('../controllers/rubricMappingController');

router.post('/add', rubricMappingController.addRubricMapping);
router.get('/generate-template', rubricMappingController.generateRubricExcelTemplate);

module.exports = router;