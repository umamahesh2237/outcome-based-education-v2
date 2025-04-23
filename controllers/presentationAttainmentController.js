// controllers/presentationAttainmentController.js
const PresentationMarks = require('../models/PresentationMarks');

exports.savePresentationMarks = async (req, res) => {
  try {
    const { regulation, semester, category, courseTitle, batch, academicYear, marks } = req.body;

    const existingDocument = await PresentationMarks.findOne({
      regulation,
      semester,
      category,
      courseTitle,
      batch,
      academicYear,
    });

    if (existingDocument) {
      existingDocument.marks = marks;
      await existingDocument.save();
      res.status(200).json({ message: 'Presentation marks updated successfully!' });
    } else {
      const newPresentationMarks = new PresentationMarks({
        regulation,
        semester,
        category,
        courseTitle,
        batch,
        academicYear,
        marks,
      });
      await newPresentationMarks.save();
      res.status(201).json({ message: 'Presentation marks saved successfully!' });
    }
  } catch (error) {
    console.error('Error saving/updating presentation marks:', error);
    res.status(500).json({ error: 'Failed to save/update presentation marks', details: error.message });
  }
};

exports.fetchPresentationMarks = async (req, res) => {
  console.log('Received fetchPresentationMarks request:', req.query);
  const { regulation, semester, category, courseTitle, batch, academicYear } = req.query;
  console.log('Extracted filter data for fetching:', { regulation, semester, category, courseTitle, batch, academicYear });

  if (!regulation || !semester || !category || !courseTitle || !batch || !academicYear) {
    console.log('Validation failed - missing required fields for fetching presentation marks');
    return res.status(400).json({ message: 'All filter fields are required to fetch presentation marks' });
  }

  try {
    console.log('Querying database for presentation marks...');
    const document = await PresentationMarks.findOne({
      regulation,
      semester,
      category,
      courseTitle,
      batch,
      academicYear,
    });

    if (document) {
      console.log('Presentation marks found:', document.marks);
      res.status(200).json({ marks: document.marks });
    } else {
      console.log('No presentation marks found for the given criteria');
      res.status(404).json({ message: 'No presentation marks found for the selected criteria' });
    }
  } catch (error) {
    console.error('Error fetching presentation marks:', error);
    res.status(500).json({ error: 'Failed to fetch presentation marks', details: error.message });
  }
};

exports.calculatePresentationAttainment = async (req, res) => {
  try {
    const { regulation, semester, category, courseTitle, batch, academicYear } = req.query;

    const document = await PresentationMarks.findOne({
      regulation,
      semester,
      category,
      courseTitle,
      batch,
      academicYear,
    });

    if (!document) {
      return res.status(404).json({ message: 'No marks found' });
    }

    const maxMarks = 5;
    const targetMarks = maxMarks * 0.6;
    const validMarks = document.marks.filter(mark => mark.presentation != null);
    const reachingTarget = validMarks.filter(mark => mark.presentation >= targetMarks).length;

    res.status(200).json({
      reachingTarget,
      attemptedStudents: validMarks.length,
    });
  } catch (error) {
    console.error('Error calculating presentation attainment:', error);
    res.status(500).json({ error: 'Failed to calculate presentation attainment' });
  }
};