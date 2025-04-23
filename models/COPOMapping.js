const mongoose = require('mongoose');

const copoMappingSchema = new mongoose.Schema({
  regulation: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  courseName: { type: String, required: true },
  facultyName: { type: String, required: true },
  mappings: [{
    coNumber: { type: String, required: true },
    po1: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    po2: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    po3: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    po4: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    po5: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    po6: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    po7: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    po8: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    po9: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    po10: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    po11: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    po12: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    pso1: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    pso2: { type: String, enum: ['1', '2', '3', '-'], default: '-' },
    pso3: { type: String, enum: ['1', '2', '3', '-'], default: '-' }
  }],
  columnAverages: {
    po1: { type: Number },
    po2: { type: Number },
    po3: { type: Number },
    po4: { type: Number },
    po5: { type: Number },
    po6: { type: Number },
    po7: { type: Number },
    po8: { type: Number },
    po9: { type: Number },
    po10: { type: Number },
    po11: { type: Number },
    po12: { type: Number },
    pso1: { type: Number },
    pso2: { type: Number },
    pso3: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('COPOMapping', copoMappingSchema);