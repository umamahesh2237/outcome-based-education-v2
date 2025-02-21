import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Auth.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AddTheoryCO = () => {
  const [category, setCategory] = useState('');
  const [regulation, setRegulation] = useState('');
  const [semester, setSemester] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseOutcomes, setCourseOutcomes] = useState({ CO1: '', CO2: '', CO3: '', CO4: '', CO5: '', CO6: '' });
  const [courseTitles, setCourseTitles] = useState([]);
  const [regulations, setRegulations] = useState([]);

  useEffect(() => {
    setRegulations([{ regulation: 'AR20' }, { regulation: 'AR22' }]);
  }, []);  

  useEffect(() => {
    if (category && regulation && semester) {
      console.log(category, regulation, semester);
      const fetchCourses = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/courses/by-regulation-semester`, {
            params: { category, regulation, semester },
          });
          setCourseTitles(response.data);
        } catch (error) {
          console.error('Error fetching courses:', error.message);
          setCourseTitles([]);
        }
      };
      fetchCourses();
    }
  }, [category, regulation, semester]);

  useEffect(() => {
    if (courseTitle) {
      const selectedCourse = courseTitles.find((course) => course.courseTitle === courseTitle);
      if (selectedCourse) setCourseCode(selectedCourse.courseCode);
    }
  }, [courseTitle, courseTitles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseOutcomes((prev) => ({ ...prev, [name]: value }));
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !regulation || !semester || !courseTitle || !courseCode) {
      alert('Please fill all required fields.');
      return;
    }

    const payload = {
      category,
      regulation,
      semester,
      subjectTitle: courseTitle,
      courseCode,
      outcomes: courseOutcomes,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/course-outcomes/add`, payload);
      if (response.status === 200) {
        alert('Course outcomes added successfully!');
        setCourseOutcomes({ CO1: '', CO2: '', CO3: '', CO4: '', CO5: '', CO6: '' });
      }
    } catch (error) {
      console.error('Error adding course outcomes:', error.message);
      alert('Failed to add course outcomes. Please try again.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="regulation-form">
        <h3>Choose the below filters for course:</h3>
        <hr />
        <div className="regulation-inputs">
          <div className="input-field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
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
            <label>Regulation</label>
            <select value={regulation} onChange={(e) => setRegulation(e.target.value)} required>
              <option value="">Select Regulation</option>
              {regulations.map((reg) => (
                <option key={reg._id} value={reg.regulation}>{reg.regulation}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
            <label>Semester</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} required>
              <option value="">Select Semester</option>
              <option value="I-I">I-I</option>
              <option value="I-II">I-II</option>
              <option value="II-I">II-I</option>
              <option value="II-II">II-II</option>
              <option value="III-I">III-I</option>
              <option value="III-II">III-II</option>
              <option value="IV-I">IV-I</option>
              <option value="IV-II">IV-II</option>
            </select>
          </div>
          <div className="input-field">
            <label>Course Title</label>
            <select value={courseTitle} onChange={(e) => {
              setCourseTitle(e.target.value)}} required>
              <option value="">Select Course Title</option>
              {courseTitles.map((course) => {
                if(category === course.category){
                  return <option key={course.courseCode} value={course.courseTitle}>{course.courseTitle}</option>
                }
                return null;
              })}
            </select>
          </div>
          <div className="input-field">
            <label>Course Code</label>
            <input type="text" value={courseCode} placeholder="Course Code" readOnly />
          </div>
        </div>
        <h3>Enter course outcomes:</h3>
        <hr />
        {Object.keys(courseOutcomes).map((co, index) => (
          <div key={index} className="input-field">
            <label>Course Outcome {index + 1}</label>
            <input type="text" name={co} value={courseOutcomes[co]} onChange={handleInputChange} className="form-input" placeholder={`Enter ${co}`}
            />
          </div>
        ))}
        <button type="submit" className="submit-button"><b>Submit</b></button>
      </form>
    </div>
  );
};

export default AddTheoryCO;