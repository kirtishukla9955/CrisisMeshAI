import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import ReportGenerator from '../components/ReportGenerator';
import PostDisasterReport from '../components/PostDisasterReport';
import Toast from '../components/Toast';
import { usePostDisasterReport } from '../hooks/usePostDisasterReport';
import { useNavigate } from 'react-router-dom';

export default function PostDisasterPage({ authority }) {
  const navigate = useNavigate();
  const onNavigate = (key) => {
    if (key === 'command-center') navigate('/authority/dashboard');
    else if (key === 'ai-reports') navigate('/authority/reports');
    else navigate(`/authority/${key}`);
  };
  const { report, loading, generating, generate } = usePostDisasterReport();
  const [toast, setToast] = useState(null);

  const handleGenerate = async () => {
    try {
      await generate();
      setToast({ message: 'Post-disaster report generated.', tone: 'success' });
    } catch (err) {
      setToast({
        message: 'AI report generation temporarily unavailable — showing rule-based fallback if data exists.',
        tone: 'error',
      });
    }
  };

  return (
    <div className="flex min-h-screen" >
      <Sidebar active="ai-reports" onNavigate={onNavigate} authority={authority} />
      <div className="flex-1 min-w-0">
        <TopBar eventName="Post-Disaster Intelligence" lastSync={new Date()} />
        <main className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
          <ReportGenerator onGenerate={handleGenerate} generating={generating} />

          {loading && <div className="bg-gray-800 border border-gray-700 rounded-xl h-40 animate-pulse" />}
          {!loading && report && <PostDisasterReport report={report} />}
          {!loading && !report && !generating && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center text-[13px] text-[]">
              No report generated yet for this event. Click "Generate AI Report" once incident data has been collected.
            </div>
          )}
        </main>
      </div>
      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  );
}
