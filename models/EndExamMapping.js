const mongoose = require('mongoose');

const endExamMappingSchema = new mongoose.Schema({
  regulation: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  courseName: { type: String, required: true },
  batch: { type: String, required: true },
  mapping: [{
    questionNumber: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    coMappings: [{
      coNumber: { type: String, required: true },
      value: { type: String, enum: ['1', '-'], default: '-' }
    }]
  }]
}, { timestamps: true });

const endExamMarksSchema = new mongoose.Schema({
  regulation: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  courseName: { type: String, required: true },
  batch: { type: String, required: true },
  marks: [{
    '1a': { type: Number },
    '1b': { type: Number },
    '1c': { type: Number },
    '1d': { type: Number },
    '1e': { type: Number },
    '1f': { type: Number },
    '1g': { type: Number },
    '1h': { type: Number },
    '1i': { type: Number },
    '1j': { type: Number },
    '2a': { type: Number },
    '2b': { type: Number },
    '3a': { type: Number },
    '3b': { type: Number },
    '4a': { type: Number },
    '4b': { type: Number },
    '5a': { type: Number },
    '5b': { type: Number },
    '6a': { type: Number },
    '6b': { type: Number },
    '7a': { type: Number },
    '7b': { type: Number },
    '8a': { type: Number },
    '8b': { type: Number },
    '9a': { type: Number },
    '9b': { type: Number },
    '10a': { type: Number },
    '10b': { type: Number },
    '11a': { type: Number },
    '11b': { type: Number },
  }]
}, { timestamps: true });

const EndExamMapping = mongoose.model('EndExamMapping', endExamMappingSchema);
const EndExamMarks = mongoose.model('EndExamMarks', endExamMarksSchema);

module.exports = { EndExamMapping, EndExamMarks };