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
  const [courseTitles, setCourseTitles] = useState([]);
  const [courseOutcomes, setCourseOutcomes] = useState(null);
  const [editingCO, setEditingCO] = useState(null);
  const [editedDesc, setEditedDesc] = useState('');

  useEffect(() => {
    if (filters.regulation && filters.semester && filters.category) {
      axios.get(`${API_BASE_URL}/api/courses/by-regulation-semester`, { params: filters })
        .then((response) => setCourseTitles(response.data))
        .catch(() => setCourseTitles([]));
    }
  }, [filters]);

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
      .then((response) => setCourseOutcomes(response.data || {}))
      .catch(() => setCourseOutcomes(null));
  };

  const handleEdit = (co, desc) => {
    setEditingCO(co);
    setEditedDesc(desc);
};

const handleSave = async (co, e) => {
    e.preventDefault();
    try {
        await axios.put(`${API_BASE_URL}/api/course-outcomes/update`, {
            co,
            description: editedDesc,
            filters,
        });

        setCourseOutcomes((prev) => {
            if (!prev) return prev;
            return { ...prev, [co]: editedDesc };
        });

        alert('Course outcome updated successfully');
        setEditingCO(null);
    } catch (error) {
        alert('Error updating course outcome');
    }
};

const handleCancel = (co, originalDesc) => {
    setEditingCO(null);
    setEditedDesc(originalDesc);
};

  const handleDelete = async (co, e) => {
    e.preventDefault();
    try {
      await axios.delete(`${API_BASE_URL}/api/course-outcomes/delete`, {
        params: { co, ...filters }
      })      

      setCourseOutcomes((prev) => {
        const updated = { ...prev };
        delete updated[co];
        return updated;
      });

      alert('Course outcome deleted successfully');
    } catch (error) {
      alert('Error deleting course outcome');
    }
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
              {["HSMC", "PCC", "MC", "ESC", "PROJ"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
            <label>Course Title</label>
            <select name="courseTitle" value={filters.courseTitle} onChange={handleFilterChange}>
              <option value="">Select Course Title</option>
              {courseTitles.map((course) => (
                filters.category === course.category && (
                  <option key={course.courseCode} value={course.courseTitle}>{course.courseTitle}</option>
                )
              ))}
            </select>
          </div>
        </div>
        <button type="button" onClick={fetchCourseOutcomes} className="submit-button"><b>Fetch Course Outcomes</b></button>
        <h3>Course Outcomes</h3>
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
                  {Object.entries(courseOutcomes).filter(([co]) => co !== '_id').map(([co, desc]) => (
                      <tr key={co}>
                          <td>{co}</td>
                          <td>
                              {editingCO === co ? (
                                  <input
                                      type="text"
                                      value={editedDesc}
                                      onChange={(e) => setEditedDesc(e.target.value)}
                                  />
                              ) : (
                                  desc
                              )}
                          </td>
                          <td>
                              {editingCO === co ? (
                                  <>
                                      <button className="edit-button" onClick={(e) => handleSave(co, e)}>Save</button>
                                      <button className="edit-button" onClick={() => handleCancel(co, desc)}>Cancel</button>
                                  </>
                              ) : (
                                  <>
                                      <button className="edit-button" onClick={() => handleEdit(co, desc)}>Edit</button>
                                      <button className="delete-button" onClick={(e) => handleDelete(co, e)}>Delete</button>
                                  </>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  ) : (
      <p>No outcomes for the selected criteria</p>
  )}
</form>
</div>
);
};

export default ViewTheoryCO;