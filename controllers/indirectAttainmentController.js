const { TLPSurvey, CourseEndSurvey } = require('../models/indirectAttainment'); // Correct import path

// Controller for TLP Feedback
exports.saveTLPFeedback = async function(req, res) {
    try {
        const { regulation, semester, academicYear, courseTitle, batch, feedback, overallAverage } = req.body;

        const existingFeedback = await TLPSurvey.findOne({ regulation, semester, academicYear, courseTitle, batch });

        if (existingFeedback) {
            existingFeedback.feedback = feedback;
            existingFeedback.overallAverage = overallAverage;
            await existingFeedback.save();
            res.status(200).json({ message: 'TLP Feedback updated successfully' });
        } else {
            const newFeedback = new TLPSurvey({
                regulation,
                semester,
                academicYear,
                courseTitle,
                batch,
                feedback,
                overallAverage
            });
            await newFeedback.save();
            res.status(201).json({ message: 'TLP Feedback saved successfully' });
        }
    } catch (error) {
        console.error('Error saving TLP Feedback:', error);
        res.status(500).json({ error: 'Failed to save TLP Feedback', details: error.message });
    }
};

exports.fetchTLPFeedback = async function(req, res) {
    try {
        const { regulation, semester, academicYear, courseTitle, batch } = req.query;
        const feedbackData = await TLPSurvey.findOne({ regulation, semester, academicYear, courseTitle, batch });
        res.status(200).json(feedbackData);
    } catch (error) {
        console.error('Error fetching TLP Feedback:', error);
        res.status(500).json({ error: 'Failed to fetch TLP Feedback', details: error.message });
    }
};

// Controller for Course End Survey
exports.saveCourseEndSurvey = async function(req, res) {
    try {
        const { regulation, semester, academicYear, courseTitle, batch, coPercentages } = req.body;

        const existingSurvey = await CourseEndSurvey.findOne({ regulation, semester, academicYear, courseTitle, batch });

        if (existingSurvey) {
            existingSurvey.coPercentages = coPercentages;
            await existingSurvey.save();
            res.status(200).json({ message: 'Course End Survey updated successfully' });
        } else {
            const newSurvey = new CourseEndSurvey({
                regulation,
                semester,
                academicYear,
                courseTitle,
                batch,
                coPercentages
            });
            await newSurvey.save();
            res.status(201).json({ message: 'Course End Survey saved successfully' });
        }
    } catch (error) {
        console.error('Error saving Course End Survey:', error);
        res.status(500).json({ error: 'Failed to save Course End Survey', details: error.message });
    }
};

exports.fetchCourseEndSurvey = async function(req, res) {
    try {
        const { regulation, semester, academicYear, courseTitle, batch } = req.query;
        const surveyData = await CourseEndSurvey.findOne({ regulation, semester, academicYear, courseTitle, batch });
        res.status(200).json(surveyData);
    } catch (error) {
        console.error('Error fetching Course End Survey:', error);
        res.status(500).json({ error: 'Failed to fetch Course End Survey', details: error.message });
    }
};