import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Auth.css'; // Assuming you have some shared styles

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PrintAttainment = () => {
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
    const [printData, setPrintData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [targetPoAttainment, setTargetPoAttainment] = useState('');

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

    const handleGenerateReport = async () => {
        if (!filters.courseTitle || !batch || !academicYear) {
            setError('Please select Regulation, Semester, Category, Course Title, Batch, and Academic Year.');
            return;
        }
        setLoading(true);
        setError(null);
        setPrintData(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/print-attainment/generate`, { params: { ...filters, batch, academicYear } });
            setPrintData(response.data);
        } catch (error) {
            console.error('Error generating print attainment report:', error);
            setError('Failed to generate report.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        // Implement your report download logic here (e.g., using a library like jsPDF)
        alert('Download report functionality to be implemented.');
    };

    const handleTargetPoAttainmentChange = (e) => {
        setTargetPoAttainment(e.target.value);
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

    const renderDirectAttainments = () => (
        <div>
            <h5>Direct Attainments</h5>
            <div className="table-responsive mt-3">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>CO</th>
                            <th>Subjective (%)</th>
                            <th>LOI</th>
                            <th>Objective (%)</th>
                            <th>LOI</th>
                            <th>Assignment (%)</th>
                            <th>LOI</th>
                            <th>Presentation (%)</th>
                            <th>LOI</th>
                            <th>SEE Level</th>
                            <th>LOI</th>
                            <th>Direct Attainment Level (%)</th>
                            <th>LOI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {printData?.directAttainments?.overallDirectAttainment?.coLevels && Object.keys(printData.directAttainments.overallDirectAttainment.coLevels).map(co => (
                            <tr key={co}>
                                <td>{co}</td>
                                <td>{printData.directAttainments.subjective.coAverages[co]?.toFixed(2) || '-'}</td>
                                <td>{printData.directAttainments.subjective.lois[co] || '-'}</td>
                                <td>{printData.directAttainments.objective.coAverages[co]?.toFixed(2) || '-'}</td>
                                <td>{printData.directAttainments.objective.lois[co] || '-'}</td>
                                <td>{printData.directAttainments.assignment.coAverages[co]?.toFixed(2) || '-'}</td>
                                <td>{printData.directAttainments.assignment.lois[co] || '-'}</td>
                                <td>{printData.directAttainments.presentation.coAverages[co]?.toFixed(2) || '-'}</td>
                                <td>{printData.directAttainments.presentation.lois[co] || '-'}</td>
                                <td>{printData.directAttainments.endExam.weightedLOIs[co] || '-'}</td>
                                <td>{printData.directAttainments.endExam.lois[co] || '-'}</td>
                                <td>{printData.directAttainments.overallDirectAttainment.coLevels[co]}</td>
                                <td>{printData.directAttainments.overallDirectAttainment.lois[co]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderIndirectAttainments = () => (
        <div>
            <h5>Indirect Attainments</h5>
            <div className="table-responsive mt-3">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>CO</th>
                            <th>TLP Feedback (%)</th>
                            <th>LOI</th>
                            <th>Course End Survey (%)</th>
                            <th>LOI</th>
                            <th>Indirect Attainment Level (%)</th>
                            <th>LOI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {printData?.indirectAttainments?.overallIndirectAttainment?.coLevels && Object.keys(printData.indirectAttainments.overallIndirectAttainment.coLevels).map(co => (
                            <tr key={co}>
                                <td>{co}</td>
                                <td>{printData.indirectAttainments.tlpFeedback.averagePercentage?.toFixed(2) || '-'}</td>
                                <td>{printData.indirectAttainments.tlpFeedback.lois[co] || '-'}</td>
                                <td>{printData.indirectAttainments.courseEndSurvey.coPercentages[co]?.toFixed(2) || '-'}</td>
                                <td>{printData.indirectAttainments.courseEndSurvey.lois[co] || '-'}</td>
                                <td>{printData.indirectAttainments.overallIndirectAttainment.coLevels[co]}</td>
                                <td>{printData.indirectAttainments.overallIndirectAttainment.lois[co]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderOverallAttainment = () => (
        <div>
            <h5>Overall Attainment</h5>
            <div className="table-responsive mt-3">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>CO</th>
                            <th>Statement</th>
                            <th>Direct Attainment (%)</th>
                            <th>Indirect Attainment (%)</th>
                            <th>Overall Attainment (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {printData?.overallAttainment && Object.keys(printData.overallAttainment).map(co => (
                            <tr key={co}>
                                <td>{co}</td>
                                <td>{printData.coStatements[co] || '-'}</td>
                                <td>{printData.directAttainments.overallDirectAttainment.coLevels[co]}</td>
                                <td>{printData.indirectAttainments.overallIndirectAttainment.coLevels[co]}</td>
                                <td>{printData.overallAttainment[co]?.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCoPoMapping = () => (
        <div>
            <h5>CO-PO Mapping</h5>
            <div className="table-responsive mt-3">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>CO</th>
                            {printData?.coPoMapping?.mapping?.[0] && Object.keys(printData.coPoMapping.mapping[0])
                                .filter(key => key.startsWith('PO'))
                                .map(po => <th key={po}>{po}</th>)}
                            <th>Average</th>
                        </tr>
                    </thead>
                    <tbody>
                        {printData?.coPoMapping?.mapping?.map(coMap => (
                            <tr key={coMap.co}>
                                <td>{coMap.co}</td>
                                {Object.keys(coMap)
                                    .filter(key => key.startsWith('PO'))
                                    .map(po => <td key={po}>{coMap[po]}</td>)}
                                <td>{(Object.keys(coMap)
                                    .filter(key => key.startsWith('PO'))
                                    .reduce((sum, po) => sum + parseInt(coMap[po] || 0), 0) /
                                    Object.keys(coMap).filter(key => key.startsWith('PO')).length).toFixed(2) || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Average</th>
                            {printData?.coPoMapping?.poAverages && Object.keys(printData.coPoMapping.poAverages).map(po => (
                                <th key={po}>{printData.coPoMapping.poAverages[po]?.toFixed(2) || '-'}</th>
                            ))}
                            <th>-</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );

    const renderPoAttainments = () => (
        <div>
            <h5>PO Attainments</h5>
            <div className="mb-2">
                <label>Target PO Attainment:</label>
                <input
                    type="number"
                    className="form-control form-control-sm"
                    value={targetPoAttainment}
                    onChange={handleTargetPoAttainmentChange}
                    style={{ width: '100px', display: 'inline-block', marginLeft: '10px' }}
                />
            </div>
            <div className="table-responsive mt-3">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>PO</th>
                            <th>Attainment Level (%)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {printData?.coPoMapping?.poAverages && Object.keys(printData.coPoMapping.poAverages).map(po => (
                            <tr key={po}>
                                <td>{po}</td>
                                <td>{printData.coPoMapping.poAverages[po]?.toFixed(2) || '-'}</td>
                                <td style={{
                                    color: targetPoAttainment && printData.coPoMapping.poAverages[po] < parseFloat(targetPoAttainment)
                                        ? 'red'
                                        : 'green'
                                }}>
                                    {targetPoAttainment
                                        ? printData.coPoMapping.poAverages[po] >= parseFloat(targetPoAttainment)
                                            ? 'Reached'
                                            : 'Not Reached'
                                        : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="regulation-form mt-4">
            <h5>Print Attainments</h5>
            <hr />
            {renderFilters()}
            <button className="submit-button mt-3" onClick={handleGenerateReport} disabled={loading}>
                <b>{loading ? 'Generating...' : 'Generate Report'}</b>
            </button>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            {printData && (
                <div className="mt-4">
                    {renderDirectAttainments()}
                    {renderIndirectAttainments()}
                    {renderOverallAttainment()}
                    {renderCoPoMapping()}
                    {renderPoAttainments()}
                    <button className="submit-button mt-3" onClick={handleDownloadReport}>
                        <b>Download Report</b>
                    </button>
                </div>
            )}
        </div>
    );
};

export default PrintAttainment;