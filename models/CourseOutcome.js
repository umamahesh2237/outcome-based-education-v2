const mongoose = require('mongoose');

const courseOutcomeSchema = new mongoose.Schema({
  category: { type: String, required: true },
  regulation: { type: String, required: true },
  semester: { type: String, required: true },
  subjectTitle: { type: String, required: true },
  courseCode: { type: String, required: true },
  outcomes: [
    {
      CO1: { type: String, required: false },
      CO2: { type: String, required: false },
      CO3: { type: String, required: false },
      CO4: { type: String, required: false },
      CO5: { type: String, required: false },
      CO6: { type: String, required: false }
    }
  ]
}, { timestamps: true });

const CourseOutcome = mongoose.model('CourseOutcome', courseOutcomeSchema);

module.exports = CourseOutcome;
