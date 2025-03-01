const ProgramStructure = require('../models/ProgramStructure');
const Course = require('../models/ProgramStructure');

// Add new course
exports.addCourse = async (req, res) => {
  const { regulation, semester, courseName, courseCode } = req.body;
  if (!regulation || !semester || !courseName || !courseCode) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newCourse = new Course({
      regulation,
      semester,
      courseName,
      courseCode
    });
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add course', error: err.message });
  }
};

// Get courses by regulation and semester
exports.getCoursesByRegulationAndSemester = async (req, res) => {
  const { regulation, semester } = req.query;
  if (!regulation || !semester) {
    return res.status(400).json({ message: 'Missing required query parameters' });
  }

  try {
    const courses = await ProgramStructure.find({ regulation: regulation, semester });
    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found' });
    }
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses', error: err.message });
  }
};
