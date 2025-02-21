import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import AdminDashboard from './components/AdminDashboard';
import AddProgramStructure from './components/AddProgramStructure';
import AddTheoryCO from './components/AddTheoryCO';
import ViewTheoryCO from './components/ViewTheoryCO';
import AddRegulation from './components/AddRegulation';
import { UserProvider } from './UserContext'; // Import UserProvider

function App() {
  return (
    <UserProvider> {/* Wrap your app with UserProvider */}
      <Router>
        <div className='App'>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin" element={<AdminDashboard />}>
            `<Route path="/admin/add-program-structure" element={<AddProgramStructure />} />
            <Route path="/admin/add-theory-co" element={<AddTheoryCO />} />
            <Route path="/admin/view-theory-co" element={<ViewTheoryCO />} />
            <Route path="/admin/add-regulation" element={<AddRegulation />} />`
          </Route>
        </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
