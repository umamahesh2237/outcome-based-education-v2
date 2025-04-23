require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/loginSystem';

// Connect to MongoDB with error handling
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const assignmentAttainmentRoutes = require('./routes/assignmentAttainment');
const copoMappingRoutes = require('./routes/copoMapping');
const courseOutcomeRoutes = require('./routes/courseOutcomes');
const courseRoutes = require('./routes/courseRoutes');
const endExamAttainmentRoutes = require('./routes/endExamAttainment');
const objectiveAttainmentRoutes = require('./routes/objectiveAttainment');
const programStructureRoutes = require('./routes/programStructure');
const regulationRoutes = require('./routes/regulationRoutes');
const rubricMappingRoutes = require('./routes/rubricMapping');
const userRoutes = require('./routes/userRoutes');
const subjectiveAttainmentRoutes = require('./routes/subjectiveAttainment');
const presentationAttainmentRoutes = require('./routes/presentationAttainment');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/regulations', regulationRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/course-outcomes', courseOutcomeRoutes);
app.use('/api/program-structure', programStructureRoutes);
app.use('/api/rubric-mapping', rubricMappingRoutes);
app.use('/api/assignment-attainment', assignmentAttainmentRoutes);
app.use('/api/end-exam-attainment', endExamAttainmentRoutes);
app.use('/api/objective-attainment', objectiveAttainmentRoutes);
app.use('/api/subjective-attainment', subjectiveAttainmentRoutes);
app.use('/api/copo-mapping', copoMappingRoutes);
app.use('/api/presentation-attainment', presentationAttainmentRoutes);

// Serve static files (for deployment)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));