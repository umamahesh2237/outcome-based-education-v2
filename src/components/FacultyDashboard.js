import React, { useState, useContext } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { UserContext } from '../UserContext';
import './Auth.css';

function FacultyDashboard() {
  const { userData, setUserData } = useContext(UserContext);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => { setUserData(null); navigate('/'); };
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  return (
    <div className="dashboard-container" style={{ backgroundImage: "url('/clg_background.jpg')", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}>
      <div className={isSidebarCollapsed ? 'sidebar collapsed' : 'sidebar'}>
        <div className="sidebar-header">
          <button onClick={toggleSidebar} className="collapse-icon">{isSidebarCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}</button>
        </div>
        <ul>
          <li><a href="/faculty/copo-mapping"><i className="icon">🔗</i> <span>CO-PO Mapping</span></a></li>
          <li><span className="sidebar-heading">Direct Attainments</span></li>
          <li><a href="/faculty/assignment-attainment"><i className="icon">📝</i> <span>Assignment Attainment</span></a></li>
          <li><a href="/faculty/subjective-attainment"><i className="icon">📚</i> <span>Subjective Attainment</span></a></li>
          <li><a href="/faculty/objective-attainment"><i className="icon">🎯</i> <span>Objective Attainment</span></a></li>
          <li><a href="/faculty/presentation-attainment"><i className="icon">📊</i> <span>Presentation Attainment</span></a></li>
          <li><a href="/faculty/endexam-attainment"><i className="icon">📊</i> <span>End Exam Attainment</span></a></li>
          <li><span className="sidebar-heading">Indirect Attainments</span></li>
          <li><a href="/faculty/tlp-feedback"><i className="icon">📋</i> <span>TLP Feedback</span></a></li>
          <li><a href="/faculty/course-end-survey"><i className="icon">📑</i> <span>Course End Survey</span></a></li>
          <li><a href="/faculty/print-attainments"><i className="icon">🖨️</i> <span>Print Attainments</span></a></li>
        </ul>
      </div>
      <div className="content">
        <button className="logout-button" onClick={handleLogout}><b>Logout</b></button>
        <h4>Welcome, <strong><i>{userData}</i></strong>!</h4>    
      <Outlet />
      </div>
    </div>
  );
}

export default FacultyDashboard;