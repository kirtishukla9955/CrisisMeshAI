import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import AIConfidenceBadge from '../components/AIConfidenceBadge';
import IncidentTimeline from '../components/IncidentTimeline';
import AuditHistory from '../components/AuditHistory';
import AuthorityActionPanel from '../components/AuthorityActionPanel';
import Toast from '../components/Toast';
import { useIncident } from '../hooks/useIncident';
import { incidentService } from '../services/incidentService';
import { relativeTime, titleCase } from '../utils/formatters';
import { SOURCE_LABELS } from '../utils/constants';
import { useParams, useNavigate } from 'react-router-dom';

export default function IncidentDetailsPage({ authority }) {
  const { id: incidentId } = useParams();
  const navigate = useNavigate();
  const { incident, reports, history, loading, error, refresh } = useIncident(incidentId);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [historyTab, setHistoryTab] = useState('timeline'); // 'timeline' | 'audit'

  const onBack = () => navigate('/authority/dashboard');
  const onNavigate = (key) => {
    if (key === 'command-center') navigate('/authority/dashboard');
    else if (key === 'ai-reports') navigate('/authority/reports');
    else navigate(`/authority/${key}`);
  };

  const handleChangeStatus = async (status, authorityNote) => {
    setBusy(true);
    try {
      await incidentService.updateStatus(incidentId, status, authorityNote);
      await refresh();
      setToast({ message: `Status updated to ${titleCase(status)}.`, tone: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to update status.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleAddNote = async (note) => {
    setBusy(true);
    try {
      await incidentService.addNote(incidentId, note);
      await refresh();
      setToast({ message: 'Note added.', tone: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to add note.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen" >
      <Sidebar active="live-incidents" onNavigate={onNavigate} authority={authority} />
      <div className="flex-1 min-w-0">
        <TopBar eventName={incident?.title || 'Incident Detail'} lastSync={new Date()} />
        <main className="p-6">
          <button onClick={onBack} className="text-[13px] text-[color:#d1d5db] hover:text-[color:white] mb-4">
            ← Back to Command Center
          </button>

          {loading && <div className="bg-gray-800 border border-gray-700 rounded-xl h-40 animate-pulse" />}
          {error && <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-[color:#ef4444] text-sm">Couldn't load this incident.</div>}

          {incident && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-5">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[12px] text-[color:#9ca3af]">{incident.id}</span>
                    <StatusBadge status={incident.status} />
                  </div>
                  <h1 className="text-xl font-semibold mb-3" >{incident.title}</h1>
                  <div className="flex flex-wrap items-center gap-6">
                    <PriorityBadge score={incident.priorityScore} severity={incident.severity} size="lg" />
                    <AIConfidenceBadge confidence={incident.aiConfidence} fallbackUsed={incident.aiFallbackUsed} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-[color:#374151] text-[13px]">
                    <Field label="Location" value={incident.locationLabel} />
                    <Field label="Latitude" value={incident.location?.lat} mono />
                    <Field label="Longitude" value={incident.location?.lng} mono />
                    <Field label="Category" value={titleCase(incident.category)} />
                    <Field label="Reports" value={incident.reportCount} />
                    <Field label="Assigned" value={incident.assignedResponderName || 'Unassigned'} />
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                  <div className="text-[11px] uppercase tracking-wider text-[color:#9ca3af] font-medium mb-3">
                    AI Recommendation
                  </div>
                  <div className="text-[13px] text-[color:#d1d5db]">
                    Priority: <strong >{titleCase(incident.severity)}</strong> ·
                    Confidence: <strong >
                      {incident.aiConfidence !== undefined ? `${Math.round(incident.aiConfidence * 100)}%` : '—'}
                    </strong>
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[color:#9ca3af] font-medium mt-3">
                    Human Authority
                  </div>
                  <div className="text-[13px] mt-1">
                    {incident.status === 'new' || incident.status === 'under_review' ? 'Review required' : 'Reviewed'}
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                  <div className="text-[11px] uppercase tracking-wider text-[color:#9ca3af] font-medium mb-3">
                    Raw Reports ({reports.length})
                  </div>
                  <div className="flex flex-col gap-3">
                    {reports.map((r) => (
                      <div key={r.id} className="border border-[color:#374151] rounded-md p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                            
                          >
                            {SOURCE_LABELS[r.source] || r.source}
                          </span>
                          <span className="text-[11px] text-[color:#9ca3af]">{relativeTime(r.createdAt)}</span>
                        </div>
                        <p className="text-[13px] text-[color:#d1d5db]">{r.text}</p>
                        {r.hasMedia && <span className="text-[11px] text-[color:#3b82f6] mt-1 inline-block">📎 Media attached</span>}
                      </div>
                    ))}
                    {reports.length === 0 && <div className="text-[13px] text-[color:#9ca3af]">No reports loaded for this incident.</div>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <AuthorityActionPanel incident={incident} onChangeStatus={handleChangeStatus} onAddNote={handleAddNote} busy={busy} />

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TabButton active={historyTab === 'timeline'} onClick={() => setHistoryTab('timeline')}>Timeline</TabButton>
                    <TabButton active={historyTab === 'audit'} onClick={() => setHistoryTab('audit')}>Audit Log</TabButton>
                  </div>
                  {historyTab === 'timeline' ? <IncidentTimeline events={history} /> : <AuditHistory events={history} />}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <div className="text-[11px] text-[color:#9ca3af]">{label}</div>
      <div className={mono ? 'font-mono' : ''}>{value ?? '—'}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-md text-[12px] font-medium ${
        active ? 'bg-[color:#1f2937] border border-[color:#374151]' : 'text-[color:#d1d5db]'
      }`}
    >
      {children}
    </button>
  );
}
