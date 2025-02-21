// regulationRoutes.js
const express = require('express');
const Regulation = require('../models/Regulation');
const router = express.Router();

// Add regulation data
router.post('/addRegulation', async (req, res) => {
  const { regulations } = req.body;
  if (!Array.isArray(regulations) || regulations.length === 0) {
    return res.status(400).json({ error: 'Invalid regulations data' });
  }
  try {
    const savedRegulations = await Regulation.insertMany(regulations);
    res.status(200).json({ message: 'Regulations added successfully', data: savedRegulations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add regulations', details: error.message });
  }
});

module.exports = router;