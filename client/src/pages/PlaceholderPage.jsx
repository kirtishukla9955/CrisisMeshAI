import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useNavigate } from 'react-router-dom';

export default function PlaceholderPage({ authority, title, activeTab }) {
  const navigate = useNavigate();
  const onNavigate = (key) => {
    if (key === 'command-center') navigate('/authority/dashboard');
    else if (key === 'ai-reports') navigate('/authority/reports');
    else navigate(`/authority/${key}`);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active={activeTab} onNavigate={onNavigate} authority={authority} />
      <div className="flex-1 min-w-0 bg-[#0f2337] text-white">
        <TopBar eventName={title} lastSync={new Date()} />
        <main className="p-12 max-w-4xl mx-auto flex flex-col gap-6 items-center justify-center min-h-[60vh] text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-[#17324A] flex items-center justify-center shadow-lg border border-white/10">
            <svg className="h-10 w-10 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white/90">{title} Module</h1>
          <p className="text-white/50 max-w-lg leading-relaxed">
            This module is part of the v2 roadmap and is not fully implemented in the current hackathon prototype.
          </p>
          <button 
            onClick={() => navigate('/authority/dashboard')}
            className="mt-8 px-6 py-3 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            Return to Command Center
          </button>
        </main>
      </div>
    </div>
  );
}
