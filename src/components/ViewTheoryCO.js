import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Auth.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ViewTheoryCO = () => {
  const [filters, setFilters] = useState({
    regulation: '',
    semester: '',
    category: '',
    courseTitle: '',
  });
  const [courseTitle, setCourseTitle] = useState('');
  const [courseTitles, setcourseTitles] = useState([]);
  const [courseOutcomes, setCourseOutcomes] = useState(null);
  //const [rubricMapping, setRubricMapping] = useState([]);
  const [mappingView, setMappingView] = useState(null);

  useEffect(() => {
    console.log(filters);
    if (filters.regulation && filters.semester && filters.category) {
      axios
        .get(`${API_BASE_URL}/api/courses/by-regulation-semester`, { params: filters })
        .then((response) => {
          console.log('naveen');
          console.log(response.data);
          setcourseTitles(response.data)
          console.log('naveen smile :)');
        })
        .catch(() => setcourseTitles([]));
    }
    console.log('naveen hi');
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFilters({ ...filters, [name]: value });
  };

  const fetchCourseOutcomes = () => {
    console.log('hello world');
    if (!filters.regulation || !filters.semester || !filters.category || !filters.courseTitle) {
      setCourseOutcomes(null);
      return;
    }
    axios
      .get(`${API_BASE_URL}/api/course-outcomes/fetch`, { params: filters })
      .then((response) => {
        console.log(response.data);
        setCourseOutcomes(response.data)})
      .catch((error) => {
        console.error("Error fetching course outcomes:", error);
        setCourseOutcomes(null);
      });
};

  return (
    <div>
      <form className="regulation-form">
        <h3>Course Outcome Viewer</h3>
        <hr />
        <div className="regulation-inputs">
          <div className="input-field">
            <label>Regulation</label>
            <select name="regulation" value={filters.regulation} onChange={handleFilterChange}>
              <option value="">Select Regulation</option>
              <option value="AR20">AR20</option>
              <option value="AR22">AR22</option>
            </select>
          </div>
          <div className="input-field">
            <label>Semester</label>
            <select name="semester" value={filters.semester} onChange={handleFilterChange}>
              <option value="">Select Semester</option>
              {["I-I", "I-II", "II-I", "II-II", "III-I", "III-II", "IV-I", "IV-II"].map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">Select Category</option>
              <option value="HSMC">HSMC</option>
              <option value="PCC">PCC</option>
              <option value="MC">MC</option>
              <option value="ESC">ESC</option>
              <option value="PROJ">PROJ</option>
              <option value="BSC">BSC</option>
              <option value="OEC">OEC</option>
              <option value="PEC">PEC</option>
            </select>
          </div>
          <div className="input-field">
            <label>Course Title</label>
            <select name="courseTitle" value={filters.courseTitle} onChange={handleFilterChange}>
              <option value="">Select Course Title</option>
              {courseTitles.map((course) => {
                if(filters.category === course.category){
                  return <option key={course.courseCode} value={course.courseTitle}>{course.courseTitle}</option>
                }
                return null;
              })}
            </select>
          </div>
        </div>
        <button type="button" onClick={fetchCourseOutcomes} className="submit-button"><b>Fetch Course Outcomes</b></button>

      <h3>Course Outcomes</h3>
      <hr />
      {courseOutcomes ? (
        <table>
          <thead>
            <tr>
              <th>Course Outcome</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(courseOutcomes)
              .filter(([co]) => co !== '_id') // Exclude _id before mapping
              .map(([co, desc]) => (
                <tr key={co}>
                  <td>{co}</td>
                  <td>{desc}</td>
                  <td>
                    <button className="edit-button">Edit</button>
                    <button className="delete-button">Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p>No outcomes for the selected criteria</p>
      )}
      <h3>Rubric Mapping and Excel Generation</h3><hr />
      <div className="rubric-actions">
        <button onClick={() => setMappingView('mapping')}>Go to rubric mapping</button>
        <button onClick={() => setMappingView('upload')}>Go to excel upload</button>
      </div>

      {mappingView === 'mapping' && (
        <div className="rubric-mapping">
          <input type="text" placeholder="Enter comma-separated COs (e.g., CO1, CO2)" />
          <input type="number" placeholder="Total Marks" />
          <button>Add Rubric</button>
        </div>
      )}

      {mappingView === 'upload' && (
        <div className="excel-upload">
          <h3>Upload Excel File</h3>
          <input type="file" />
          <button>Display uploaded content</button>
        </div>
      )}
      </form>
    </div>
  );
};

export default ViewTheoryCO;