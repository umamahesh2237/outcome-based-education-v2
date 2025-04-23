const mongoose = require('mongoose');

const rubricMappingSchema = new mongoose.Schema({
  category: { type: String, required: true },
  rubric: { type: String, required: true },
  mappedCOs: { type: String, required: true },
  marks: { type: Number, required: true, min: 1 },
  weightage: { type: Number, required: true, min: 0, max: 100 },
  assessmentType: { type: String, required: true, enum: ['Direct', 'Indirect'], default: 'Direct' }
}, { timestamps: true });

module.exports = mongoose.model('RubricMapping', rubricMappingSchema);