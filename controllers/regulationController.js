const Regulation = require('../models/Regulation');

// Add new regulation
exports.addRegulation = async (req, res) => {
  const { batch, academicYear, regulation, semester } = req.body;
  
  if (!batch || !academicYear || !regulation || !semester) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newRegulation = new Regulation({ batch, academicYear, regulation, semester });
    await newRegulation.save();
    res.status(200).json({ msg: 'Regulation added successfully' });
  } catch (error) {
    console.error('Error adding regulation:', error);
    res.status(500).json({ error: 'Error adding regulation' });
  }
};

// Get all regulations in ascending order
exports.getAllRegulations = async (req, res) => {
  try {
    const regulations = await Regulation.find().sort({ regulation: 1 });
    res.status(200).json(regulations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch regulations', error: err.message });
  }
};
