const RubricMapping = require('../models/RubricMapping');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Controller to add rubric mapping
exports.addRubricMapping = async (req, res) => {
  const { category, rubric, outcomes, totalMarks } = req.body;

  if (!category || !rubric || !outcomes || !totalMarks) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (isNaN(totalMarks) || totalMarks <= 0) {
    return res.status(400).json({ message: 'Total marks must be a positive number' });
  }

  try {
    // Check if the rubric mapping already exists
    const existingMapping = await RubricMapping.findOne({ category, rubric });
    if (existingMapping) {
      return res.status(400).json({ message: 'Rubric already exists for this category' });
    }

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
    const rubrics = await RubricMapping.find({});
    if (rubrics.length === 0) {
      return res.status(404).json({ message: 'No rubrics found' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rubric Template');

    // Dynamic column creation based on rubrics
    let rubricColumns = rubrics.map((r, index) => ({
      header: `Rubric${index + 1} (${r.totalMarks} marks)`,
      key: `rubric${index + 1}`,
      width: 15
    }));

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'RollNo', key: 'rollNo', width: 15 },
      { header: 'SubjectTitle', key: 'subjectTitle', width: 25 },
      { header: 'CourseCode', key: 'courseCode', width: 15 },
      ...rubricColumns
    ];

    worksheet.getRow(1).font = { bold: true };

    const filePath = path.join(__dirname, '..', 'templates', 'rubric_template.xlsx');
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, 'rubric_template.xlsx', (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('Error downloading the file');
      }
      // Delete file after sending
      setTimeout(() => fs.unlinkSync(filePath), 5000);
    });
  } catch (error) {
    console.error('Error generating rubric template:', error);
    res.status(500).json({ error: 'Failed to generate rubric template', details: error.message });
  }
};