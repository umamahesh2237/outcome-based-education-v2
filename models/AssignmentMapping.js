const mongoose = require('mongoose');

const assignmentMappingSchema = new mongoose.Schema({
  regulation: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  courseName: { type: String, required: true },
  batch: { type: String, required: true },
  mappings: [{
    assignmentNumber: { type: String, required: true },
    maxMarks: { type: Number, default: 5 },
    coMappings: [{
      coNumber: { type: String, required: true },
      value: { type: String, enum: ['1', '-'], default: '-' }
    }]
  }]
}, { timestamps: true });

const assignmentMarksSchema = new mongoose.Schema({
  regulation: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  courseName: { type: String, required: true },
  batch: { type: String, required: true },
  marks: [{
    rollNo: { type: String, required: true },
    assignment1: { type: Number },
    assignment2: { type: Number }
  }]
}, { timestamps: true });

const AssignmentMapping = mongoose.model('AssignmentMapping', assignmentMappingSchema);
const AssignmentMarks = mongoose.model('AssignmentMarks', assignmentMarksSchema);

module.exports = { AssignmentMapping, AssignmentMarks };