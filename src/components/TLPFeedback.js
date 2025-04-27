import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TLPFeedback = () => {
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
    const [tlpFeedback, setTlpFeedback] = useState([
        { section: 'A-Sec', term1: '', term2: '', average: 0 },
        { section: 'B-Sec', term1: '', term2: '', average: 0 },
        { section: 'C-Sec', term1: '', term2: '', average: 0 },
        { section: 'D-Sec', term1: '', term2: '', average: 0 },
        { section: 'E-Sec', term1: '', term2: '', average: 0 },
        { section: 'F-Sec', term1: '', term2: '', average: 0 },
        { section: 'G-Sec', term1: '', term2: '', average: 0 },
    ]);
    const [overallAverage, setOverallAverage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

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
            }
        };
        fetchCourses();
    }, [filters]);

    useEffect(() => {
        const fetchTLPData = async () => {
            if (filters.courseTitle && batch && academicYear) {
                setLoading(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/indirect-attainment/tlp-feedback/fetch`, {
                        params: { ...filters, batch, academicYear }
                    });
                    if (response.data && response.data.feedback) {
                        setTlpFeedback(response.data.feedback.map(item => ({ ...item })));
                        setOverallAverage(response.data.overallAverage || 0);
                    } else {
                        resetFeedback();
                    }
                } catch (error) {
                    console.error('Error fetching TLP Feedback:', error);
                    setError('Failed to load TLP Feedback.');
                    resetFeedback();
                } finally {
                    setLoading(false);
                }
            } else {
                resetFeedback();
            }
        };
        fetchTLPData();
    }, [filters, batch, academicYear]);

    const resetFeedback = () => {
        setTlpFeedback([
            { section: 'A-Sec', term1: '', term2: '', average: 0 },
            { section: 'B-Sec', term1: '', term2: '', average: 0 },
            { section: 'C-Sec', term1: '', term2: '', average: 0 },
            { section: 'D-Sec', term1: '', term2: '', average: 0 },
            { section: 'E-Sec', term1: '', term2: '', average: 0 },
            { section: 'F-Sec', term1: '', term2: '', average: 0 },
            { section: 'G-Sec', term1: '', term2: '', average: 0 },
        ]);
        setOverallAverage(0);
    };

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

    const handleTLPFeedbackChange = (index, term, value) => {
        const newFeedback = [...tlpFeedback];
        newFeedback[index][term] = value === '' ? '' : Number(value);
        const term1 = newFeedback[index].term1 || 0;
        const term2 = newFeedback[index].term2 || 0;
        newFeedback[index].average = ((term1 + term2) / 2).toFixed(2);
        setTlpFeedback(newFeedback);
        calculateOverallTLPAverage(newFeedback);
    };

    const calculateOverallTLPAverage = (feedbackData) => {
        const validAverages = feedbackData.map(item => Number(item.average)).filter(avg => !isNaN(avg));
        const averageSum = validAverages.reduce((sum, avg) => sum + avg, 0);
        setOverallAverage(validAverages.length > 0 ? (averageSum / validAverages.length).toFixed(2) : 0);
    };

    const saveTLPFeedback = async () => {
        if (!filters.courseTitle || !batch || !academicYear) {
            setError('Please select Regulation, Semester, Category, Course Title, Batch, and Academic Year to save.');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/indirect-attainment/tlp-feedback/save`, {
                ...filters,
                batch,
                academicYear,
                feedback: tlpFeedback.map(item => ({
                    section: item.section,
                    term1: item.term1 === '' ? null : item.term1,
                    term2: item.term2 === '' ? null : item.term2,
                    average: Number(item.average)
                })),
                overallAverage: Number(overallAverage)
            });
            setSuccessMessage('TLP Feedback saved successfully!');
            setError(null);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error saving TLP Feedback:', error);
            setError('Failed to save TLP Feedback.');
            setSuccessMessage(null);
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="regulation-form mt-4">
            <h5>TLP Feedback</h5>
            <hr />
            {renderFilters()}
            {renderBatchAcademicYear()}
            {error && <div className="alert alert-danger">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            <div className="table-responsive mt-4">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Section</th>
                            <th>Term-1</th>
                            <th>Term-2</th>
                            <th>Average</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tlpFeedback.map((item, index) => (
                            <tr key={index}>
                                <td>{item.section}</td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={item.term1}
                                        onChange={(e) => handleTLPFeedbackChange(index, 'term1', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={item.term2}
                                        onChange={(e) => handleTLPFeedbackChange(index, 'term2', e.target.value)}
                                    />
                                </td>
                                <td>{item.average}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" className="text-end">
                                <b>Overall Average:</b>
                            </td>
                            <td>{overallAverage}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <button className="submit-button mt-3" onClick={saveTLPFeedback} disabled={loading}>
                <b>{loading ? 'Saving...' : 'Save'}</b>
            </button>
        </div>
    );
};

export default TLPFeedback;