import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Auth.css';

function AddProgramStructure() {
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedRegulation, setSelectedRegulation] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [programStructures, setProgramStructures] = useState([]);

  useEffect(() => {
    const batchOptions = [];
    for (let year = 2016; year <= 2030; year++) {
      batchOptions.push(year);
    }
    setBatches(batchOptions);
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      const startYear = parseInt(selectedBatch);
      const yearOptions = [];
      for (let i = 0; i < 4; i++) {
        yearOptions.push(`${startYear + i}-${startYear + i + 1}`);
      }
      setAcademicYears(yearOptions);
    } else {
      setAcademicYears([]);
    }
  }, [selectedBatch]);

  const handleDownloadTemplate = () => {
    window.location.href = 'http://localhost:5000/api/program-structure/download-template';
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setMessage('No file selected.');
      return;
    }

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setMessage('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    console.log(formData);
    try {
      setIsLoading(true);
      setMessage('');
      const response = await axios.post('http://localhost:5000/api/program-structure/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(response.data.message || 'File uploaded successfully!');
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(error.response?.data?.message || 'Error uploading file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchProgramStructure = async () => {
    if (!selectedBatch || !selectedYear || !selectedSemester || !selectedRegulation) {
      setMessage('Please select all filters to display courses.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.get('http://localhost:5000/api/program-structure/fetch', {
        params: {
          batch: selectedBatch,
          academicYear: selectedYear,
          semester: selectedSemester,
          regulation: selectedRegulation,
        },
      });

      setProgramStructures(response.data);
      if (response.data.length === 0) {
        setMessage('No program structures found for the selected criteria.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage(error.response?.data?.message || 'Error fetching program structure.');
      setProgramStructures([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = () => {
    return programStructures.reduce((totals, structure) => {
      return {
        L: (totals.L || 0) + (structure.L || 0),
        T: (totals.T || 0) + (structure.T || 0),
        PD: (totals.PD || 0) + (structure.PD || 0),
        CIE: (totals.CIE || 0) + (structure.CIE || 0),
        SEE: (totals.SEE || 0) + (structure.SEE || 0),
        totalMarks: (totals.totalMarks || 0) + (structure.totalMarks || 0),
        credits: (totals.credits || 0) + (structure.credits || 0)
      };
    }, {});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFetchProgramStructure();
  };

  const totals = calculateTotals();

  return (
    <div>
      <div className="regulation-form">
        <h5>Click this to download the program structure template:</h5>
        <hr />
        <button type="button" onClick={handleDownloadTemplate} className="submit-button">
          <b>Download Excel Template</b>
        </button>
      </div>
      <br />
      <div className="regulation-form">
        <h5>Upload program structure file:</h5>
        <hr />
        <input type="file" onChange={handleFileUpload} accept=".xlsx,.xls" className="file-upload" />
      </div>
      <br />
      <div>
        <form onSubmit={handleSubmit} className="regulation-form">
          <h5>Fetch the program structure (Regulation and Semester-Wise):</h5>
          <hr />
          <div className="filters regulation-inputs">
            <div className="input-field">
              <label>Batch</label>
              <select onChange={(e) => setSelectedBatch(e.target.value)} value={selectedBatch} className="form-input">
                <option value="">Select</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
  
            <div className="input-field">
              <label>Academic Year</label>
              <select onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear} className="form-input">
                <option value="">Select</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
  
            <div className="input-field">
              <label>Semester</label>
              <select onChange={(e) => setSelectedSemester(e.target.value)} value={selectedSemester} className="form-input">
                <option value="">Select</option>
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
              <label>Regulation</label>
              <select onChange={(e) => setSelectedRegulation(e.target.value)} value={selectedRegulation} className="form-input">
                <option value="">Select</option>
                <option value="AR20">AR20</option>
                <option value="AR22">AR22</option>
              </select>
            </div>
          </div>
  
          {message && (
            <p
              style={{
                fontWeight: 'bold',
                color: message.includes('Error') ? 'red' : 'green',
              }}
            >
              {message}
            </p>
          )}
          {isLoading && <p style={{ fontWeight: 'bold' }}>Loading...</p>}
  
          <button type="submit" className="submit-button">
            <b>Fetch Program Structure</b>
          </button>
  
          {programStructures.length > 0 && (
            <div className="table-responsive mt-4">
              <div className="d-flex justify-content-between mb-3">
                <h5>Semester: {selectedSemester}</h5>
                <h5>Regulation: {selectedRegulation}</h5>
              </div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Category</th>
                    <th>Periods (L)</th>
                    <th>Periods (T)</th>
                    <th>Periods (P/D)</th>
                    <th>CIE</th>
                    <th>SEE</th>
                    <th>Total Marks</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {programStructures.map((structure, index) => (
                    <tr key={index}>
                      <td>{structure.courseCode}</td>
                      <td>{structure.courseTitle}</td>
                      <td>{structure.category}</td>
                      <td>{structure.L}</td>
                      <td>{structure.T}</td>
                      <td>{structure.PD}</td>
                      <td>{structure.CIE || 0}</td>
                      <td>{structure.SEE || 0}</td>
                      <td>{structure.totalMarks || 0}</td>
                      <td>{structure.credits}</td>
                    </tr>
                  ))}
                  <tr className="table-info font-weight-bold">
                  <td colSpan="3"><b>Total</b></td>
                  <td><b>{totals.L}</b></td>
                  <td><b>{totals.T}</b></td>
                  <td><b>{totals.PD}</b></td>
                  <td><b>{totals.CIE}</b></td>
                  <td><b>{totals.SEE}</b></td>
                  <td><b>{totals.totalMarks}</b></td>
                  <td><b>{totals.credits}</b></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}


export default AddProgramStructure;