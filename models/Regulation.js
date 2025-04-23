const mongoose = require('mongoose');

const regulationSchema = new mongoose.Schema({
  batch: { type: String, required: true },
  year: { type: String, required: true },
  regulation: { type: String, required: true },
  semester: { type: String, required: true },
}, { timestamps: true });

regulationSchema.index({ batch: 1, year: 1, regulation: 1 }, { unique: true });

module.exports = mongoose.model('Regulation', regulationSchema);