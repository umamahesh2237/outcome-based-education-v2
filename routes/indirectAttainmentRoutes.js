const express = require('express');
const router = express.Router();
const { saveTLPFeedback, fetchTLPFeedback, saveCourseEndSurvey, fetchCourseEndSurvey } = require('../controllers/indirectAttainmentController'); // Correct CommonJS import

// Routes for TLP Feedback
router.post('/tlp-feedback/save', saveTLPFeedback);
router.get('/tlp-feedback/fetch', fetchTLPFeedback);

// Routes for Course End Survey
router.post('/course-end-survey/save', saveCourseEndSurvey);
router.get('/course-end-survey/fetch', fetchCourseEndSurvey);

module.exports = router;