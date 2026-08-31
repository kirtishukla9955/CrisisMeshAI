import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import ReportGenerator from '../components/ReportGenerator';
import PostDisasterReport from '../components/PostDisasterReport';
import Toast from '../components/Toast';
import { usePostDisasterReport } from '../hooks/usePostDisasterReport';

export default function PostDisasterPage({ authority, onNavigate }) {
  const { report, loading, generating, generate } = usePostDisasterReport();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const handleGenerate = async (period) => {
    try {
      const result = await generate(period);
      setToast({
        message: result.generatedBy === 'ai' ? 'AI report generated.' : 'AI unavailable — showing rule-based fallback report.',
        tone: result.generatedBy === 'ai' ? 'success' : 'info',
      });
    } catch (err) {
      setToast({ message: err.message || 'Report generation failed.', tone: 'error' });
    }
  };

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'var(--cm-font-body)' }}>
      <Sidebar active="incidents" onNavigate={onNavigate} authority={authority} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <TopBar eventName="Post-Disaster Intelligence" lastSync={new Date()} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 max-w-3xl mx-auto flex flex-col gap-6">
          <div className="cm-no-print">
            <ReportGenerator onGenerate={handleGenerate} generating={generating} />
          </div>

          {loading && <div className="cm-glass-panel h-40 animate-pulse" />}
          {!loading && report && <PostDisasterReport report={report} />}
          {!loading && !report && !generating && (
            <div className="cm-glass-panel p-8 text-center text-[13px] text-[color:var(--cm-text-muted)]">
              No report generated yet. Pick a date range above and click "Generate AI Report" once resolved incidents exist for that period.
            </div>
          )}
        </main>
      </div>
      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  );
}
