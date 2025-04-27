const mongoose = require('mongoose');

const TLPSurveySchema = new mongoose.Schema({
    regulation: { type: String, required: true },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    courseTitle: { type: String, required: true },
    batch: { type: String, required: true },
    feedback: [{
        section: { type: String, required: true },
        term1: { type: Number },
        term2: { type: Number },
        average: { type: Number }
    }],
    overallAverage: { type: Number }
}, {
    timestamps: true
});

TLPSurveySchema.index({ regulation: 1, semester: 1, academicYear: 1, courseTitle: 1, batch: 1 }, { unique: true });

const TLPSurvey = mongoose.model('TLPSurvey', TLPSurveySchema);

const CourseEndSurveySchema = new mongoose.Schema({
    regulation: { type: String, required: true },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    courseTitle: { type: String, required: true },
    batch: { type: String, required: true },
    coPercentages: [{
        coNumber: { type: String, required: true },
        percentage: { type: Number }
    }]
}, {
    timestamps: true
});

CourseEndSurveySchema.index({ regulation: 1, semester: 1, academicYear: 1, courseTitle: 1, batch: 1 }, { unique: true });

const CourseEndSurvey = mongoose.model('CourseEndSurvey', CourseEndSurveySchema);

module.exports = { TLPSurvey, CourseEndSurvey };