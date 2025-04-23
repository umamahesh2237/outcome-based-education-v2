import React, { useState, useContext } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import { UserContext } from '../UserContext';
import './Auth.css';

function AdminDashboard() {
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
          <li><a href="/admin/add-program-structure"><i className="icon">📄</i> <span>Add Program Structure</span></a></li>
          <li><a href="/admin/add-theory-co"><i className="icon">📝</i> <span>Add COs</span></a></li>
          <li><a href="/admin/view-theory-co"><i className="icon">🔍</i> <span>View COs & Map Rubrics</span></a></li>
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

export default AdminDashboard;