// models/ObjectiveMapping.js
const mongoose = require('mongoose');

const objectiveMappingSchema = new mongoose.Schema({
  regulation: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  courseName: { type: String, required: true },
  batch: { type: String, required: true },
  mappings: [{
    objectiveNumber: { type: String, required: true },
    maxMarks: { type: Number, default: 10 },
    coMappings: [{
      coNumber: { type: String, required: true },
      value: { type: String, enum: ['1', '-'], default: '-' }
    }]
  }]
}, { timestamps: true });

const objectiveMarksSchema = new mongoose.Schema({
  regulation: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  courseName: { type: String, required: true },
  batch: { type: String, required: true },
  marks: [{
    rollNo: { type: String, required: true },
    objective1: { type: Number },
    objective2: { type: Number }
  }]
}, { timestamps: true });

const ObjectiveMapping = mongoose.model('ObjectiveMapping', objectiveMappingSchema);
const ObjectiveMarks = mongoose.model('ObjectiveMarks', objectiveMarksSchema);

module.exports = { ObjectiveMapping, ObjectiveMarks };