import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Auth.css';
import { jsPDF } from 'jspdf';
import * as autoTable from 'jspdf-autotable';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PrintAttainment = () => {
    const handleDownloadReport = () => {
        if (!printData) {
            alert('Please generate the report first.');
            return;
        }
    
        const doc = new jsPDF();
        let yPosition = 10;
        const margin = 10;
    
        const addTable = (title, headers, data) => {
            doc.setFontSize(12);
            doc.text(title, margin, yPosition);
            yPosition += 6;
    
            autoTable.default(doc, { // Using autoTable.default here
                head: [headers],
                body: data,
                startY: yPosition,
                margin: { left: margin, right: margin },
            });
    
            yPosition = doc.lastAutoTable.finalY + 10;
        };
    
        // Direct Attainments Table
        if (printData.directAttainments) {
            const headers = ['CO', 'Subjective (%)', 'LOI', 'Objective (%)', 'LOI', 'Assignment (%)', 'LOI', 'Presentation (%)', 'LOI', 'SEE Level', 'Direct Attainment'];
            const data = Object.keys(printData.directAttainments.overall).map(co => {
                const coKey = `CO${Number(co) + 1}`;
                const subjective = printData.directAttainments.subjective[coKey] || {};
                const objective = printData.directAttainments.objective[co] || {};
                const assignment = printData.directAttainments.assignment[co] || {};
                const presentation = printData.directAttainments.presentation[coKey] || {};
                const seeLevel = printData.directAttainments.seeLevel[co] || {};
                const overall = printData.directAttainments.overall[co] || {};
                return [
                    coKey,
                    subjective.percentage?.toFixed(2) || '-',
                    subjective.loi || '-',
                    objective.percentage?.toFixed(2) || '-',
                    objective.loi || '-',
                    assignment.percentage?.toFixed(2) || '-',
                    assignment.loi || '-',
                    presentation.percentage?.toFixed(2) || '-',
                    presentation.loi || '-',
                    seeLevel.level?.toFixed(2) || '-',
                    overall.level?.toFixed(2) || '-',
                ];
            });
            addTable('Direct Attainments', headers, data);
        }
    
        // Indirect Attainments Table
        if (printData.indirectAttainments?.overall) {
            const headers = ['CO', 'TLP Feedback (%)', 'LOI', 'Course End Survey (%)', 'LOI', 'Indirect Attainment'];
            const data = Object.keys(printData.indirectAttainments.overall).map(co => {
                const ces = printData.indirectAttainments.ces[co] || {};
                const tlp = printData.indirectAttainments.tlp || {};
                const overallIndirectLOI = printData.indirectAttainments.overall[co] || '-';
                return [
                    co,
                    tlp.percentage?.toFixed(2) || '-',
                    tlp.loi || '-',
                    ces.percentage?.toFixed(2) || '-',
                    ces.loi || '-',
                    overallIndirectLOI,
                ];
            });
            addTable('Indirect Attainments', headers, data);
        }
    
        // Overall Attainment Table
        if (printData.coAttainmentTable) {
            const headers = ['CO', 'Statement', 'Direct Attainment', 'Indirect Attainment (LOI)', 'Overall Attainment'];
            const data = printData.coAttainmentTable.map(coData => [
                coData.coNumber,
                coData.statement,
                coData.directAttainment?.toFixed(2) || '-',
                coData.indirectAttainment || '-',
                coData.overallAttainment?.toFixed(2) || '-',
            ]);
            addTable('Overall Attainment', headers, data);
        }
    
        // CO-PO Mapping Table
        if (printData.coPoMapping && printData.coPoMapping.length > 0) {
            const poKeys = Object.keys(printData.coPoMapping[0]).filter(key => key.startsWith('po') || key.startsWith('pso'));
            const headers = ['CO', ...poKeys.map(po => po.toUpperCase())];
            const data = printData.coPoMapping.map(coMap => [coMap.coNumber, ...poKeys.map(po => coMap[po] || '-')]);
            addTable('CO-PO Mapping', headers, data);
    
            // Add CO-PO Average if available
            if (printData.coPoColumnAverages && Object.keys(printData.coPoColumnAverages).length > 0) {
                const averageHeaders = ['Average', ...poKeys.map(po => printData.coPoColumnAverages[po]?.toFixed(2) || '-')];
                addTable('CO-PO Average', averageHeaders, [averageHeaders.slice(1)]);
            }
        }
    
        // PO Attainments Table
        if (printData.poAttainments) {
            const headers = ['PO', 'Attainment Level', 'Status'];
            const data = Object.keys(printData.poAttainments).map(po => {
                const attainmentValue = printData.poAttainments[po];
                const statusText = targetPoAttainment ? (attainmentValue >= parseFloat(targetPoAttainment) ? 'Reached' : 'Not Reached') : '-';
                return [po.toUpperCase(), attainmentValue?.toFixed(2) || '-', statusText];
            });
            addTable('PO Attainments', headers, data);
        }
    
        doc.save('attainment_report.pdf');
    };
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
                    setError(error.message || 'Failed to load course titles.');
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
            const response = await axios.get(`${API_BASE_URL}/api/print-attainment/generate`, {
                params: { ...filters, batch, academicYear }
            });
            if (response.data) {
                console.log('Received print data:', response.data);
                setPrintData(response.data);
            } else {
                setError("No data received from the server");
            }

        } catch (error) {
            console.error('Error generating print attainment report:', error);
            setError(error.message || 'Failed to generate report.');
        } finally {
            setLoading(false);
        }
    };

    const handleTargetPoAttainmentChange = (e) => {
        setTargetPoAttainment(e.target.value);
    };

    const renderFilters = () => (
        <div className="regulation-inputs">
            <div className="input-field">
                <label>Regulation</label>
                <select
                    name="regulation"
                    value={filters.regulation}
                    onChange={handleFilterChange}
                    disabled={loading}
                    className="w-full"
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
                    disabled={loading}
                    className="w-full"
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
                    disabled={loading}
                    className="w-full"
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
                    disabled={loading}
                    className="w-full"
                >
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
                <select name="batch" value={batch} onChange={handleBatchChange} disabled={loading} className="w-full">
                    <option value="">Select</option>
                    {batchOptions.map(b => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </select>
            </div>
            <div className="input-field">
                <label>Academic Year</label>
                <select name="academicYear" value={academicYear} onChange={handleAcademicYearChange} disabled={loading} className="w-full">
                    <option value="">Select</option>
                    {academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
        </div>
    );

    const renderDirectAttainments = () => {
        if (!printData?.directAttainments) return null;
        const coList = Object.keys(printData.directAttainments.overall);
        return (
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
                                <th>Direct Attainment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coList.map(co => {
                                const coKey = `CO${Number(co) + 1}`;
                                const subjectiveData = printData.directAttainments.subjective[coKey];
                                const objectiveData = printData.directAttainments.objective[co];
                                const assignmentData = printData.directAttainments.assignment[co];
                                const presentationData = printData.directAttainments.presentation[coKey];
                                const seeLevelData = printData.directAttainments.seeLevel[co];
                                const overallData = printData.directAttainments.overall[co];

                                return (
                                    <tr key={co}>
                                        <td>{coKey}</td>
                                        <td>{subjectiveData?.percentage !== null && subjectiveData?.percentage !== undefined ? subjectiveData.percentage.toFixed(2) : '-'}</td>
                                        <td>{subjectiveData?.loi !== null && subjectiveData?.loi !== undefined ? subjectiveData.loi : '-'}</td>
                                        <td>{objectiveData?.percentage !== null && objectiveData?.percentage !== undefined ? objectiveData.percentage.toFixed(2) : '-'}</td>
                                        <td>{objectiveData?.loi !== null && objectiveData?.loi !== undefined ? objectiveData.loi : '-'}</td>
                                        <td>{assignmentData?.percentage !== null && assignmentData?.percentage !== undefined ? assignmentData.percentage.toFixed(2) : '-'}</td>
                                        <td>{assignmentData?.loi !== null && assignmentData?.loi !== undefined ? assignmentData.loi : '-'}</td>
                                        <td>{presentationData?.percentage !== null && presentationData?.percentage !== undefined ? presentationData.percentage.toFixed(2) : '-'}</td>
                                        <td>{presentationData?.loi !== null && presentationData?.loi !== undefined ? presentationData.loi : '-'}</td>
                                        <td>{seeLevelData?.level !== null && seeLevelData?.level !== undefined ? seeLevelData.level.toFixed(2) : '-'}</td>
                                        <td>{overallData?.level !== null && overallData?.level !== undefined ? overallData.level.toFixed(2) : '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderIndirectAttainments = () => {
        if (!printData?.indirectAttainments?.overall) return null;

        const coList = Object.keys(printData.indirectAttainments.overall);

        return (
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
                                <th>Indirect Attainment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coList.map(co => {
                                const cesData = printData.indirectAttainments.ces[co];
                                const overallIndirectLOI = printData.indirectAttainments.overall[co];

                                return (
                                    <tr key={co}>
                                        <td>{co}</td>
                                        <td>{printData.indirectAttainments.tlp?.percentage !== null && printData.indirectAttainments.tlp?.percentage !== undefined ? printData.indirectAttainments.tlp.percentage.toFixed(2) : '-'}</td>
                                        <td>{printData.indirectAttainments.tlp?.loi !== null && printData.indirectAttainments.tlp?.loi !== undefined ? printData.indirectAttainments.tlp.loi : '-'}</td>
                                        <td>{cesData?.percentage !== null && cesData?.percentage !== undefined ? cesData.percentage.toFixed(2) : '-'}</td>
                                        <td>{cesData?.loi !== null && cesData?.loi !== undefined ? cesData.loi : '-'}</td>
                                        <td>{overallIndirectLOI !== null && overallIndirectLOI !== undefined ? overallIndirectLOI : '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderOverallAttainment = () => {
        if (!printData?.coAttainmentTable) return null;
        return (
            <div>
                <h5>Overall Attainment</h5>
                <div className="table-responsive mt-3">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>CO</th>
                                <th>Statement</th>
                                <th>Direct Attainment</th>
                                <th>Indirect Attainment (LOI)</th>
                                <th>Overall Attainment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {printData.coAttainmentTable.map(coData => (
                                <tr key={coData.coNumber}>
                                    <td>{coData.coNumber}</td>
                                    <td>{coData.statement}</td>
                                    <td>{coData.directAttainment !== null && coData.directAttainment !== undefined ? coData.directAttainment.toFixed(2) : '-'}</td>
                                    <td>{coData.indirectAttainment !== null && coData.indirectAttainment !== undefined ? coData.indirectAttainment : '-'}</td>
                                    <td>{coData.overallAttainment !== null && coData.overallAttainment !== undefined ? coData.overallAttainment.toFixed(2) : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderCoPoMapping = () => {
        if (!printData?.coPoMapping) return null;
        const poKeys = printData.coPoMapping[0] ? Object.keys(printData.coPoMapping[0]).filter(key => key.startsWith('po') || key.startsWith('pso')) : [];

        return (
            <div>
                <h5>CO-PO Mapping</h5>
                <div className="table-responsive mt-3">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>CO</th>
                                {poKeys.map(po => <th key={po}>{po.toUpperCase()}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {printData.coPoMapping.map(coMap => (
                                <tr key={coMap.coNumber}>
                                    <td>{coMap.coNumber}</td>
                                    {poKeys.map(po => (
                                        <td key={po}>{coMap[po] || '-'}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        {printData.coPoColumnAverages && Object.keys(printData.coPoColumnAverages).length > 0 && (
                            <tfoot>
                                <tr>
                                    <th>Average</th>
                                    {poKeys.map(po => (
                                        <th key={po}>{printData.coPoColumnAverages[po]?.toFixed(2) || '-'}</th>
                                    ))}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        );
    };

    const renderPoAttainments = () => {
        if (!printData?.poAttainments) return null;
        return (
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
                                <th>Attainment Level</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(printData.poAttainments).map(po => {
                                const attainmentValue = printData.poAttainments[po];
                                const statusColor = targetPoAttainment && attainmentValue < parseFloat(targetPoAttainment) ? 'red' : 'green';
                                const statusText = targetPoAttainment
                                    ? attainmentValue >= parseFloat(targetPoAttainment)
                                        ? 'Reached'
                                        : 'Not Reached'
                                    : '-';

                                return (
                                    <tr key={po}>
                                        <td>{po.toUpperCase()}</td>
                                        <td>{attainmentValue?.toFixed(2) || '-'}</td>
                                        <td style={{ color: statusColor }}>
                                            {statusText}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="regulation-form mt-4">
            <h5>Print Attainments</h5>
            <hr />
            {renderFilters()}
            <button className="submit-button mt-3" onClick={handleGenerateReport} disabled={loading}>
                <b>{loading ? 'Generating...' : 'Generate Report'}</b>
            </button>

            {error && <div className="alert alert-danger mt-3">Error: {error}</div>}

            {printData && (
                <div className="mt-4">
                    {renderDirectAttainments()}
                    {renderIndirectAttainments()}
                    {renderOverallAttainment()}
                    {renderCoPoMapping()}
                    {renderPoAttainments()}
                    <button className="submit-button mt-3" onClick={handleDownloadReport}>
                        <b>Download as PDF</b>
                    </button>
                </div>
            )}
        </div>
    );
};

export default PrintAttainment;