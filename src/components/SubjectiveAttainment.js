import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Auth.css'; // Ensure the CSS file is in the same directory

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SubjectiveAttainment = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [filters, setFilters] = useState({
    regulation: '',
    semester: '',
    category: '',
    courseTitle: ''
  });
  const [batch, setBatch] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [courseTitles, setCourseTitles] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [marks, setMarks] = useState([]);
    const [maxMarks] = useState({
        subjective1: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5, Q6: 5 },
        subjective2: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5, Q6: 5 }
    });
  const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Added loading state

  // Generate batch options (2021-2030)
  const batchOptions = Array.from({ length: 10 }, (_, i) => (2021 + i).toString());

  // Update academic years when batch changes
  useEffect(() => {
    if (batch) {
      const years = Array.from({ length: 4 }, (_, i) => `${parseInt(batch) + i}-${parseInt(batch) + i + 1}`);
      setAcademicYears(years);
    } else {
      setAcademicYears([]);
    }
  }, [batch]);

  // Fetch course titles when regulation, semester, and category change
  useEffect(() => {
        const fetchCourses = async () => {
            if (filters.regulation && filters.semester && filters.category) {
                setLoading(true); // Start loading
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/courses/by-regulation-semester`, { params: filters });
                    setCourseTitles(response.data);
                } catch (error) {
                    console.error('Error fetching course titles:', error);
                    setCourseTitles([]);
                    setError('Failed to load course titles.'); // Set error message
                } finally {
                    setLoading(false); // Stop loading
                }
            }
        };
        fetchCourses();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'category') {
      setFilters(prev => ({ ...prev, courseTitle: '' }));
    }
  };

  const handleBatchChange = (e) => {
    setBatch(e.target.value);
    setAcademicYear('');
  };

  const handleAcademicYearChange = (e) => {
    setAcademicYear(e.target.value);
  };

    useEffect(() => {
        const fetchCourseData = async () => {
            if (filters.courseTitle && filters.semester && batch && academicYear) {
                setLoading(true); // Start loading
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/course-outcomes/fetch`, { params: filters });
                    const outcomes = Object.entries(response.data)
                        .filter(([key, value]) => key !== '_id' && value.trim() !== '')
                        .map(([key]) => key);
                    setCourseOutcomes(outcomes);

                    // Initialize mappings
                    const initialMappings = ['Subjective-1', 'Subjective-2'].map(exam => ({
                        examNumber: exam,
                        questions: Array.from({ length: 6 }, (_, i) => ({
                            questionNumber: `Q${i + 1}`,
                            maxMarks: 5,
                            coMappings: outcomes.map(co => ({
                                coNumber: co,
                                value: '-'
                            }))
                        }))
                    }));
                    setMappings(initialMappings);

                    // Initialize marks with 300 empty rows
                    const initialMarks = Array.from({ length: 300 }, (_, index) => ({
                        sNo: index + 1,
                        rollNo: '',
                        subjective1: { Q1: '', Q2: '', Q3: '', Q4: '', Q5: '', Q6: '' },
                        subjective2: { Q1: '', Q2: '', Q3: '', Q4: '', Q5: '', Q6: '' }
                    }));
                    setMarks(initialMarks);

                    const fetchExistingData = async () => {
                        try {
                            const [mappingRes, marksRes] = await Promise.all([
                                axios.get(`${API_BASE_URL}/api/subjective-attainment/fetch`, {
                                    params: { ...filters, batch, academicYear }
                                }),
                                axios.get(`${API_BASE_URL}/api/subjective-attainment/marks/fetch`, {
                                    params: { ...filters, batch, academicYear }
                                })
                            ]);

                            if (mappingRes.data) {
                                setMappings(mappingRes.data.mappings);
                            }

                            if (marksRes.data) {
                                const existingMarks = marksRes.data.marks;
                                // Ensure existingMarks is an array before mapping
                                if (Array.isArray(existingMarks)) {
                                    setMarks(prevMarks =>
                                        prevMarks.map((row, index) => ({
                                            ...row,
                                            ...(existingMarks[index] || {})
                                        }))
                                    );
                                } else {
                                    setError('Error: The existing marks data is not an array.');
                                    console.error('Error: The existing marks data is not an array.', existingMarks);
                                }
                            }
                        } catch (err) {
                            if (err.response?.status === 404) {
                                setError('No existing data found for the selected Batch and Academic Year.');
                            } else {
                                console.error('Error fetching existing data:', err);
                                setError('Error fetching existing data');
                            }
                        }
                    };
                    fetchExistingData();
                    setError(null);
                } catch (err) {
                    setError('Error fetching course data');
                    console.error(err);
                    setCourseOutcomes([]);
                    setMappings([]);
                    setMarks([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setCourseOutcomes([]);
                setMappings([]);
                setMarks([]);
            }
        };
        fetchCourseData();
    }, [filters, batch, academicYear]);

  const handleMappingChange = (examIndex, questionIndex, coIndex, value) => {
    setMappings(prevMappings => {
      const newMappings = [...prevMappings];
      if (newMappings[examIndex]?.questions[questionIndex]?.coMappings[coIndex]) {
        newMappings[examIndex].questions[questionIndex].coMappings[coIndex].value = value === '' ? '-' : value;
      }
      return newMappings;
    });
  };

  const handleMarkChange = (index, exam, question, value) => {
    const newValue = value === '' ? '' : value;
    const numValue = value === '' ? '' : Number(value);

    // Check if value exceeds max marks
    if (numValue !== '') {
        const maxMark = maxMarks[exam]?.[question];
        if (maxMark !== undefined && numValue > maxMark) {
            alert(`Value cannot exceed maximum marks (${maxMark})`);
            return;
        }
    }

    setMarks(prevMarks => {
        const newMarks = [...prevMarks];
        if (newMarks[index]) {
            newMarks[index] = {
                ...newMarks[index],
                [exam]: {
                    ...newMarks[index][exam],
                    [question]: newValue
                },
                ...(exam === 'rollNo' && { rollNo: newValue })
            };
        }
        return newMarks;
    });
};

  const addMoreRows = () => {
    setMarks(prevMarks => [
      ...prevMarks,
      ...Array.from({ length: 10 }, (_, index) => ({
        sNo: prevMarks.length + index + 1,
        rollNo: '',
        subjective1: {
          Q1: '', Q2: '', Q3: '', Q4: '', Q5: '', Q6: ''
        },
        subjective2: {
          Q1: '', Q2: '', Q3: '', Q4: '', Q5: '', Q6: ''
        }
      }))
    ]);
  };

  const saveMapping = async () => {
    if (!batch || !academicYear) {
      setError('Please select batch and academic year to save mapping');
      return;
    }
    if (!filters.courseTitle) {
      setError('Please select a course title to save mapping');
      return;
    }
        setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/subjective-attainment/save`, {
        regulation: filters.regulation,
        semester: filters.semester,
        academicYear,
        courseName: filters.courseTitle,
        batch,
        mappings
      });
      alert('Subjective mapping saved successfully!');
      setError(null);
    } catch (err) {
      setError('Error saving mapping');
      console.error(err);
    } finally {
            setLoading(false);
        }
  };

  const saveMarks = async () => {
    if (!batch || !academicYear) {
      setError('Please select batch and academic year to save marks');
      return;
    }
    if (!filters.courseTitle) {
      setError('Please select a course title to save marks');
      return;
    }
        setLoading(true);
    try {
      const validMarks = marks.filter(m => m.rollNo !== '');
      await axios.post(`${API_BASE_URL}/api/subjective-attainment/marks/save`, {
        ...filters,
        batch,
        academicYear,
        marks: validMarks
      });
      alert('Subjective marks saved successfully!');
      setError(null);
    } catch (err) {
      setError('Error saving marks');
      console.error(err);
    } finally {
            setLoading(false);
        }
  };

  const calculateAttainments = () => {
        const validMarks = marks.filter(m => m.rollNo !== '');
        const totalStudents = validMarks.length;
        const questions = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'];

        const attainments = ['subjective1', 'subjective2'].map(exam =>
            questions.map(q => {
                const maxMark = maxMarks[exam]?.[q];
                const target = maxMark * 0.6;

                const studentsAttempted = validMarks.filter(m => m[exam]?.[q] !== '').length;
                const studentsNotAttempted = totalStudents - studentsAttempted;
                const studentsReachingTarget = validMarks.filter(m =>
                    m[exam]?.[q] !== '' && Number(m[exam][q]) >= target
                ).length;

                const attainmentPercentage = studentsAttempted ?
                    (studentsReachingTarget / studentsAttempted) * 100 : 0;

                let attainmentLevel = 0;
                if (attainmentPercentage >= 80) attainmentLevel = 3;
                else if (attainmentPercentage >= 70) attainmentLevel = 2;
                else if (attainmentPercentage >= 60) attainmentLevel = 1;

                return {
                    target,
                    studentsReachingTarget,
                    studentsNotAttempted,
                    studentsAttempted,
                    attainmentPercentage: attainmentPercentage.toFixed(2),
                    attainmentLevel
                };
            })
        );

        return attainments;
    };

  const renderFilters = () => (
    <div className="regulation-inputs">
      <div className="input-field">
        <label>Regulation</label>
        <select name="regulation" value={filters.regulation} onChange={handleFilterChange} disabled={loading}>
          <option value="">Select</option>
          <option value="AR20">AR20</option>
          <option value="AR22">AR22</option>
        </select>
      </div>
      <div className="input-field">
        <label>Semester</label>
        <select name="semester" value={filters.semester} onChange={handleFilterChange} disabled={loading}>
          <option value="">Select</option>
          {["I-I", "I-II", "II-I", "II-II", "III-I", "III-II", "IV-I", "IV-II"].map(sem => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>
      </div>
      <div className="input-field">
        <label>Category</label>
        <select name="category" value={filters.category} onChange={handleFilterChange} disabled={loading}>
          <option value="">Select</option>
          {["HSMC", "PCC", "MC", "ESC", "PROJ", "BSC", "OEC", "PEC"].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="input-field">
        <label>Course Title</label>
        <select name="courseTitle" value={filters.courseTitle} onChange={handleFilterChange} disabled={loading}>
          <option value="">Select</option>
          {courseTitles.map(course => (
            <option key={course.courseCode} value={course.courseTitle}>
              {course.courseTitle}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderBatchAcademicYear = () => (
    <div className="regulation-inputs mt-3">
      <div className="input-field">
        <label>Batch</label>
        <select name="batch" value={batch} onChange={handleBatchChange} disabled={loading}>
          <option value="">Select</option>
          {batchOptions.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div className="input-field">
        <label>Academic Year</label>
        <select name="academicYear" value={academicYear} onChange={handleAcademicYearChange} disabled={loading}>
          <option value="">Select</option>
          {academicYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderMappingComponent = () => (
    <div>
      {renderBatchAcademicYear()}
      <div className="table-responsive mt-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th rowSpan="2">Exam</th>
              <th rowSpan="2">Question</th>
              <th rowSpan="2">Maximum Marks</th>
              {courseOutcomes.map(co => (
                <th key={co}>{co}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mappings.map((exam, examIndex) => (
              exam.questions.map((question, questionIndex) => (
                <tr key={`${exam.examNumber}-${question.questionNumber}`}>
                  {questionIndex === 0 && (
                    <td rowSpan="6">{exam.examNumber}</td>
                  )}
                  <td>{question.questionNumber}</td>
                  <td>{question.maxMarks}</td>
                  {question.coMappings.map((coMapping, coIndex) => (
                    <td key={coMapping.coNumber}>
                      <select
                        value={coMapping.value}
                        onChange={(e) => handleMappingChange(examIndex, questionIndex, coIndex, e.target.value)}
                        className="form-select form-select-sm"
                        disabled={loading}
                      >
                        <option value="-">-</option>
                        <option value="1">1</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))
            ))}
          </tbody>
        </table>
                {loading ? (
                    <p>Loading...</p> // Simple loading indicator
                ) : (
                    <button className="submit-button" onClick={saveMapping} disabled={loading}>
                        <b>Save Mapping</b>
                    </button>
                )}
      </div>
    </div>
  );

  const renderMarksComponent = () => (
    <div>
      {renderBatchAcademicYear()}
      <div className="table-responsive mt-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th rowSpan="2">S. No.</th>
              <th rowSpan="2">Roll No.</th>
              <th colSpan="6">Subjective-1</th>
              <th colSpan="6">Subjective-2</th>
            </tr>
            <tr>
              {Array.from({ length: 6 }, (_, i) => `Q${i + 1}`).map(q => (
                <th key={`sub1-${q}`}>{q}</th>
              ))}
              {Array.from({ length: 6 }, (_, i) => `Q${i + 1}`).map(q => (
                <th key={`sub2-${q}`}>{q}</th>
              ))}
            </tr>
            <tr>
              <td colSpan="2">Maximum Marks</td>
              {Object.values(maxMarks.subjective1).map((mark, i) => (
                <td key={`max1-${i}`}>{mark}</td>
              ))}
              {Object.values(maxMarks.subjective2).map((mark, i) => (
                <td key={`max2-${i}`}>{mark}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {marks.map((row, index) => (
              <tr key={index}>
                <td>{row.sNo}</td>
                <td>
                  <input
                    type="text"
                    value={row.rollNo}
                    onChange={(e) => handleMarkChange(index, 'rollNo', null, e.target.value)}
                    className="form-control form-control-sm"
                    disabled={loading}
                  />
                </td>
                {['subjective1', 'subjective2'].map(exam => (
                  Array.from({ length: 6 }, (_, i) => `Q${i + 1}`).map(q => (
                    <td key={`${exam}-${q}`}>
                      <input
                        type="number"
                        value={row[exam][q]}
                        onChange={(e) => handleMarkChange(index, exam, q, e.target.value)}
                        className="form-control form-control-sm"
                        min="0"
                        max={maxMarks[exam][q]}
                        disabled={loading}
                      />
                    </td>
                  ))
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="d-flex justify-content-between mt-3">
          <button className="add-button" onClick={addMoreRows} disabled={loading}>
            <b>Add More Rows</b>
          </button>
                    {loading ? (
                        <p>Loading...</p> // Simple loading indicator
                    ) : (
                        <button className="submit-button" onClick={saveMarks} disabled={loading}>
                            <b>Save Marks</b>
                        </button>
                    )}
        </div>
      </div>
    </div>
  );

    const renderAttainmentsComponent = () => {
        const attainments = calculateAttainments();
        return (
            <div>
                {renderBatchAcademicYear()}
                <div className="table-responsive mt-4">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th rowSpan="2" className="vertical-center">Criteria</th>
                                <th colSpan="6">Subjective-1</th>
                                <th colSpan="6">Subjective-2</th>
                            </tr>
                            <tr>
                                <th>Q1</th>
                                <th>Q2</th>
                                <th>Q3</th>
                                <th>Q4</th>
                                <th>Q5</th>
                                <th>Q6</th>
                                <th>Q1</th>
                                <th>Q2</th>
                                <th>Q3</th>
                                <th>Q4</th>
                                <th>Q5</th>
                                <th>Q6</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Target for Subjective</td>
                                {attainments.flat().map((a, i) => (
                                    <td key={`target-${i}`}>{a.target}</td>
                                ))}
                            </tr>
                            <tr>
                                <td>No. of students reaching target</td>
                                {attainments.flat().map((a, i) => (
                                    <td key={`reaching-${i}`}>{a.studentsReachingTarget}</td>
                                ))}
                            </tr>
                            <tr>
                                <td>No. of students who didn't attempt</td>
                                {attainments.flat().map((a, i) => (
                                    <td key={`not-attempted-${i}`}>{a.studentsNotAttempted}</td>
                                ))}
                            </tr>
                            <tr>
                                <td>No. of students who attempted</td>
                                {attainments.flat().map((a, i) => (
                                    <td key={`attempted-${i}`}>{a.studentsAttempted}</td>
                                ))}
                            </tr>
                            <tr>
                                <td>Attainment %</td>
                                {attainments.flat().map((a, i) => (
                                    <td key={`percentage-${i}`}>{a.attainmentPercentage}%</td>
                                ))}
                            </tr>
                            <tr>
                                <td>Attainment Level</td>
                                {attainments.flat().map((a, i) => (
                                    <td key={`level-${i}`}>{a.attainmentLevel}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

  return (
    <div className="regulation-form mt-4">
      <h5>Subjective Attainment</h5>
      <hr />
      {renderFilters()}
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex gap-2 mb-4">
        <button
          className={`submit-button ${activeComponent === 'mapping' ? 'active' : ''}`}
          onClick={() => setActiveComponent('mapping')}
          disabled={loading}
        >
          <b>Subjective Mapping</b>
        </button>
        <button
          className={`submit-button ${activeComponent === 'marks' ? 'active' : ''}`}
          onClick={() => setActiveComponent('marks')}
          disabled={loading}
        >
          <b>Subjective Marks</b>
        </button>
        <button
          className={`submit-button ${activeComponent === 'attainments' ? 'active' : ''}`}
          onClick={() => setActiveComponent('attainments')}
          disabled={loading}
        >
          <b>Print Subjective Attainments</b>
        </button>
      </div>

      {activeComponent === 'mapping' && renderMappingComponent()}
      {activeComponent === 'marks' && renderMarksComponent()}
      {activeComponent === 'attainments' && renderAttainmentsComponent()}
    </div>
  );
};

export default SubjectiveAttainment;