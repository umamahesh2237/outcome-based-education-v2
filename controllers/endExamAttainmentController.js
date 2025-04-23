const { EndExamMapping, EndExamMarks } = require('../models/EndExamMapping');

// Controller to save end exam mapping
exports.saveMapping = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch, mapping } = req.body;

  if (!regulation || !semester || !academicYear || !courseTitle || !batch || !mapping) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if mapping already exists
    let existingMapping = await EndExamMapping.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle,
      batch
    });

    if (existingMapping) {
      // Update existing mapping
      existingMapping.mapping = mapping;
      await existingMapping.save();
    } else {
      // Create new mapping
      const newMapping = new EndExamMapping({
        regulation,
        semester,
        academicYear,
        courseName: courseTitle,
        batch,
        mapping
      });
      await newMapping.save();
    }

    res.status(200).json({ message: 'End Exam mapping saved successfully' });
  } catch (error) {
    console.error('Error saving end exam mapping:', error);
    res.status(500).json({ error: 'Failed to save mapping', details: error.message });
  }
};

// Controller to fetch end exam mapping
exports.fetchMapping = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch } = req.query;
  if (!regulation || !semester || !academicYear || !courseTitle || !batch) {
    return res.status(400).json({ message: 'All filters are required' });
  }

  try {
    const mapping = await EndExamMapping.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle,
      batch
    });
    if (!mapping) {
      console.log('No end exam mapping found for the given filters');
      return res.status(404).json({ message: 'No mapping found' });
    }

    res.status(200).json(mapping);
  } catch (error) {
    console.error('Error fetching end exam mapping:', error);
    res.status(500).json({ error: 'Failed to fetch mapping', details: error.message });
  }
};

// Controller to save end exam marks
exports.saveMarks = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch, marks } = req.body;

  if (!regulation || !semester || !academicYear || !courseTitle || !batch || !marks) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if marks already exist
    let marksDoc = await EndExamMarks.findOne({
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
      const newMarksDoc = new EndExamMarks({
        regulation,
        semester,
        academicYear,
        courseName: courseTitle,
        batch,
        marks
      });
      await newMarksDoc.save();
    }

    res.status(200).json({ message: 'End Exam marks saved successfully' });
  } catch (error) {
    console.error('Error saving end exam marks:', error);
    res.status(500).json({ error: 'Failed to save marks', details: error.message });
  }
};

// Controller to fetch end exam marks
exports.fetchMarks = async (req, res) => {
  const { regulation, semester, academicYear, courseTitle, batch } = req.query;

  if (!regulation || !semester || !academicYear || !courseTitle || !batch) {
    return res.status(400).json({ message: 'All filters are required' });
  }

  try {
    const marksDoc = await EndExamMarks.findOne({
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
    console.error('Error fetching end exam marks:', error);
    res.status(500).json({ error: 'Failed to fetch marks', details: error.message });
  }
};