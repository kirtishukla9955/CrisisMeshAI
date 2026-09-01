import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ReportApp from './ReportApp';
import VolunteerApp from './VolunteerApp';
import AuthorityApp from './AuthorityApp';

function App() {
  return (
    <BrowserRouter>
      {/* Super simple debug nav to jump between the 3 apps quickly */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-2 flex justify-around text-xs z-50 opacity-50 hover:opacity-100 transition-opacity">
        <Link to="/" className="hover:text-orange-400">Citizen App</Link>
        <Link to="/volunteer" className="hover:text-orange-400">Volunteer App</Link>
        <Link to="/authority" className="hover:text-orange-400">Authority Dashboard</Link>
      </div>

      <Routes>
        <Route path="/" element={<ReportApp />} />
        <Route path="/volunteer" element={<VolunteerApp />} />
        <Route path="/authority/*" element={<AuthorityApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
