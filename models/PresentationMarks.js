// models/PresentationMarks.js
const mongoose = require('mongoose');

const presentationMarksSchema = new mongoose.Schema({
  regulation: { type: String, required: true },
  semester: { type: String, required: true },
  category: { type: String, required: true },
  courseTitle: { type: String, required: true },
  batch: { type: String, required: true },
  academicYear: { type: String, required: true },
  marks: [{
    rollNo: { type: String, required: true },
    presentation: { type: Number }
  }]
}, { timestamps: true });

module.exports = mongoose.model('PresentationMarks', presentationMarksSchema);
