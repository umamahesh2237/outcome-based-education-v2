const COPOMapping = require('../models/COPOMapping');

// Controller to save CO-PO mappings
exports.saveMappings = async (req, res) => {
  const { regulation, semester, category, courseTitle, mappings, columnAverages } = req.body;
  if (!regulation || !semester || !category || !courseTitle || !mappings) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if mapping already exists
    let mapping = await COPOMapping.findOne({
      regulation,
      semester,
      category,
      courseName: courseTitle
    });

    if (mapping) {
      // Update existing mapping
      mapping.mappings = mappings;
      mapping.columnAverages = columnAverages;
      await mapping.save();
    } else {
      // Create new mapping
      mapping = new COPOMapping({
        regulation,
        semester,
        category,
        courseName:courseTitle,
        mappings,
        columnAverages
      });
      await mapping.save();
    }

    res.status(200).json({ message: 'Mappings saved successfully' });
  } catch (error) {
    console.error('Error saving CO-PO mappings:', error);
    res.status(500).json({ error: 'Failed to save mappings', details: error.message });
  }
};

// Controller to fetch CO-PO mappings
exports.fetchMappings = async (req, res) => {
  const { regulation, semester, category, courseTitle } = req.query;

  if (!regulation || !semester || !category || !courseTitle) {
    return res.status(400).json({ message: 'All filters are required' });
  }

  try {
    const mapping = await COPOMapping.findOne({
      regulation,
      semester,
      category,
      courseName: courseTitle
    });

    if (!mapping) {
      return res.status(404).json({ message: 'No mappings found' });
    }

    res.status(200).json(mapping);
  } catch (error) {
    console.error('Error fetching CO-PO mappings:', error);
    res.status(500).json({ error: 'Failed to fetch mappings', details: error.message });
  }
};