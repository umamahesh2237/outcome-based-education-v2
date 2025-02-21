const mongoose = require('mongoose');

const rubricMappingSchema = new mongoose.Schema({
  category: { type: String, required: true },
  rubric: { type: String, required: true },
  outcomes: { type: String, required: true },
  totalMarks: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('RubricMapping', rubricMappingSchema);