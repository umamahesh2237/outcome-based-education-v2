import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PresentationAttainment = () => {
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
  const [presentationMarks, setPresentationMarks] = useState([]);
  const [maxPresentationMarks] = useState(5); // Default value
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const batchOptions = Array.from({ length: 10 }, (_, i) => (2021 + i).toString());

  useEffect(() => {
    if (batch) {
      const years = Array.from({ length: 4 }, (_, i) => `${parseInt(batch) + i}-${parseInt(batch) + i + 1}`);
      setAcademicYears(years);
    } else {
      setAcademicYears([]);
    }
  }, [batch]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (filters.regulation && filters.semester && filters.category) {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/courses/by-regulation-semester`, { params: filters });
          setCourseTitles(response.data);
        } catch (error) {
          console.error('Error fetching course titles:', error);
          setCourseTitles([]);
          setError('Failed to load course titles.');
        } finally {
          setLoading(false);
        }
      } else {
        setCourseTitles([]);
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

  const fetchExistingMarks = useCallback(async () => {
    if (filters.regulation && filters.semester && filters.category && filters.courseTitle && batch && academicYear) {
      setLoading(true);
      try {
        const marksRes = await axios.get(`${API_BASE_URL}/api/presentation-attainment/marks/fetch`, {
          params: { ...filters, batch, academicYear }
        });

        if (marksRes.data && Array.isArray(marksRes.data.marks)) {
          setPresentationMarks(marksRes.data.marks);
          setError(null);
        } else if (marksRes.data && marksRes.data.message) {
          setError(marksRes.data.message);
          setPresentationMarks([]);
        } else {
          setError('Error: Invalid response when fetching presentation marks.');
          setPresentationMarks([]);
        }
      } catch (error) {
        console.error('Error fetching presentation marks:', error);
        setError('Error fetching existing presentation marks');
        setPresentationMarks([]);
      } finally {
        setLoading(false);
      }
    }
  }, [filters, batch, academicYear]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (filters.courseTitle && filters.semester && batch && academicYear) {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/course-outcomes/fetch`, { params: filters });
          const outcomes = Object.entries(response.data)
            .filter(([key, value]) => key !== '_id' && value.trim() !== '')
            .map(([key]) => key);
          setCourseOutcomes(outcomes);
          setError(null);

          // Fetch existing marks after course data and all filters are available
          fetchExistingMarks();
        } catch (err) {
          setError('Error fetching course outcomes');
          console.error(err);
          setCourseOutcomes([]);
          setPresentationMarks([]);
        } finally {
          setLoading(false);
        }
      } else {
        setCourseOutcomes([]);
        setPresentationMarks([]);
      }
    };
    fetchCourseData();
  }, [filters.courseTitle, filters.semester, batch, academicYear, fetchExistingMarks, filters]);

  useEffect(() => {
    if (activeComponent === 'marks' && filters.courseTitle && filters.semester && batch && academicYear) {
      // Initialize with empty rows only when the marks component is active and filters are selected
      if (presentationMarks.length === 0) {
        setPresentationMarks(Array.from({ length: 300 }, (_, index) => ({ sNo: index + 1, rollNo: '', presentation: '' })));
      }
    } else if (activeComponent !== 'marks') {
      setPresentationMarks([]); // Clear marks when not on the marks component
    }
  }, [activeComponent, filters.courseTitle, filters.semester, batch, academicYear, presentationMarks.length]);


  const handlePresentationMarkChange = (index, value) => {
    const numValue = value === '' ? '' : Number(value);
    if (numValue > maxPresentationMarks) {
      alert(`Value cannot exceed maximum marks (${maxPresentationMarks})`);
      return;
    }
    setPresentationMarks(prevMarks => {
      const newMarks = [...prevMarks];
      newMarks[index] = { ...newMarks[index], presentation: value };
      return newMarks;
    });
  };

  const savePresentationMarks = async () => {
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
      const validMarks = presentationMarks.filter(m => m.rollNo !== '');
      await axios.post(`${API_BASE_URL}/api/presentation-attainment/marks/save`, {
        ...filters,
        batch,
        academicYear,
        marks: validMarks
      });
      alert('Presentation marks saved successfully!');
      fetchExistingMarks(); // Refresh the marks after saving
      setError(null);
    } catch (error) {
      setError('Error saving presentation marks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addMoreRows = () => {
    setPresentationMarks(prevMarks => [
      ...prevMarks,
      ...Array.from({ length: 10 }, (_, index) => ({
        sNo: prevMarks.length + index + 1,
        rollNo: '',
        presentation: '',
      })),
    ]);
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

  const renderPresentationMapping = () => (
    <div>
      {renderBatchAcademicYear()}
      <h6 className="mt-3">Presentation Mapping</h6>
      <div className="table-responsive mt-2">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Presentation</th>
              <th>Maximum Marks</th>
              {courseOutcomes.map((co) => (
                <th key={co}>{co}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Presentation</td>
              <td>{maxPresentationMarks}</td>
              {courseOutcomes.map((co, index) => (
                <td key={co} className="text-center">1</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-muted">Note: Presentation is mapped with all the COs by default. Hence, mapping need not be saved explicitly.</p>
    </div>
  );

  const renderPresentationMarksComponent = () => (
    <div>
      {renderBatchAcademicYear()}
      <div className="table-responsive mt-2">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Roll No.</th>
              <th>Presentation</th>
            </tr>
            <tr>
              <th colSpan="2">Maximum Marks</th>
              <th>{maxPresentationMarks}</th>
            </tr>
          </thead>
          <tbody>
            {presentationMarks.map((row, index) => (
              <tr key={index}>
                <td>{row.sNo}</td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={row.rollNo || ''}
                    onChange={(e) => {
                      const newMarks = [...presentationMarks];
                      newMarks[index] = { ...newMarks[index], rollNo: e.target.value };
                      setPresentationMarks(newMarks);
                    }}
                    disabled={loading}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={row.presentation || ''}
                    onChange={(e) => handlePresentationMarkChange(index, e.target.value)}
                    min="0"
                    max={maxPresentationMarks}
                    disabled={loading}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="d-flex justify-content-between mt-3">
          <button className="add-button" onClick={addMoreRows} disabled={loading}>
            <b>Add More Rows</b>
          </button>
          <button className="submit-button" onClick={savePresentationMarks} disabled={loading}>
            <b>Save Marks</b>
          </button>
        </div>
      </div>
    </div>
  );

  const calculateAttainments = () => {
    const validMarks = presentationMarks.filter(m => m.rollNo !== '' && m.presentation !== '');
    const totalStudents = validMarks.length;
    const target = maxPresentationMarks * 0.6;
    const studentsReachingTarget = validMarks.filter(m => m.presentation >= target).length;
    const attainmentPercentage = totalStudents > 0 ? (studentsReachingTarget / totalStudents) * 100 : 0;
    let attainmentLevel = 0;

    if (attainmentPercentage >= 80) attainmentLevel = 3;
    else if (attainmentPercentage >= 70) attainmentLevel = 2;
    else if (attainmentPercentage >= 60) attainmentLevel = 1;

    return {
      target: target.toFixed(2),
      studentsReachingTarget,
      attemptedStudents: totalStudents,
      attainmentPercentage: attainmentPercentage.toFixed(2),
      attainmentLevel
    };
  };

  const renderPrintPresentationAttainments = () => {
    const attainment = calculateAttainments();

    return (
      <div className="table-responsive mt-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Criteria</th>
              <th>Presentation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Target for Presentation ({maxPresentationMarks})</td>
              <td>{attainment.target}</td>
            </tr>
            <tr>
              <td>No of students reaching target (&gt;= {attainment.target})</td>
              <td>{attainment.studentsReachingTarget}</td>
            </tr>
            <tr>
              <td>No of students attempted</td>
              <td>{attainment.attemptedStudents}</td>
            </tr>
            <tr>
              <td>Attainment %</td>
              <td>{attainment.attainmentPercentage}%</td>
            </tr>
            <tr>
              <td>Attainment Level</td>
              <td>{attainment.attainmentLevel}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="regulation-form mt-4">
      <h5>Presentation Attainment</h5>
      <hr />

      {renderFilters()}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex gap-2 mb-4 mt-3">
        <button
          className={`submit-button ${activeComponent === 'mapping' ? 'active' : ''}`}
          onClick={() => setActiveComponent('mapping')}
          disabled={loading}
        >
          <b>Presentation Mapping</b>
        </button>
        <button
          className={`submit-button ${activeComponent === 'marks' ? 'active' : ''}`}
          onClick={() => setActiveComponent('marks')}
          disabled={loading}
        >
          <b>Presentation Marks</b>
        </button>
        <button
          className={`submit-button ${activeComponent === 'attainments' ? 'active' : ''}`}
          onClick={() => setActiveComponent('attainments')}
          disabled={loading}
        >
          <b>Print Presentation Attainments</b>
        </button>
      </div>

      {activeComponent === 'mapping' && renderPresentationMapping()}
      {activeComponent === 'marks' && renderPresentationMarksComponent()}
      {activeComponent === 'attainments' && renderPrintPresentationAttainments()}
    </div>
  );
};

export default PresentationAttainment;