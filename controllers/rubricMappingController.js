const RubricMapping = require('../models/RubricMapping');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Controller to add rubric mapping
exports.addRubricMapping = async (req, res) => {
  const { category, rubric, mappedCOs, marks, weightage, assessmentType } = req.body;

  if (!category || !rubric || !mappedCOs || !marks || !weightage || !assessmentType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (isNaN(marks) || marks <= 0) {
    return res.status(400).json({ message: 'Marks must be a positive number' });
  }

  if (isNaN(weightage) || weightage < 0 || weightage > 100) {
    return res.status(400).json({ message: 'Weightage must be between 0 and 100' });
  }

  try {
    // Check if the rubric mapping already exists
    const existingMapping = await RubricMapping.findOne({ 
      category, 
      rubric, 
      assessmentType 
    });
    
    if (existingMapping) {
      return res.status(400).json({ message: 'Rubric already exists for this category and assessment type' });
    }

    const rubricMapping = new RubricMapping({ 
      category, 
      rubric, 
      mappedCOs, 
      marks, 
      weightage, 
      assessmentType 
    });
    
    await rubricMapping.save();
    res.status(201).json({ message: 'Rubric added successfully' });
  } catch (err) {
    console.error('Error adding rubric:', err.message);
    res.status(500).json({ error: 'Failed to add rubric', details: err.message });
  }
};

// Controller to generate rubric excel template
exports.generateRubricExcelTemplate = async (req, res) => {
  const { assessmentType, category } = req.query;
  
  if (!assessmentType || !category) {
    return res.status(400).json({ message: 'Assessment type and category are required' });
  }
  
  try {
    const rubrics = await RubricMapping.find({ assessmentType, category });
    
    if (rubrics.length === 0) {
      return res.status(404).json({ message: `No ${assessmentType} rubrics found for ${category} category` });
    }

    // Calculate total weightage
    const totalWeightage = rubrics.reduce((sum, r) => sum + r.weightage, 0);
    
    if (totalWeightage !== 100) {
      return res.status(400).json({ 
        message: `Total weightage for ${category} ${assessmentType} assessment must be 100%. Current total: ${totalWeightage}%` 
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${category} ${assessmentType} Assessment`);

    // Dynamic column creation based on rubrics
    let rubricColumns = rubrics.map((r, index) => ({
      header: `${r.rubric} (${r.marks} marks)`,
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

    const filePath = path.join(__dirname, '..', 'templates', `${category.toLowerCase()}_${assessmentType.toLowerCase()}_assessment_template.xlsx`);
    
    // Ensure the templates directory exists
    const templatesDir = path.join(__dirname, '..', 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }
    
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, `${category}_${assessmentType}_Assessment_Template.xlsx`, (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('Error downloading the file');
      }
      // Delete file after sending
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }, 5000);
    });
  } catch (error) {
    console.error('Error generating rubric template:', error);
    res.status(500).json({ error: 'Failed to generate rubric template', details: error.message });
  }
};

// Controller to get all rubrics by category and assessment type
exports.getRubricsByCategoryAndType = async (req, res) => {
  const { category, assessmentType } = req.query;
  
  try {
    const query = {};
    if (category) query.category = category;
    if (assessmentType) query.assessmentType = assessmentType;
    
    const rubrics = await RubricMapping.find(query);
    res.status(200).json(rubrics);
  } catch (error) {
    console.error('Error fetching rubrics:', error);
    res.status(500).json({ error: 'Failed to fetch rubrics', details: error.message });
  }
};

// Controller to delete a rubric
exports.deleteRubric = async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ message: 'Rubric ID is required' });
  }
  
  try {
    const result = await RubricMapping.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Rubric not found' });
    }
    
    res.status(200).json({ message: 'Rubric deleted successfully' });
  } catch (error) {
    console.error('Error deleting rubric:', error);
    res.status(500).json({ error: 'Failed to delete rubric', details: error.message });
  }
};