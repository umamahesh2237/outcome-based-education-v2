const CourseOutcome = require('../models/CourseOutcome');

// Controller to add course outcomes for a subject
exports.addCourseOutcomes = async (req, res) => {
  const { category, regulation, semester, subjectTitle, courseCode, outcomes } = req.body;
  console.log(category, regulation, semester, subjectTitle, courseCode, outcomes);
  if (!category || !regulation || !semester || !subjectTitle || !courseCode) {
    return res.status(400).json({ message: 'Missing required fields or outcomes should be an array' });
  }

  try {
    const courseOutcome = new CourseOutcome({
      category, regulation, semester, subjectTitle, courseCode, outcomes
    });
    await courseOutcome.save();
    res.status(200).send('Course outcomes added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding course outcomes');
  }
};

// Controller to fetch course outcomes based on selected filters
exports.fetchCourseOutcomes = async (req, res) => {
  const { regulation, semester, category, courseTitle } = req.query;
  const subjectTitle = courseTitle;
  if (!regulation || !semester || !category || !subjectTitle) {
    return res.status(400).json({ message: 'Missing required query parameters' });
  }
  try {
    const courseOutcome = await CourseOutcome.find({ regulation, semester, category, subjectTitle });
    console.log(courseOutcome.outcomes);
    if (!courseOutcome.length) {
      return res.status(404).json({ message: 'No course outcomes found' });
    }
    res.json(courseOutcome[0].outcomes[0]);
  } catch (err) {
    console.error('Error fetching course outcomes:', err);
    res.status(500).send('Error fetching course outcomes');
  }
};

exports.updateCourseOutcomes = async (req, res) => {
  const { courseOutcomes, filters } = req.body;
  const { regulation, semester, category, courseTitle } = filters;
  const subjectTitle = courseTitle;
  if (!regulation || !semester || !category || !subjectTitle) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const courseOutcome = await CourseOutcome.findOneAndUpdate(
      { regulation, semester, category, subjectTitle },
      { $set: { outcomes: courseOutcomes } },
      { new: true }
    );
    res.status(200).json(courseOutcome.outcomes);
  } catch (err) {
    console.error('Error updating course outcomes:', err);
    res.status(500).send('Error updating course outcomes');
  }
};
