import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AddRegulation() {
  const [regulations, setRegulations] = useState([{ batch: '', year: '', regulation: '', semester: '' }]);
  const [batches, setBatches] = useState([]);
  const [regulationOptions] = useState(['AR16', 'AR18', 'AR20', 'AR22']); // Predefined regulations

  // Populate batches (2016-2030)
  useEffect(() => {
    const batchOptions = [];
    for (let year = 2016; year <= 2030; year++) {
      batchOptions.push(year);
    }
    setBatches(batchOptions);
  }, []);

  // Auto-generate academic years when batch is selected
  const handleBatchChange = (index, value) => {
    const newRegulations = [...regulations];
    newRegulations[index].batch = value;

    // Generate 4 academic years for the selected batch
    if (value) {
      const startYear = parseInt(value);
      newRegulations[index].year = `${startYear + 3}-${startYear + 4}`;
    } else {
      newRegulations[index].year = '';
    }

    setRegulations(newRegulations);
  };

  // Handle input changes for regulation and semester
  const handleInputChange = (index, field, value) => {
    const newRegulations = [...regulations];
    newRegulations[index][field] = value;
    setRegulations(newRegulations);
  };

  // Add another regulation entry
  const addRegulation = () => {
    setRegulations([...regulations, { batch: '', year: '', regulation: '', semester: '' }]);
  };

  // Validate and Submit Data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled
    for (const reg of regulations) {
      if (!reg.batch || !reg.year || !reg.regulation || !reg.semester) {
        alert('Please fill in all required fields.');
        return;
      }
    }

    try {
      await axios.post(`${API_BASE_URL}/api/regulations/addRegulation`, { regulations });
      alert('Regulation data saved successfully!');
      setRegulations([{ batch: '', year: '', regulation: '', semester: '' }]); // Reset form
    } catch (error) {
      console.error('Submission error:', error.message || error);
      alert('Failed to save regulation data. Please try again.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="regulation-form">
        <h3>Add Regulation</h3>
        {regulations.map((reg, index) => (
          <div key={index} className="regulation-inputs">
            <div className="input-field">
              <label>Enter Batch </label>
              <select value={reg.batch} onChange={(e) => handleBatchChange(index, e.target.value)} required>
                <option value="">Select Batch</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
            <div className="input-field">
              <label>Enter Academic Year </label>
              <input type="text" value={reg.year} readOnly placeholder="Auto-generated" />
            </div>
            <div className="input-field">
              <label>Enter Regulation </label>
              <select value={reg.regulation} onChange={(e) => handleInputChange(index, 'regulation', e.target.value)} required>
                <option value="">Select Regulation</option>
                {regulationOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="input-field">
              <label>Enter Semester</label>
              <select value={reg.semester} onChange={(e) => handleInputChange(index, 'semester', e.target.value)} required>
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
          </div>
        ))}

        <button type="button" onClick={addRegulation} className="add-button">
          <FaPlus /> <b>Add More</b>
        </button>

        <button type="submit" className="submit-button"><b>Submit</b></button>
      </form>
    </div>
  );
}

export default AddRegulation;
