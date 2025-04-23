import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ObjectiveAttainment = () => {
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
  const [maxMarks, setMaxMarks] = useState({ objective1: 10, objective2: 10 });
  const [error, setError] = useState(null);

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
    if (filters.regulation && filters.semester && filters.category) {
      axios.get(`${API_BASE_URL}/api/courses/by-regulation-semester`, { params: filters })
        .then(response => setCourseTitles(response.data))
        .catch(error => {
          console.error('Error fetching course titles:', error);
          setCourseTitles([]);
        });
    }
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
      if (filters.courseTitle) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/course-outcomes/fetch`, { params: filters });
          const outcomes = Object.entries(response.data)
            .filter(([key, value]) => key !== '_id' && value.trim() !== '')
            .map(([key]) => key);
          setCourseOutcomes(outcomes);

          const initialMappings = ['Objective-1', 'Objective-2'].map(objective => ({
            objectiveNumber: objective,
            maxMarks: 10,
            coMappings: outcomes.map(co => ({
              coNumber: co,
              value: '-'
            }))
          }));
          setMappings(initialMappings);

          setMarks(Array.from({ length: 300 }, (_, index) => ({
            sNo: index + 1,
            rollNo: '',
            objective1: '',
            objective2: ''
          })));

          if (batch && academicYear) {
            const fetchExistingData = async () => {
              try {
                const [mappingRes, marksRes] = await Promise.all([
                  axios.get(`${API_BASE_URL}/api/objective-attainment/fetch`, {
                    params: { ...filters, batch, academicYear }
                  }),
                  axios.get(`${API_BASE_URL}/api/objective-attainment/marks/fetch`, {
                    params: { ...filters, batch, academicYear }
                  })
                ]);

                if (mappingRes.data) {
                  setMappings(mappingRes.data.mappings);
                  setMaxMarks({
                    objective1: mappingRes.data.mappings[0]?.maxMarks || 10,
                    objective2: mappingRes.data.mappings[1]?.maxMarks || 10
                  });
                }

                if (marksRes.data) {
                  const existingMarks = marksRes.data.marks;
                  setMarks(prevMarks =>
                    prevMarks.map((row, index) => ({
                      ...row,
                      ...existingMarks[index]
                    }))
                  );
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
          }
          setError(null);
        } catch (err) {
          setError('Error fetching course data');
          console.error(err);
          setCourseOutcomes([]);
          setMappings([]);
          setMarks([]);
        }
      } else {
        setCourseOutcomes([]);
        setMappings([]);
        setMarks([]);
      }
    };
    fetchCourseData();
  }, [filters, batch, academicYear]);

  useEffect(() => {
    if (activeComponent && filters.courseTitle) {
      if (batch && academicYear) {
        const fetchData = async () => {
          try {
            const [mappingRes, marksRes] = await Promise.all([
              axios.get(`${API_BASE_URL}/api/objective-attainment/fetch`, {
                params: { ...filters, batch, academicYear }
              }),
              axios.get(`${API_BASE_URL}/api/objective-attainment/marks/fetch`, {
                params: { ...filters, batch, academicYear }
              })
            ]);

            if (mappingRes.data) {
              setMappings(mappingRes.data.mappings);
              setMaxMarks({
                objective1: mappingRes.data.mappings[0]?.maxMarks || 10,
                objective2: mappingRes.data.mappings[1]?.maxMarks || 10
              });
            }

            if (marksRes.data) {
              const existingMarks = marksRes.data.marks;
              setMarks(prevMarks =>
                prevMarks.map((row, index) => ({
                  ...row,
                  ...existingMarks[index]
                }))
              );
            }
          } catch (err) {
            if (err.response?.status === 404) {
              const outcomes = Object.keys(courseOutcomes);
              const initialMappings = ['Objective-1', 'Objective-2'].map(objective => ({
                objectiveNumber: objective,
                maxMarks: 10,
                coMappings: outcomes.map(co => ({
                  coNumber: co,
                  value: '-'
                }))
              }));
              setMappings(initialMappings);
              setMarks(Array.from({ length: 300 }, (_, index) => ({
                sNo: index + 1,
                rollNo: '',
                objective1: '',
                objective2: ''
              })));
            } else {
              console.error('Error fetching data:', err);
              setError('Error fetching data');
            }
          }
        };
        fetchData();
      } else {
        const outcomes = Object.keys(courseOutcomes);
        const initialMappings = ['Objective-1', 'Objective-2'].map(objective => ({
          objectiveNumber: objective,
          maxMarks: 10,
          coMappings: outcomes.map(co => ({
            coNumber: co,
            value: '-'
          }))
        }));
        setMappings(initialMappings);
        setMarks(Array.from({ length: 300 }, (_, index) => ({
          sNo: index + 1,
          rollNo: '',
          objective1: '',
          objective2: ''
        })))
      }
    }
  }, [activeComponent, filters, filters.courseTitle, batch, academicYear, courseOutcomes]);

  const handleMappingChange = (objectiveIndex, coIndex, value) => {
    setMappings(prevMappings => {
      const newMappings = [...prevMappings];
      newMappings[objectiveIndex].coMappings[coIndex].value = value;
      return newMappings;
    });
  };

  const handleMarkChange = (index, field, value) => {
    const numValue = value === '' ? '' : Number(value);

    if (field.startsWith('objective') && numValue !== '') {
      const objectiveNum = field === 'objective1' ? 1 : 2;
      if (numValue > maxMarks[`objective${objectiveNum}`]) {
        alert(`Value cannot exceed maximum marks (${maxMarks[`objective${objectiveNum}`]})`);
        return;
      }
    }

    setMarks(prevMarks => {
      const newMarks = [...prevMarks];
      newMarks[index] = {
        ...newMarks[index],
        [field]: value
      };
      return newMarks;
    });
  };

  const addMoreRows = () => {
    setMarks(prevMarks => [
      ...prevMarks,
      ...Array.from({ length: 10 }, (_, index) => ({
        sNo: prevMarks.length + index + 1,
        rollNo: '',
        objective1: '',
        objective2: ''
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

    try {
      await axios.post(`${API_BASE_URL}/api/objective-attainment/save`, {
        ...filters,
        batch,
        academicYear,
        mappings
      });
      alert('Objective mapping saved successfully!');
      setError(null);
    } catch (err) {
      setError('Error saving mapping');
      console.error(err);
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

    try {
      const validMarks = marks.filter(m => m.rollNo !== '');
      await axios.post(`${API_BASE_URL}/api/objective-attainment/marks/save`, {
        ...filters,
        batch,
        academicYear,
        marks: validMarks
      });
      alert('Objective marks saved successfully!');
      setError(null);
    } catch (err) {
      setError('Error saving marks');
      console.error(err);
    }
  };

  const calculateAttainments = () => {
    const validMarks = marks.filter(m => m.rollNo !== '');
    const totalStudents = validMarks.length;

    const attainments = ['objective1', 'objective2'].map(objective => {
      const maxMark = maxMarks[objective];
      const target = maxMark * 0.6;
      const studentsReachingTarget = validMarks.filter(m => m[objective] >= target).length;
      const attainmentPercentage = (studentsReachingTarget / totalStudents) * 100;
      let attainmentLevel = 0;

      if (attainmentPercentage >= 80) attainmentLevel = 3;
      else if (attainmentPercentage >= 70) attainmentLevel = 2;
      else if (attainmentPercentage >= 60) attainmentLevel = 1;

      return {
        target,
        studentsReachingTarget,
        attainmentPercentage: attainmentPercentage.toFixed(2),
        attainmentLevel
      };
    });

    return attainments;
  };

  const renderFilters = () => (
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
          {["I-I", "I-II", "II-I", "II-II", "III-I", "III-II", "IV-I", "IV-II"].map(sem => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>
      </div>
      <div className="input-field">
        <label>Category</label>
        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">Select</option>
          {["HSMC", "PCC", "MC", "ESC", "PROJ", "BSC", "OEC", "PEC"].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="input-field">
        <label>Course Title</label>
        <select name="courseTitle" value={filters.courseTitle} onChange={handleFilterChange}>
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
        <select name="batch" value={batch} onChange={handleBatchChange}>
          <option value="">Select</option>
          {batchOptions.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div className="input-field">
        <label>Academic Year</label>
        <select name="academicYear" value={academicYear} onChange={handleAcademicYearChange}>
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
              <th>Objective</th>
              <th>Maximum Marks</th>
              {courseOutcomes.map(co => (
                <th key={co}>{co}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping, objectiveIndex) => (
              <tr key={mapping.objectiveNumber}>
                <td>{mapping.objectiveNumber}</td>
                <td>{mapping.maxMarks}</td>
                {mapping.coMappings.map((coMapping, coIndex) => (
                  <td key={coMapping.coNumber}>
                    <select
                      value={coMapping.value}
                      onChange={(e) => handleMappingChange(objectiveIndex, coIndex, e.target.value)}
                      className="form-select form-select-sm"
                    >
                      <option value="-">-</option>
                      <option value="1">1</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button className="submit-button" onClick={saveMapping}>
          <b>Save Mapping</b>
        </button>
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
              <th>S. No.</th>
              <th>Roll No.</th>
              <th>Objective-1</th>
              <th>Objective-2</th>
            </tr>
            <tr>
              <td colSpan="2">Maximum Marks</td>
              <td>{maxMarks.objective1}</td>
              <td>{maxMarks.objective2}</td>
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
                    onChange={(e) => handleMarkChange(index, 'rollNo', e.target.value)}
                    className="form-control form-control-sm"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.objective1}
                    onChange={(e) => handleMarkChange(index, 'objective1', e.target.value)}
                    className="form-control form-control-sm"
                    min="0"
                    max={maxMarks.objective1}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.objective2}
                    onChange={(e) => handleMarkChange(index, 'objective2', e.target.value)}
                    className="form-control form-control-sm"
                    min="0"
                    max={maxMarks.objective2}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="d-flex justify-content-between mt-3">
          <button className="add-button" onClick={addMoreRows}>
            <b>Add More Rows</b>
          </button>
          <button className="submit-button" onClick={saveMarks}>
            <b>Save Marks</b>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAttainmentsComponent = () => {
    renderBatchAcademicYear();
    const attainments = calculateAttainments();

    return (
      <div className="table-responsive mt-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Criteria</th>
              <th>Objective-1</th>
              <th>Objective-2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Target for Objective</td>
              <td>{attainments[0].target}</td>
              <td>{attainments[1].target}</td>
            </tr>
            <tr>
              <td>No. of students reaching target</td>
              <td>{attainments[0].studentsReachingTarget}</td>
              <td>{attainments[1].studentsReachingTarget}</td>
            </tr>
            <tr>
              <td>Attainment %</td>
              <td>{attainments[0].attainmentPercentage}%</td>
              <td>{attainments[1].attainmentPercentage}%</td>
            </tr>
            <tr>
              <td>Attainment Level</td>
              <td>{attainments[0].attainmentLevel}</td>
              <td>{attainments[1].attainmentLevel}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="regulation-form mt-4">
      <h5>Objective Attainment</h5>
      <hr />

      {renderFilters()}

      <div className="d-flex gap-2 mb-4 mt-3">
        <button
          className={`submit-button ${activeComponent === 'mapping' ? 'active' : ''}`}
          onClick={() => setActiveComponent('mapping')}
        >
          <b>Objective Mapping</b>
        </button>
        <button
          className={`submit-button ${activeComponent === 'marks' ? 'active' : ''}`}
          onClick={() => setActiveComponent('marks')}
        >
          <b>Objective Marks</b>
        </button>
        <button
          className={`submit-button ${activeComponent === 'attainments' ? 'active' : ''}`}
          onClick={() => setActiveComponent('attainments')}
        >
          <b>Print Objective Attainments</b>
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {activeComponent === 'mapping' && renderMappingComponent()}
      {activeComponent === 'marks' && renderMarksComponent()}
      {activeComponent === 'attainments' && renderAttainmentsComponent()}
    </div>
  );
};

export default ObjectiveAttainment;