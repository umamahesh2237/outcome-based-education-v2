const mongoose = require('mongoose');

const programStructureSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseTitle: { type: String, required: true },
  category: { type: String, required: true },
  L: { type: Number, required: true, min: 0 },
  T: { type: Number, required: true, min: 0 },
  PD: { type: Number, required: true, min: 0 },
  CIE: { type: Number, required: true, min: 0 },
  SEE: { type: Number, required: true, min: 0 },
  totalMarks: { type: Number, required: true, min: 0 },
  credits: { type: Number, required: true, min: 0 },
  batch: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  regulation: { type: String, required: true }
}, { timestamps: true });

const ProgramStructure = mongoose.model('ProgramStructure', programStructureSchema);

module.exports = ProgramStructure;
