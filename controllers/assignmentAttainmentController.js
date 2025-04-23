const { AssignmentMapping, AssignmentMarks } = require('../models/AssignmentMapping');

// Controller to save assignment mapping
exports.saveMapping = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch, mappings } = req.body;

  if (!regulation || !semester || !academicYear || !courseTitle || !batch || !mappings) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if mapping already exists
    let mapping = await AssignmentMapping.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle,
      batch
    });

    if (mapping) {
      // Update existing mapping
      mapping.mappings = mappings;
      await mapping.save();
    } else {
      // Create new mapping
      mapping = new AssignmentMapping({
        regulation,
        semester,
        academicYear,
        courseName: courseTitle,
        batch,
        mappings
      });
      await mapping.save();
    }

    res.status(200).json({ message: 'Assignment mapping saved successfully' });
  } catch (error) {
    console.error('Error saving assignment mapping:', error);
    res.status(500).json({ error: 'Failed to save mapping', details: error.message });
  }
};

// Controller to fetch assignment mapping
exports.fetchMapping = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch } = req.query;
  if (!regulation || !semester || !academicYear || !courseTitle || !batch) {
    return res.status(400).json({ message: 'All filters are required' });
  }

  try {
    const mapping = await AssignmentMapping.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle,
      batch
    });
    if (!mapping) {
      console.log('No mapping found for the given filters');
      return res.status(404).json({ message: 'No mapping found' });
    }

    res.status(200).json(mapping);
  } catch (error) {
    console.error('Error fetching assignment mapping:', error);
    res.status(500).json({ error: 'Failed to fetch mapping', details: error.message });
  }
};

// Controller to save assignment marks
exports.saveMarks = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch, marks } = req.body;

  if (!regulation || !semester || !academicYear || !courseTitle || !batch || !marks) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if marks already exist
    let marksDoc = await AssignmentMarks.findOne({
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
      marksDoc = new AssignmentMarks({
        regulation,
        semester,
        academicYear,
        courseName: courseTitle,
        batch,
        marks
      });
      await marksDoc.save();
    }

    res.status(200).json({ message: 'Assignment marks saved successfully' });
  } catch (error) {
    console.error('Error saving assignment marks:', error);
    res.status(500).json({ error: 'Failed to save marks', details: error.message });
  }
};

// Controller to fetch assignment marks
exports.fetchMarks = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch } = req.query;

  if (!regulation || !semester || !academicYear || !courseTitle || !batch) {
    return res.status(400).json({ message: 'All filters are required' });
  }

  try {
    const marksDoc = await AssignmentMarks.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle, // Using courseTitle from the query to match courseName in the model
      batch
    });

    if (!marksDoc) {
      return res.status(404).json({ message: 'No marks found' });
    }

    res.status(200).json(marksDoc);
  } catch (error) {
    console.error('Error fetching assignment marks:', error);
    res.status(500).json({ error: 'Failed to fetch marks', details: error.message });
  }
};