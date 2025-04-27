import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import AddProgramStructure from './components/AddProgramStructure';
import AddTheoryCO from './components/AddTheoryCO';
import ViewTheoryCO from './components/ViewTheoryCO';
import AddRegulation from './components/AddRegulation';
import AssignmentAttainment from './components/AssignmentAttainment';
import COPOMapping from './components/COPOMapping';
import { UserProvider } from './UserContext';
import SubjectiveAttainment from './components/SubjectiveAttainment';
import ObjectiveAttainment from './components/ObjectiveAttainment';
import PresentationAttainment from './components/PresentationAttainment'; 
import EndExamAttainment from './components/EndExamAttainment';
import TLPFeedback from './components/TLPFeedback'; 
import CourseEndSurvey from './components/CourseEndSurvey';
import PrintAttainment from './components/PrintAttainment';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className='App'>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route path="/admin/add-program-structure" element={<AddProgramStructure />} />
            <Route path="/admin/add-theory-co" element={<AddTheoryCO />} />
            <Route path="/admin/view-theory-co" element={<ViewTheoryCO />} />
            <Route path="/admin/add-regulation" element={<AddRegulation />} />
          </Route>
          <Route path="/faculty" element={<FacultyDashboard />}>
            <Route path="/faculty/copo-mapping" element={<COPOMapping/>} />
            <Route path="/faculty/assignment-attainment" element={<AssignmentAttainment/>}/>
            <Route path="/faculty/subjective-attainment" element={<SubjectiveAttainment/>}/>
            <Route path="/faculty/objective-attainment" element={<ObjectiveAttainment/>}/>
            <Route path="/faculty/presentation-attainment" element={<PresentationAttainment/>}/>
            <Route path="/faculty/endexam-attainment" element={<EndExamAttainment/>}/>
            <Route path="/faculty/tlp-feedback" element={<TLPFeedback/>}/>
            <Route path="/faculty/course-end-survey" element={<CourseEndSurvey/>}/>
            <Route path="/faculty/print-attainments" element={<PrintAttainment/>}/>
          </Route>
        </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
