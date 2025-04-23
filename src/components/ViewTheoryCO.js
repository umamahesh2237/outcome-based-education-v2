import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Auth.css';
import * as XLSX from 'xlsx';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ViewTheoryCO = () => {
  const [filters, setFilters] = useState({
    regulation: '',
    semester: '',
    category: '',
    courseTitle: '',
  });
  const [tempCO, setTempCO] = useState({});
  const [courseTitles, setCourseTitles] = useState([]);
  const [courseOutcomes, setCourseOutcomes] = useState(null);
  const [editingCO, setEditingCO] = useState(null);
  const [rubrics, setRubrics] = useState([]);
  const [newRubric, setNewRubric] = useState({
    category: '',
    rubric: '',
    mappedCOs: '',
    marks: '',
    weightage: '',
    assessmentType: 'Direct'
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showMarksheet, setShowMarksheet] = useState(false);
  const [marksheetData, setMarksheetData] = useState([]);
  const [rubricsByCategory, setRubricsByCategory] = useState({});
  const [weightageError, setWeightageError] = useState({});

  useEffect(() => {
    if (filters.regulation && filters.semester && filters.category) {
      axios.get(`${API_BASE_URL}/api/courses/by-regulation-semester`, { params: filters })
        .then((response) => setCourseTitles(response.data))
        .catch(() => setCourseTitles([]));
    }
  }, [filters]);

  useEffect(() => {
    // Calculate total weightage for each category and assessment type
    const errors = {};
    
    Object.keys(rubricsByCategory).forEach(category => {
      const directRubrics = rubricsByCategory[category].filter(r => r.assessmentType === 'Direct');
      const indirectRubrics = rubricsByCategory[category].filter(r => r.assessmentType === 'Indirect');
      
      const directTotal = directRubrics.reduce((sum, r) => sum + Number(r.weightage), 0);
      const indirectTotal = indirectRubrics.reduce((sum, r) => sum + Number(r.weightage), 0);
      
      errors[category] = {
        Direct: directRubrics.length > 0 && directTotal !== 100,
        Indirect: indirectRubrics.length > 0 && indirectTotal !== 100
      };
    });
    
    setWeightageError(errors);
  }, [rubricsByCategory]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const fetchCourseOutcomes = () => {
    if (!filters.regulation || !filters.semester || !filters.category || !filters.courseTitle) {
      setCourseOutcomes(null);
      return;
    }
    axios.get(`${API_BASE_URL}/api/course-outcomes/fetch`, { params: filters })
      .then((response) => {
        if (JSON.stringify(response.data) !== JSON.stringify(courseOutcomes)) {
          setTempCO(response.data);
          setCourseOutcomes(response.data);
        }
      })
      .catch(() => setCourseOutcomes(null));
  };

  const handleRubricChange = (e) => {
    const { name, value } = e.target;
    setNewRubric({ ...newRubric, [name]: value });
  };

  const addRubric = () => {
    if (newRubric.category && newRubric.rubric && newRubric.mappedCOs && newRubric.marks && newRubric.weightage && newRubric.assessmentType) {
      const rubricToAdd = {
        ...newRubric,
        id: Date.now(), // Add a unique ID for each rubric
        rubricTitle: newRubric.rubric // Use the selected rubric value directly
      };
      
      // Check if the rubric already exists in the category
      const categoryRubrics = rubricsByCategory[newRubric.category] || [];
      const rubricExists = categoryRubrics.some(r => 
        r.rubric === newRubric.rubric && 
        r.assessmentType === newRubric.assessmentType
      );
      
      if (rubricExists) {
        alert(`Rubric "${newRubric.rubric}" already exists for ${newRubric.assessmentType} assessment in ${newRubric.category} category.`);
        return;
      }
      
      // Add to the overall rubrics list
      setRubrics([...rubrics, rubricToAdd]);
      
      // Add to the category-specific list
      setRubricsByCategory(prev => ({
        ...prev,
        [newRubric.category]: [...(prev[newRubric.category] || []), rubricToAdd]
      }));
      
      // Reset the form
      setNewRubric({
        category: '',
        rubric: '',
        mappedCOs: '',
        marks: '',
        weightage: '',
        assessmentType: 'Direct'
      });
    } else {
      alert('All fields are required');
    }
  };

  const deleteRubric = (category, rubricId) => {
    // Remove from category-specific list
    setRubricsByCategory(prev => ({
      ...prev,
      [category]: prev[category].filter(r => r.id !== rubricId)
    }));
    
    // Remove from overall rubrics list
    setRubrics(prev => prev.filter(r => r.id !== rubricId));
  };

  const generateExcelTemplate = useCallback((category, assessmentType) => {
    // Check if weightage adds up to 100%
    const categoryRubrics = rubricsByCategory[category].filter(r => r.assessmentType === assessmentType);
    const totalWeightage = categoryRubrics.reduce((sum, r) => sum + Number(r.weightage), 0);
    
    if (totalWeightage !== 100) {
      alert(`Total weightage for ${category} ${assessmentType} assessment must be 100%. Current total: ${totalWeightage}%`);
      return;
    }
    
    const wsData = [
      ['Name', 'RollNo', 'SubjectTitle', 'CourseCode', ...categoryRubrics.map(r => `${r.rubricTitle} (${r.marks})`)]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${category} ${assessmentType} Assessment`);
    XLSX.writeFile(wb, `${category}_${assessmentType}_Assessment_Template.xlsx`);
  }, [rubricsByCategory]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setMarksheetData(jsonData);
        setUploadedFile(file);
        alert('File has been saved and parsed successfully');
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleEdit = (co, desc) => {
    setEditingCO(co);
  };

  const handleSave = async (co, e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/course-outcomes/update`, {
        courseOutcomes,
        filters,
      });
      setTempCO(courseOutcomes);
      alert('Course outcome updated successfully');
      setEditingCO(null);
    } catch (error) {
      alert('Error updating course outcome');
    }
  };

  const handleCancel = (co) => {
    setEditingCO(null);
    setCourseOutcomes(tempCO);
  };

  const handleDelete = async (co, e) => {
    e.preventDefault();
    
    // Create a new object without the deleted CO
    const updatedCourseOutcomes = { ...courseOutcomes };
    delete updatedCourseOutcomes[co];
    
    try {
      await axios.post(`${API_BASE_URL}/api/course-outcomes/update`, {
        courseOutcomes: updatedCourseOutcomes, // Send the updated object
        filters,
      });
      
      setTempCO(updatedCourseOutcomes);
      setCourseOutcomes(updatedCourseOutcomes); // Update state with the new object
      alert('Course outcome deleted successfully');
      setEditingCO(null);
    } catch (error) {
      alert('Error updating course outcome');
    }
  };

  return (
    <div>
      <form className="regulation-form">
        <h5>Choose filters to fetch the course outcomes:</h5>
        <hr />
        <div className="regulation-inputs">
          <div className="input-field">
            <label>Regulation</label>
            <select name="regulation" value={filters.regulation} onChange={handleFilterChange}>
              <option value="">Select</option>
              <option value="AR20">AR20</option>
              <option value="AR22">AR22</option>
            </select>
          </div>
          <div className="input-field">
            <label>Semester</label>
            <select name="semester" value={filters.semester} onChange={handleFilterChange}>
              <option value="">Select</option>
              {["I-I", "I-II", "II-I", "II-II", "III-I", "III-II", "IV-I", "IV-II"].map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">Select</option>
              {["HSMC", "PCC", "MC", "ESC", "PROJ", "BSC", "OEC", "PEC"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
            <label>Course Title</label>
            <select name="courseTitle" value={filters.courseTitle} onChange={handleFilterChange}>
              <option value="">Select</option>
              {courseTitles.map((course) => (
                filters.category === course.category && (
                  <option key={course.courseCode} value={course.courseTitle}>{course.courseTitle}</option>
                )
              ))}
            </select>
          </div>
        </div>
        <button type="button" onClick={fetchCourseOutcomes} className="submit-button">
          <b>Fetch Course Outcomes</b>
        </button>
      </form>
      <br />
      <div className="regulation-form">
        <h5>View and modify course outcomes:</h5>
        <hr />
        {courseOutcomes ? (
          <div className="table-responsive mt-4">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Course Outcome</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(courseOutcomes)
                  .filter(([co, desc]) => co !== '_id' && desc.trim() !== '')
                  .map(([co, desc]) => (
                    <tr key={co}>
                      <td>{co}</td>
                      <td>
                        {editingCO === co ? (
                          <input
                            type="text"
                            value={desc}
                            onChange={(e) =>
                              setCourseOutcomes((prev) => ({
                                ...prev,
                                [co]: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          desc
                        )}
                      </td>
                      <td className="action-column">
                        {editingCO === co ? (
                          <div className="button-group">
                            <button type="button" className="submit-button" onClick={(e) => handleSave(co, e)}>
                              <b>Save</b>
                            </button>
                            <button type="button" className="add-button" onClick={(e) => handleCancel(co)}>
                              <b>Cancel</b>
                            </button>
                          </div>
                        ) : (
                          <div className="button-group">
                            <button type="button" className="submit-button" onClick={() => handleEdit(co, desc)}>
                              <b>Edit</b>
                            </button>
                            <button type="button" className="delete-button" onClick={(e) => handleDelete(co, e)}>
                              <b>Delete</b>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p align="center">No outcomes for the selected criteria</p>
        )}
      </div>
      <br />
      <div className="regulation-form">
        <h5>Map COs with rubrics:</h5>
        <hr />
        <div className="regulation-inputs">
          <div className="input-field">
            <label>Category</label>
            <select name="category" value={newRubric.category} onChange={handleRubricChange}>
              <option value="">Select</option>
              {["HSMC", "PCC", "MC", "ESC", "PROJ", "BSC", "OEC", "PEC"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
            <label>Rubric</label>
            <select name="rubric" value={newRubric.rubric} onChange={handleRubricChange}>
              <option value="">Select</option>
              {["Rubric 1", "Rubric 2", "Rubric 3", "Rubric 4", "Rubric 5", "Rubric 6"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
            <label>Mapped CO(s)</label>
            <input
              name="mappedCOs"
              placeholder="Enter. Eg.: o1,o2"
              value={newRubric.mappedCOs}
              onChange={handleRubricChange}
            />
          </div>
          <div className="input-field">
            <label>Total Marks</label>
            <input
              name="marks"
              type="number"
              placeholder="Enter"
              value={newRubric.marks}
              onChange={handleRubricChange}
            />
          </div>
          <div className="input-field">
            <label>Weightage (in %)</label>
            <input
              name="weightage"
              type="number"
              placeholder="Enter weightage"
              value={newRubric.weightage}
              onChange={handleRubricChange}
            />
          </div>
          <div className="input-field">
            <label>Assessment Type</label>
            <select name="assessmentType" value={newRubric.assessmentType} onChange={handleRubricChange}>
              <option value="Direct">Direct</option>
              <option value="Indirect">Indirect</option>
            </select>
          </div>
        </div>
        <button type="button" onClick={addRubric} className="add-button">
          <b>Add Rubric</b>
        </button>

        {Object.keys(rubricsByCategory).map(category => (
          <div key={category}>
            <h5 className="mt-4">{category} Category Rubrics</h5>
            
            {/* Direct Assessment Rubrics */}
            {rubricsByCategory[category].filter(r => r.assessmentType === 'Direct').length > 0 && (
              <div className="table-responsive mt-4">
                <h6>Direct Assessment</h6>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Rubric</th>
                      <th>Outcome</th>
                      <th>Marks</th>
                      <th>Weightage (%)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rubricsByCategory[category]
                      .filter(r => r.assessmentType === 'Direct')
                      .map((r) => (
                        <tr key={r.id}>
                          <td>{r.rubricTitle}</td>
                          <td>{r.mappedCOs}</td>
                          <td>{r.marks}</td>
                          <td>{r.weightage}%</td>
                          <td>
                            <button 
                              type="button" 
                              className="delete-button" 
                              onClick={() => deleteRubric(category, r.id)}
                            >
                              <b>Delete</b>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {weightageError[category]?.Direct && (
                  <p className="error-text">Total weightage must be 100%. Current total: 
                    {rubricsByCategory[category]
                      .filter(r => r.assessmentType === 'Direct')
                      .reduce((sum, r) => sum + Number(r.weightage), 0)}%
                  </p>
                )}
                <button 
                  type="button" 
                  onClick={() => generateExcelTemplate(category, 'Direct')} 
                  className="submit-button"
                  disabled={weightageError[category]?.Direct}
                >
                  <b>Generate {category} Direct Assessment Excel Template</b>
                </button>
              </div>
            )}

            {/* Indirect Assessment Rubrics */}
            {rubricsByCategory[category].filter(r => r.assessmentType === 'Indirect').length > 0 && (
              <div className="table-responsive mt-4">
                <h6>Indirect Assessment</h6>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Rubric</th>
                      <th>Outcome</th>
                      <th>Marks</th>
                      <th>Weightage (%)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rubricsByCategory[category]
                      .filter(r => r.assessmentType === 'Indirect')
                      .map((r) => (
                        <tr key={r.id}>
                          <td>{r.rubricTitle}</td>
                          <td>{r.mappedCOs}</td>
                          <td>{r.marks}</td>
                          <td>{r.weightage}%</td>
                          <td>
                            <button 
                              type="button" 
                              className="delete-button" 
                              onClick={() => deleteRubric(category, r.id)}
                            >
                              <b>Delete</b>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {weightageError[category]?.Indirect && (
                  <p className="error-text">Total weightage must be 100%. Current total: 
                    {rubricsByCategory[category]
                      .filter(r => r.assessmentType === 'Indirect')
                      .reduce((sum, r) => sum + Number(r.weightage), 0)}%
                  </p>
                )}
                <button 
                  type="button" 
                  onClick={() => generateExcelTemplate(category, 'Indirect')} 
                  className="submit-button"
                  disabled={weightageError[category]?.Indirect}
                >
                  <b>Generate {category} Indirect Assessment Excel Template</b>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <br />
      <div className="regulation-form">
        <h5>Upload and view marksheet:</h5>
        <hr />
        <div className="upload-section">
          <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" />
          {uploadedFile && (
            <button type="button" onClick={() => setShowMarksheet(true)} className="add-button">
              View marksheet
            </button>
          )}
        </div>

        {showMarksheet && marksheetData.length > 0 && (
          <div className="table-responsive mt-4">
            <table className="table table-striped">
              <thead>
                <tr>
                  {Object.keys(marksheetData[0]).map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marksheetData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTheoryCO;