// objectiveAttainmentController.js
const { ObjectiveMapping, ObjectiveMarks } = require('../models/ObjectiveMapping');

// Controller to save objective mapping
exports.saveMapping = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch, mappings } = req.body;

  if (!regulation || !semester || !academicYear || !courseTitle || !batch || !mappings) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if mapping already exists
    let mapping = await ObjectiveMapping.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle,
      batch
    });

    if (mapping) {
      mapping.mappings = mappings;
      await mapping.save();
    } else {
      mapping = new ObjectiveMapping({
        regulation,
        semester,
        academicYear,
        courseName: courseTitle,
        batch,
        mappings
      });
      await mapping.save();
    }

    res.status(200).json({ message: 'Objective mapping saved successfully' });
  } catch (error) {
    console.error('Error saving objective mapping:', error);
    res.status(500).json({ error: 'Failed to save objective mapping', details: error.message });
  }
};

// Controller to fetch objective mapping
exports.fetchMapping = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch } = req.query;

  if (!regulation || !semester || !academicYear || !courseTitle || !batch) {
    return res.status(400).json({ message: 'All filters are required' });
  }

  try {
    const mapping = await ObjectiveMapping.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle,
      batch
    });

    if (!mapping) {
      return res.status(404).json({ message: 'No objective mapping found' });
    }

    res.status(200).json(mapping);
  } catch (error) {
    console.error('Error fetching objective mapping:', error);
    res.status(500).json({ error: 'Failed to fetch objective mapping', details: error.message });
  }
};

// Controller to save objective marks
exports.saveMarks = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch, marks } = req.body;

  if (!regulation || !semester || !academicYear || !courseTitle || !batch || !marks) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if marks already exist
    let marksDoc = await ObjectiveMarks.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle,
      batch
    });

    if (marksDoc) {
      // Update existing marks
      marksDoc.marks = marks;
      await marksDoc.save();
    } else {
      // Create new marks document
      marksDoc = new ObjectiveMarks({
        regulation,
        semester,
        academicYear,
        courseName: courseTitle,
        batch,
        marks
      });
      await marksDoc.save();
    }

    res.status(200).json({ message: 'Objective marks saved successfully' });
  } catch (error) {
    console.error('Error saving objective marks:', error);
    res.status(500).json({ error: 'Failed to save objective marks', details: error.message });
  }
};

// Controller to fetch objective marks
exports.fetchMarks = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch } = req.query;

  if (!regulation || !semester || !academicYear || !courseTitle || !batch) {
    return res.status(400).json({ message: 'All filters are required' });
  }

  try {
    const marksDoc = await ObjectiveMarks.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle,
      batch
    });

    if (!marksDoc) {
      return res.status(404).json({ message: 'No objective marks found' });
    }

    res.status(200).json(marksDoc);
  } catch (error) {
    console.error('Error fetching objective marks:', error);
    res.status(500).json({ error: 'Failed to fetch objective marks', details: error.message });
  }
};