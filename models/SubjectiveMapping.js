const mongoose = require('mongoose');

const subjectiveMappingSchema = new mongoose.Schema({
  regulation: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  courseName: { type: String, required: true },
  batch: { type: String, required: true }, // Added 'batch'
  mappings: [{
    examNumber: { type: String, required: true }, // Subjective-1 or Subjective-2
    questions: [{
      questionNumber: { type: String, required: true }, // Q1, Q2, etc.
      maxMarks: { type: Number, default: 5 },
      coMappings: [{
        coNumber: { type: String, required: true },
        value: { type: String, enum: ['1', '-'], default: '-' }
      }]
    }]
  }]
}, { timestamps: true });

const subjectiveMarksSchema = new mongoose.Schema({
  regulation: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  courseName: { type: String, required: true },
  batch: { type: String, required: true }, // Added 'batch'
  marks: [{
    rollNo: { type: String, required: true },
    subjective1: {
      Q1: { type: Number },
      Q2: { type: Number },
      Q3: { type: Number },
      Q4: { type: Number },
      Q5: { type: Number },
      Q6: { type: Number }
    },
    subjective2: {
      Q1: { type: Number },
      Q2: { type: Number },
      Q3: { type: Number },
      Q4: { type: Number },
      Q5: { type: Number },
      Q6: { type: Number }
    }
  }]
}, { timestamps: true });

const SubjectiveMapping = mongoose.model('SubjectiveMapping', subjectiveMappingSchema);
const SubjectiveMarks = mongoose.model('SubjectiveMarks', subjectiveMarksSchema);

module.exports = { SubjectiveMapping, SubjectiveMarks };