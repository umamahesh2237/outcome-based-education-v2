import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const COPOMapping = () => {
  const [filters, setFilters] = useState({
    regulation: '',
    semester: '',
    category: '',
    courseTitle: ''
  });
  const [courseTitles, setCourseTitles] = useState([]);
  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [coDescriptions, setCoDescriptions] = useState({});
  const [mappings, setMappings] = useState([]);
  const [averages, setAverages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const poColumns = Array.from({ length: 12 }, (_, i) => `po${i + 1}`);
  const psoColumns = Array.from({ length: 3 }, (_, i) => `pso${i + 1}`);
  const allColumns = [...poColumns, ...psoColumns];

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
    setFilters(prev => {
      const updatedFilters = {
        ...prev,
        [name]: value,
      };
      // Explicitly update courseTitle if it's the changed field
      if (name === 'courseTitle') {
        return updatedFilters;
      }
      // Reset courseTitle if category changes
      return name === 'category' ? { ...updatedFilters, courseTitle: '' } : updatedFilters;
    });
  };

  const fetchCourseOutcomes = async () => {
    if (!filters.regulation || !filters.semester || !filters.category || !filters.courseTitle) {
      setError('Please select all filters');
      return;
    }

    try {
      const coResponse = await axios.get(`${API_BASE_URL}/api/course-outcomes/fetch`, { params: filters });

      // Store CO descriptions separately
      const descriptions = {};
      Object.entries(coResponse.data)
        .filter(([key, value]) => key !== '_id' && value.trim() !== '')
        .forEach(([key, value]) => {
          descriptions[key] = value;
        });
      setCoDescriptions(descriptions);

      // Get CO numbers for mappings
      const outcomes = Object.keys(descriptions);
      setCourseOutcomes(outcomes);

      // Initialize mappings for each CO
      const initialMappings = outcomes.map(co => ({
        coNumber: co,
        ...allColumns.reduce((acc, col) => ({ ...acc, [col]: '-' }), {})
      }));
      setMappings(initialMappings);

      // Fetch existing mappings if any
      try {
        const existingMappings = await axios.get(`${API_BASE_URL}/api/copo-mapping/fetch`, { params: filters });
        if (existingMappings.data) {
          setMappings(existingMappings.data.mappings);
          setAverages(existingMappings.data.columnAverages);
        }
      } catch (mappingErr) {
        console.error('Error fetching existing CO-PO mappings:', mappingErr);
        // You might choose to display a different message or log this error
      }
    } catch (coErr) {
      setError('Error fetching course outcomes');
      console.error(coErr);
    }
  };

  const handleMappingChange = (coNumber, column, value) => {
    const updatedMappings = mappings.map(mapping => {
      if (mapping.coNumber === coNumber) {
        return { ...mapping, [column]: value };
      }
      return mapping;
    });
    setMappings(updatedMappings);

    // Calculate column averages
    const newAverages = {};
    allColumns.forEach(col => {
      const values = updatedMappings
        .map(m => m[col])
        .filter(v => v !== '-')
        .map(Number);
      newAverages[col] = values.length ?
        (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) :
        0;
    });
    setAverages(newAverages);
  };

  const handleSave = async () => {
    if (!filters.regulation || !filters.semester || !filters.courseTitle) {
      setError('Please select all filters first');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/copo-mapping/save`, {
        ...filters,
        mappings,
        columnAverages: averages
      });
      setError(null);
      alert('CO-PO mappings saved successfully!');
    } catch (err) {
      setError('Error saving mappings');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="regulation-form mt-4">
      <h5>CO-PO Mapping</h5>
      <hr />

      {/* Filters */}
      <div className="regulation-inputs">
        <div className="input-field">
          <label>Regulation</label>
          <select
            name="regulation"
            value={filters.regulation}
            onChange={handleFilterChange}
          >
            <option value="">Select</option>
            <option value="AR20">AR20</option>
            <option value="AR22">AR22</option>
          </select>
        </div>
        <div className="input-field">
          <label>Semester</label>
          <select
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
          >
            <option value="">Select</option>
            {["I-I", "I-II", "II-I", "II-II", "III-I", "III-II", "IV-I", "IV-II"].map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>
        <div className="input-field">
          <label>Category</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">Select</option>
            {["HSMC", "PCC", "MC", "ESC", "PROJ", "BSC", "OEC", "PEC"].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="input-field">
          <label>Course Title</label>
          <select
            name="courseTitle"
            value={filters.courseTitle}
            onChange={handleFilterChange}
          >
            <option value="">Select</option>
            {courseTitles.map(course => (
              filters.category === course.category && (
                <option key={course.courseCode} value={course.courseTitle}>
                  {course.courseTitle}
                </option>
              )
            ))}
          </select>
        </div>
      </div>

      <button
        className="submit-button mb-4"
        onClick={fetchCourseOutcomes}
      >
        <b>Get CO-PO Mapping table</b>
      </button>

      {error && <div className="alert alert-danger">{error}</div>}

      {courseOutcomes.length > 0 && (
        <>
          {/* CO-PO Mapping Table */}
          <div className="table-responsive">
            <h6>CO-PO Mapping</h6>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>CO Number</th>
                  {poColumns.map(po => (
                    <th key={po}>{po.toUpperCase()}</th>
                  ))}
                  {psoColumns.map(pso => (
                    <th key={pso}>{pso.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mappings.map(mapping => (
                  <tr key={mapping.coNumber}>
                    <td>
                      <div>{mapping.coNumber}</div>
                      <small className="text-muted">{coDescriptions[mapping.coNumber]}</small>
                    </td>
                    {allColumns.map(col => (
  <td key={col}>
    <select
      value={mapping[col]}
      onChange={(e) => handleMappingChange(mapping.coNumber, col, e.target.value)}
      className="form-select form-select-sm"
      style={{ width: '70px', paddingRight: '10px' }} // Inline styles
    >
      <option value="-">-</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </select>
  </td>
))}
                  </tr>
                ))}
                <tr className="table-secondary">
                  <td><strong>Average</strong></td>
                  {allColumns.map(col => (
                    <td key={col}><strong>{averages[col] || '0.00'}</strong></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <button
            className="submit-button mt-3"
            onClick={handleSave}
            disabled={loading}
          >
            <b>{loading ? 'Saving...' : 'Save Mappings'}</b>
          </button>
        </>
      )}
    </div>
  );
};

export default COPOMapping;