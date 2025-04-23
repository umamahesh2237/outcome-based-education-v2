const { SubjectiveMapping, SubjectiveMarks } = require('../models/SubjectiveMapping');

// Controller to save subjective mapping
exports.saveMapping = async (req, res) => {
  console.log('Received saveMapping request:', req.body);
  const { regulation, semester, academicYear, courseTitle, batch, mappings } = req.body; // Added 'batch'
  console.log('Extracted data:', { regulation, semester, academicYear, courseTitle, batch, mappings });

  if (!regulation || !semester || !academicYear || !courseTitle || !batch || !mappings) { // Added 'batch'
    console.log('Validation failed - missing required fields');
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if mapping already exists
    console.log('Checking for existing mapping...');
    let mapping = await SubjectiveMapping.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle, // Consistent use of courseTitle
      batch
    });

    if (mapping) {
      console.log('Existing mapping found:', mapping);
      // Update existing mapping
      mapping.mappings = mappings;
      console.log('Updating mapping with:', mappings);
      await mapping.save();
      console.log('Mapping updated successfully');
    } else {
      console.log('No existing mapping found, creating new...');
      // Create new mapping
      mapping = new SubjectiveMapping({
        regulation,
        semester,
        academicYear,
        courseName: courseTitle, // Consistent use of courseTitle
        batch,
        mappings
      });
      console.log('New mapping data:', mapping);
      await mapping.save();
      console.log('New mapping saved successfully');
    }

    res.status(200).json({ message: 'Subjective mapping saved successfully' });
  } catch (error) {
    console.error('Error saving subjective mapping:', error);
    res.status(500).json({ error: 'Failed to save mapping', details: error.message });
  }
};

// Controller to fetch subjective mapping
exports.fetchMapping = async (req, res) => {
  console.log('Received fetchMapping request:', req.query);
  const { regulation, semester, academicYear, courseTitle, batch } = req.query; 
  console.log('Fetching mapping with filters:', { regulation, semester, academicYear, courseTitle, batch });

  if (!regulation || !semester || !academicYear || !courseTitle || !batch) { 
    console.log('Validation failed - missing required filters for fetching');
    return res.status(400).json({ message: 'All filters are required' });
  }

  try {
    console.log('Searching for mapping...');
    const mapping = await SubjectiveMapping.findOne({
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

    console.log('Mapping found:', mapping);
    res.status(200).json(mapping);
  } catch (error) {
    console.error('Error fetching subjective mapping:', error);
    res.status(500).json({ error: 'Failed to fetch mapping', details: error.message });
  }
};

// Controller to save subjective marks
exports.saveMarks = async (req, res) => {
  console.log('Received saveMarks request:', req.body);
  const { regulation, semester, academicYear, courseTitle, batch, marks } = req.body;
  console.log('Extracted marks data:', { regulation, semester, academicYear, courseTitle, batch, marks });

  if (!regulation || !semester || !academicYear || !courseTitle || !batch || !marks) {
    console.log('Validation failed - missing required fields for saving marks');
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if marks already exist
    console.log('Checking for existing marks...');
    let marksDoc = await SubjectiveMarks.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle, // Consistent use of courseTitle
      batch
    });

    if (marksDoc) {
      console.log('Existing marks found:', marksDoc);
      // Update existing marks
      marksDoc.marks = marks;
      console.log('Updating marks with:', marks);
      await marksDoc.save();
      console.log('Marks updated successfully');
    } else {
      console.log('No existing marks found, creating new...');
      // Create new marks document
      marksDoc = new SubjectiveMarks({
        regulation,
        semester,
        academicYear,
        courseName: courseTitle, // Consistent use of courseTitle
        batch,
        marks
      });
      console.log('New marks data:', marksDoc);
      await marksDoc.save();
      console.log('New marks saved successfully');
    }

    res.status(200).json({ message: 'Subjective marks saved successfully' });
  } catch (error) {
    console.error('Error saving subjective marks:', error);
    res.status(500).json({ error: 'Failed to save marks', details: error.message });
  }
};

// Controller to fetch subjective marks
exports.fetchMarks = async (req, res) => {
  console.log('Received fetchMarks request:', req.query);
  const { regulation, semester, academicYear, courseTitle, batch } = req.query; // Removed 'facultyName', added 'batch'
  console.log('Fetching marks with filters:', { regulation, semester, academicYear, courseTitle, batch });

  if (!regulation || !semester || !academicYear || !courseTitle || !batch) { // Removed 'facultyName'
    console.log('Validation failed - missing required filters for fetching marks');
    return res.status(400).json({ message: 'All filters are required' });
  }

  try {
    console.log('Searching for marks...');
    const marksDoc = await SubjectiveMarks.findOne({
      regulation,
      semester,
      academicYear,
      courseName: courseTitle, // Consistent use of courseTitle
      batch
    });

    if (!marksDoc) {
      console.log('No marks found for the given filters');
      return res.status(404).json({ message: 'No marks found' });
    }

    console.log('Marks found:', marksDoc);
    res.status(200).json(marksDoc);
  } catch (error) {
    console.error('Error fetching subjective marks:', error);
    res.status(500).json({ error: 'Failed to fetch marks', details: error.message });
  }
};