const express = require('express');
const multer = require('multer');
const path = require('path');
const programStructureController = require('../controllers/programStructureController');
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: function(req, file, cb) {
    cb(null, 'program-structure-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = function(req, file, cb) {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

// Routes
router.post('/upload', upload.single('file'), programStructureController.uploadProgramStructure);
router.get('/download-template', programStructureController.downloadTemplate);
router.get('/fetch', programStructureController.fetchProgramStructure);

module.exports = router;