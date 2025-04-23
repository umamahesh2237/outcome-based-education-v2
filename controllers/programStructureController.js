const xlsx = require('xlsx');
const ProgramStructure = require('../models/ProgramStructure');
const path = require('path');
const fs = require('fs');

// Upload Program Structure
exports.uploadProgramStructure = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const sheet = workbook.Sheets[sheetName];

    // Read data with correct headers
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    console.log('Raw Data from Excel:', jsonData); // Debugging log

    if (!jsonData.length) {
      return res.status(400).json({ message: 'Excel file is empty or invalid' });
    }

    // Extract headers from first row
    const headers = jsonData[0];
    // Expected column headers (must match exactly)
    const expectedHeaders = [
      'courseCode', 'courseTitle', 'category', 'L', 'T', 'PD',
      'CIE', 'SEE', 'totalMarks', 'credits', 'batch',
      'academicYear', 'semester', 'regulation'
    ];

    if (!expectedHeaders.every((h, index) => h === headers[index])) {
      return res.status(400).json({ message: 'Excel file headers are incorrect. Please use the correct template.' });
    }

    // Map the Excel data correctly
    const mappedData = jsonData.slice(1).map(row => {
      let obj = {};
      headers.forEach((key, index) => {
        let value = row[index];
        if (['L', 'T', 'PD', 'CIE', 'SEE', 'totalMarks', 'credits'].includes(key)) {
          obj[key] = value === '-' ? 0 : value; 
        } else {
          obj[key] = value || '-';
        }        
      });
      return obj;
    });

    console.log('Mapped JSON Data:', mappedData); // Debugging log

    // Insert into MongoDB
    await ProgramStructure.insertMany(mappedData);

    // Delete file after processing
    fs.unlinkSync(filePath);

    res.status(200).json({ message: 'Program structure uploaded successfully' });

  } catch (err) {
    console.error('Error processing file:', err);
    res.status(500).json({ message: 'Error uploading program structure', error: err.message });
  }
};

// Download Template
exports.downloadTemplate = (req, res) => {
  const templatePath = path.join(__dirname, '../public/templates/program_structure_template.xlsx');

  if (!fs.existsSync(templatePath)) {
    return res.status(404).json({ message: 'Template file not found' });
  }

  res.download(templatePath, 'program_structure_template.xlsx');
};

// Fetch Program Structure
exports.fetchProgramStructure = async (req, res) => {
  try {
    const { batch, academicYear, semester, regulation } = req.query;

    if (!batch || !academicYear || !semester || !regulation) {
      return res.status(400).json({ message: 'Missing required parameters. Please provide batch, academicYear, semester, and regulation.' });
    }

    const programStructures = await ProgramStructure.find({
      batch: batch,
      academicYear: academicYear,
      semester: semester,
      regulation: regulation
    });

    if (!programStructures.length) {
      return res.status(404).json({ message: 'No records found for the selected criteria.' });
    }

    res.status(200).json(programStructures);

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Error fetching program structure', error: error.message });
  }
};