import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CourseEndSurvey = () => {
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
    const [surveyData, setSurveyData] = useState([]);
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

    // Fetch course outcomes for Course End Survey
    useEffect(() => {
        const fetchCourseOutcomes = async () => {
            if (filters.courseTitle) {
                setLoading(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/course-outcomes/fetch`, { params: filters });
                    const outcomes = Object.entries(response.data)
                        .filter(([key, value]) => key !== '_id' && value.trim() !== '')
                        .map(([key]) => key);
                    setCourseOutcomes(outcomes);
                } catch (error) {
                    console.error('Error fetching course outcomes:', error);
                    setError('Failed to load course outcomes.');
                    setCourseOutcomes([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setCourseOutcomes([]);
            }
        };
        fetchCourseOutcomes();
    }, [filters]);

    useEffect(() => {
        const fetchSurveyData = async () => {
            if (filters.courseTitle && batch && academicYear && courseOutcomes.length > 0) {
                setLoading(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/indirect-attainment/course-end-survey/fetch`, {
                        params: { ...filters, batch, academicYear }
                    });
                    if (response.data && response.data.coPercentages) {
                        const fetchedMap = new Map(response.data.coPercentages.map(item => [item.coNumber, item.percentage]));
                        const updatedData = courseOutcomes.map(co => ({
                            coNumber: co,
                            percentage: fetchedMap.get(co) !== undefined ? fetchedMap.get(co) : ''
                        }));
                        setSurveyData(updatedData);
                    } else {
                        setSurveyData(courseOutcomes.map(co => ({ coNumber: co, percentage: '' })));
                    }
                } catch (error) {
                    console.error('Error fetching Course End Survey:', error);
                    setError('Failed to load Course End Survey data.');
                    setSurveyData(courseOutcomes.map(co => ({ coNumber: co, percentage: '' })));
                } finally {
                    setLoading(false);
                }
            } else if (courseOutcomes.length > 0) {
                setSurveyData(courseOutcomes.map(co => ({ coNumber: co, percentage: '' })));
            } else {
                setSurveyData([]);
            }
        };
        fetchSurveyData();
    }, [filters, batch, academicYear, courseOutcomes]);

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

    const handlePercentageChange = (index, value) => {
        const newSurveyData = [...surveyData];
        newSurveyData[index].percentage = value === '' ? '' : Number(value);
        setSurveyData(newSurveyData);
    };

    const saveCourseEndSurvey = async () => {
        if (!filters.courseTitle || !batch || !academicYear) {
            setError('Please select Regulation, Semester, Category, Course Title, Batch, and Academic Year to save.');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/indirect-attainment/course-end-survey/save`, {
                ...filters,
                batch,
                academicYear,
                coPercentages: surveyData.map(item => ({
                    coNumber: item.coNumber,
                    percentage: item.percentage === '' ? null : item.percentage
                }))
            });
            setSuccessMessage('Course End Survey saved successfully!');
            setError(null);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error('Error saving Course End Survey:', error);
            setError('Failed to save Course End Survey.');
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
            <h5>Course End Survey</h5>
            <hr />
            {renderFilters()}
            {renderBatchAcademicYear()}
            {error && <div className="alert alert-danger">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            <div className="table-responsive mt-4">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Course Outcome</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {surveyData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.coNumber}</td>
                                <td>
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={item.percentage}
                                        onChange={(e) => handlePercentageChange(index, e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button className="submit-button mt-3" onClick={saveCourseEndSurvey} disabled={loading}>
                <b>{loading ? 'Saving...' : 'Save'}</b>
            </button>
        </div>
    );
};

export default CourseEndSurvey;