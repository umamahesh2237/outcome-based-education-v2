import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const initialQuestions = [
  '1a', '1b', '1c', '1d', '1e', '1f', '1g', '1h', '1i', '1j',
  '2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b',
  '7a', '7b', '8a', '8b', '9a', '9b', '10a', '10b', '11a', '11b',
];

const EndExamAttainment = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [filters, setFilters] = useState({
    regulation: '',
    semester: '',
    category: '',
    courseTitle: '',
  });
  const [batch, setBatch] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [courseTitles, setCourseTitles] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [mapping, setMapping] = useState([]);
  const [marks, setMarks] = useState([]);
  const [maxMarks, setMaxMarks] = useState({});
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

          const initialMapping = initialQuestions.map(question => ({
            questionNumber: question,
            maxMarks: ['1a', '1b', '1c', '1d', '1e', '1f', '1g', '1h', '1i', '1j'].includes(question) ? 1 : 5,
            coMappings: outcomes.map(co => ({
              coNumber: co,
              value: '-'
            })),
          }));
          setMapping(initialMapping);

          setMarks(Array.from({ length: 300 }, (_, index) => ({
            sNo: index + 1,
            ...initialQuestions.reduce((acc, q) => ({ ...acc, [q]: '' }), {}),
            totalMarks: 0,
          })));

          if (batch && academicYear) {
            const fetchExistingData = async () => {
              try {
                const [mappingRes, marksRes] = await Promise.all([
                  axios.get(`${API_BASE_URL}/api/end-exam-attainment/fetch`, {
                    params: { ...filters, batch, academicYear }
                  }),
                  axios.get(`${API_BASE_URL}/api/end-exam-attainment/marks/fetch`, {
                    params: { ...filters, batch, academicYear }
                  })
                ]);

                if (mappingRes.data) {
                  setMapping(mappingRes.data.mapping);
                  const fetchedMaxMarks = {};
                  mappingRes.data.mapping.forEach(item => {
                    fetchedMaxMarks[item.questionNumber] = item.maxMarks;
                  });
                  setMaxMarks(fetchedMaxMarks);
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
          setMapping([]);
          setMarks([]);
        }
      } else {
        setCourseOutcomes([]);
        setMapping([]);
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
            const requests = [];
            if (activeComponent === 'mapping') {
              requests.push(
                axios.get(`${API_BASE_URL}/api/end-exam-attainment/fetch`, {
                  params: { ...filters, batch, academicYear }
                })
              );
            }
            if (activeComponent === 'marks') {
              requests.push(
                axios.get(`${API_BASE_URL}/api/end-exam-attainment/marks/fetch`, {
                  params: { ...filters, batch, academicYear }
                })
              );
            }

            const responses = await Promise.all(requests);

            responses.forEach(res => {
              if (activeComponent === 'mapping' && res?.data?.mapping) {
                setMapping(res.data.mapping);
                const fetchedMaxMarks = {};
                res.data.mapping.forEach(item => {
                  fetchedMaxMarks[item.questionNumber] = item.maxMarks;
                });
                setMaxMarks(fetchedMaxMarks);
              } else if (activeComponent === 'marks' && res?.data?.marks) {
                const existingMarks = res.data.marks;
                setMarks(prevMarks =>
                  prevMarks.map((row, index) => ({
                    ...row,
                    ...existingMarks[index]
                  }))
                );
              }
            });

            if (responses.length > 0 && responses.every(res => !res.data)) {
              if (activeComponent === 'mapping') {
                const outcomes = Object.keys(courseOutcomes);
                const initialMapping = initialQuestions.map(question => ({
                  questionNumber: question,
                  maxMarks: ['1a', '1b', '1c', '1d', '1e', '1f', '1g', '1h', '1i', '1j'].includes(question) ? 1 : 5,
                  coMappings: outcomes.map(co => ({
                    coNumber: co,
                    value: '-'
                  })),
                }));
                setMapping(initialMapping);
                setMaxMarks(initialMapping.reduce((acc, item) => ({ ...acc, [item.questionNumber]: item.maxMarks }), {}));
              } else if (activeComponent === 'marks') {
                setMarks(Array.from({ length: 300 }, (_, index) => ({
                  sNo: index + 1,
                  ...initialQuestions.reduce((acc, q) => ({ ...acc, [q]: '' }), {}),
                  totalMarks: 0,
                })));
              }
              setError('No existing data found for the selected Batch and Academic Year.');
            } else {
              setError(null);
            }

          } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error fetching data');
          }
        };
        fetchData();
      } else {
        const outcomes = Object.keys(courseOutcomes);
        const initialMapping = initialQuestions.map(question => ({
          questionNumber: question,
          maxMarks: ['1a', '1b', '1c', '1d', '1e', '1f', '1g', '1h', '1i', '1j'].includes(question) ? 1 : 5,
          coMappings: outcomes.map(co => ({
            coNumber: co,
            value: '-'
          })),
        }));
        setMapping(initialMapping);
        setMarks(Array.from({ length: 300 }, (_, index) => ({
          sNo: index + 1,
          ...initialQuestions.reduce((acc, q) => ({ ...acc, [q]: '' }), {}),
          totalMarks: 0,
        })));
        setMaxMarks(initialMapping.reduce((acc, item) => ({ ...acc, [item.questionNumber]: item.maxMarks }), {}));
      }
    }
  }, [activeComponent, filters, filters.courseTitle, batch, academicYear, courseOutcomes]);

  const handleMappingChange = (questionIndex, coIndex, value) => {
    setMapping(prevMapping => {
      const newMapping = [...prevMapping];
      newMapping[questionIndex].coMappings[coIndex].value = value;
      return newMapping;
    });
  };

  const handleMarkChange = (index, field, value) => {
    const numValue = value === '' ? '' : Number(value);
    if (initialQuestions.includes(field) && numValue !== '') {
      if (numValue > (maxMarks[field] || 0)) {
        alert('Value cannot exceed maximum marks');
        return;
      }
    }

    setMarks(prevMarks => {
      const newMarks = [...prevMarks];
      newMarks[index] = {
        ...newMarks[index],
        [field]: value
      };
      const rowTotal = initialQuestions.reduce((sum, q) => {
        const mark = Number(newMarks[index][q]);
        return isNaN(mark) ? sum : sum + mark;
      }, 0);
      newMarks[index].totalMarks = rowTotal;
      return newMarks;
    });
  };

  const addMoreRows = () => {
    setMarks(prevMarks => [
      ...prevMarks,
      ...Array.from({ length: 10 }, (_, index) => ({
        sNo: prevMarks.length + index + 1,
        ...initialQuestions.reduce((acc, q) => ({ ...acc, [q]: '' }), {}),
        totalMarks: 0,
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
      await axios.post(`${API_BASE_URL}/api/end-exam-attainment/save`, {
        ...filters,
        batch,
        academicYear,
        mapping
      });
      alert('End Exam mapping saved successfully!');
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
      const validMarks = marks.filter(m => Object.values(m).some(val => val !== '' && val !== 0));
      const marksToSave = validMarks.map(({ sNo, totalMarks, ...rest }) => ({ ...rest }));
      await axios.post(`${API_BASE_URL}/api/end-exam-attainment/marks/save`, {
        ...filters,
        batch,
        academicYear,
        marks: marksToSave
      });
      alert('End Exam marks saved successfully!');
      setError(null);
    } catch (err) {
      setError('Error saving marks');
      console.error(err);
    }
  };

  const calculateAttainments = () => {
    const validMarks = marks.filter(m => Object.values(m).some(val => val !== '' && val !== 0));
    const totalStudents = validMarks.length;
    const attainments = {};

    initialQuestions.forEach(question => {
      const maxMark = maxMarks[question] || 0;
      const target = maxMark * 0.6;
      const studentsReachingTarget = validMarks.filter(m => Number(m[question]) >= target).length;
      const attemptedStudents = validMarks.filter(m => m[question] !== '' && m[question] !== undefined).length;
      const notAttemptedStudents = totalStudents - attemptedStudents;
      const attainmentPercentage = attemptedStudents > 0 ? (studentsReachingTarget / attemptedStudents) * 100 : 0;
      let attainmentLevel = 0;
      if (attainmentPercentage >= 80) attainmentLevel = 3;
      else if (attainmentPercentage >= 70) attainmentLevel = 2;
      else if (attainmentPercentage >= 60) attainmentLevel = 1;

      attainments[question] = {
        target: target.toFixed(2),
        studentsReachingTarget,
        attemptedStudents,
        notAttemptedStudents,
        attainmentPercentage: attainmentPercentage.toFixed(2),
        attainmentLevel,
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
              <th>Question</th>
              <th>Maximum Marks</th>
              {courseOutcomes.map(co => (
                <th key={co}>{co}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mapping.map((item, questionIndex) => (
              <tr key={item.questionNumber}>
                <td>{item.questionNumber}</td>
                <td>{item.maxMarks}</td>
                {item.coMappings.map((coMapping, coIndex) => (
                  <td key={coMapping.coNumber}>
                    <select
                      value={coMapping.value}
                      onChange={(e) => handleMappingChange(questionIndex, coIndex, e.target.value)}
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
              {initialQuestions.map(q => (
                <th key={q}>{q}</th>
              ))}
              <th>Total Marks</th>
            </tr>
            <tr>
              <td>Maximum Marks</td>
              {initialQuestions.map(q => (
                <td key={`max-${q}`}>{maxMarks[q] || '-'}</td>
              ))}
              <td>-</td>
            </tr>
          </thead>
          <tbody>
            {marks.map((row, index) => (
              <tr key={index}>
                <td>{row.sNo}</td>
                {initialQuestions.map(q => (
                  <td key={q}>
                    <input
                      type="number"
                      value={row[q] || ''}
                      onChange={(e) => {
                        handleMarkChange(index, q, e.target.value);
                      }}
                      className={`form-control form-control-sm ${Number(row[q]) > (maxMarks[q] || 0) ? 'text-danger' : ''}`}
                      min="0"
                      max={maxMarks[q] || ''}
                    />
                  </td>
                ))}
                <td>{row.totalMarks}</td>
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
              {initialQuestions.map(q => (
                <th key={q}>{q}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Target for End Exam</td>
              {initialQuestions.map(q => (
                <td key={`target-${q}`}>{attainments[q]?.target || '-'}</td>
              ))}
            </tr>
            <tr>
              <td>No. of students reaching target</td>
              {initialQuestions.map(q => (
                <td key={`reached-${q}`}>{attainments[q]?.studentsReachingTarget || '-'}</td>
              ))}
            </tr>
            <tr>
              <td>No. of students who didn't attempt</td>
              {initialQuestions.map(q => (
                <td key={`not-attempted-${q}`}>{attainments[q]?.notAttemptedStudents || '-'}</td>
              ))}
            </tr>
            <tr>
              <td>No. of students who attempted</td>
              {initialQuestions.map(q => (
                <td key={`attempted-${q}`}>{attainments[q]?.attemptedStudents || '-'}</td>
              ))}
            </tr>
            <tr>
              <td>Attainment %</td>
              {initialQuestions.map(q => (
                <td key={`percent-${q}`}>{attainments[q]?.attainmentPercentage || '-'}%</td>
              ))}
            </tr>
            <tr>
              <td>Attainment Level</td>
              {initialQuestions.map(q => (
                <td key={`level-${q}`}>{attainments[q]?.attainmentLevel || '-'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="regulation-form mt-4">
      <h5>End Exam Attainment</h5>
      <hr />

      {renderFilters()}

      <div className="d-flex gap-2 mb-4 mt-3">
        <button
          className={`submit-button ${activeComponent === 'mapping' ? 'active' : ''}`}
          onClick={() => setActiveComponent('mapping')}
        >
          <b>End Exam Mapping</b>
        </button>
        <button
          className={`submit-button ${activeComponent === 'marks' ? 'active' : ''}`}
          onClick={() => setActiveComponent('marks')}
        >
          <b>End Exam Marks</b>
        </button>
        <button
          className={`submit-button ${activeComponent === 'attainments' ? 'active' : ''}`}
          onClick={() => setActiveComponent('attainments')}
        >
          <b>Print End Exam Attainments</b>
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {activeComponent === 'mapping' && renderMappingComponent()}
      {activeComponent === 'marks' && renderMarksComponent()}
      {activeComponent === 'attainments' && renderAttainmentsComponent()}
    </div>
  );
};

export default EndExamAttainment;