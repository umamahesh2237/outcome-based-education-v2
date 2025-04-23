const express = require('express');
const router = express.Router();
const copoMappingController = require('../controllers/copoMappingController');

// Route to save CO-PO mappings
router.post('/save', copoMappingController.saveMappings);

// Route to fetch CO-PO mappings
router.get('/fetch', copoMappingController.fetchMappings);

module.exports = router;