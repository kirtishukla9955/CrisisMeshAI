import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ReportApp from './ReportApp';
import VolunteerApp from './VolunteerApp';
import AuthorityApp from './AuthorityApp';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen overflow-hidden bg-gray-900">
        <div className="flex-1 relative overflow-y-auto">
          <Routes>
            <Route path="/" element={<ReportApp />} />
            <Route path="/volunteer" element={<VolunteerApp />} />
            <Route path="/authority/*" element={<AuthorityApp />} />
          </Routes>
        </div>

        {/* Super simple debug nav to jump between the 3 apps quickly */}
        <div className="bg-[#0a0d10] border-t border-white/20 text-white p-3 flex justify-around text-sm font-bold z-[9999] shadow-[0_-4px_15px_rgba(0,0,0,0.5)]">
          <Link to="/" className="hover:text-[#E67E22] transition-colors flex-1 text-center border-r border-white/10">Citizen App</Link>
          <Link to="/volunteer" className="hover:text-[#E67E22] transition-colors flex-1 text-center border-r border-white/10">Volunteer App</Link>
          <Link to="/authority/dashboard" className="hover:text-[#E67E22] transition-colors flex-1 text-center">Authority Dashboard</Link>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
