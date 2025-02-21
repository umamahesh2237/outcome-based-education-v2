// rubricMappingController.js
const RubricMapping = require('../models/RubricMapping');
const ExcelJS = require('exceljs');
const path = require('path');

// Controller to add rubric mapping
exports.addRubricMapping = async (req, res) => {
  const { category, rubric, outcomes, totalMarks } = req.body;

  if (!category || !rubric || !outcomes || !totalMarks) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const rubricMapping = new RubricMapping({ category, rubric, outcomes, totalMarks });
    await rubricMapping.save();
    res.status(201).json({ message: 'Rubric added successfully' });
  } catch (err) {
    console.error('Error adding rubric:', err.message);
    res.status(500).json({ error: 'Failed to add rubric', details: err.message });
  }
};

// Controller to generate rubric excel template
exports.generateRubricExcelTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rubric Template');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'RollNo', key: 'rollNo', width: 15 },
      { header: 'SubjectTitle', key: 'subjectTitle', width: 25 },
      { header: 'CourseCode', key: 'courseCode', width: 15 },
      { header: 'Rubric1', key: 'rubric1', width: 15 },
      { header: 'Rubric2', key: 'rubric2', width: 15 },
      { header: 'Rubric3', key: 'rubric3', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true };

    worksheet.addRow({
      name: 'John Doe',
      rollNo: '12345',
      subjectTitle: 'Mathematics',
      courseCode: 'MATH101',
      rubric1: '',
      rubric2: '',
      rubric3: ''
    });

    const filePath = path.join(__dirname, '..', 'templates', 'rubric_template.xlsx');
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, 'rubric_template.xlsx', (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('Error downloading the file');
      }
    });
  } catch (error) {
    console.error('Error generating rubric template:', error);
    res.status(500).json({ error: 'Failed to generate rubric template', details: error.message });
  }
};