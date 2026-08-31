import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Settings2, MapPin, Paperclip } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import AIConfidenceBadge from '../components/AIConfidenceBadge';
import IncidentTimeline from '../components/IncidentTimeline';
import AuditHistory from '../components/AuditHistory';
import AuthorityActionPanel from '../components/AuthorityActionPanel';
import VolunteerSuggestions from '../components/VolunteerSuggestions';
import Toast from '../components/Toast';
import { useIncident } from '../hooks/useIncident';
import { incidentService } from '../services/incidentService';
import { relativeTime } from '../utils/formatters';
import { CONFIDENCE_LABELS, SCORING_METHOD_LABELS, TAG_LABELS, SOURCE_LABELS } from '../utils/constants';

export default function IncidentDetailsPage({ incidentId, authority, onBack, onNavigate }) {
  const { incident, reports, suggestedVolunteerDetails, history, loading, error, refresh } = useIncident(incidentId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [historyTab, setHistoryTab] = useState('timeline');

  const handleChangeStatus = async (status, note) => {
    setBusy(true);
    try {
      await incidentService.updateStatus(incidentId, status, note);
      await refresh();
      setToast({ message: `Status updated.`, tone: 'success' });
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

  const handleConfirmVolunteer = async (volunteerId, volunteerName) => {
    setBusy(true);
    try {
      await incidentService.confirmVolunteer(incidentId, volunteerId, volunteerName);
      await refresh();
      setToast({ message: `Confirmed ${volunteerName || volunteerId} for this incident.`, tone: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to confirm volunteer.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'var(--cm-font-body)' }}>
      <Sidebar active="incidents" onNavigate={onNavigate} authority={authority} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <TopBar eventName={incident?.severitySummary || 'Incident Detail'} lastSync={new Date()} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6">
          <button onClick={onBack} className="cm-focusable flex items-center gap-1.5 text-[13px] text-[color:var(--cm-text-secondary)] hover:text-[color:var(--cm-text-primary)] mb-4">
            <ArrowLeft size={14} aria-hidden="true" /> Back to Command Center
          </button>

          {loading && <div className="cm-glass-panel h-40 animate-pulse" />}
          {error && <div className="cm-glass-panel p-6 text-[color:var(--cm-danger)] text-sm">Couldn't load this incident.</div>}

          {incident && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 flex flex-col gap-5">
                <div className="cm-glass-panel p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="cm-mono text-[12px] text-[color:var(--cm-text-muted)]">{incident.incidentId}</span>
                    <StatusBadge status={incident.status} />
                  </div>
                  <h1 className="text-xl font-semibold mb-3" style={{ fontFamily: 'var(--cm-font-display)' }}>
                    {incident.severitySummary || TAG_LABELS[incident.primaryTag]}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6">
                    <SeverityBadge priorityScore={incident.priorityScore} severity={incident.severity} size="lg" />
                    <AIConfidenceBadge confidence={incident.confidence} scoringMethod={incident.scoringMethod} needsHumanReview={incident.needsHumanReview} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-[color:var(--cm-border)] text-[13px]">
                    <Field label="Type" value={TAG_LABELS[incident.primaryTag] || incident.primaryTag} />
                    <Field label="Latitude" value={incident.centerLocation?.lat.toFixed(4)} mono />
                    <Field label="Longitude" value={incident.centerLocation?.lng.toFixed(4)} mono />
                    <Field label="Reports" value={incident.reportCount} />
                    <Field label="Needed Skills" value={incident.neededSkills?.length ? incident.neededSkills.join(', ') : '—'} />
                    <Field label="Last Updated" value={relativeTime(incident.updatedAt)} />
                  </div>
                </div>

                {/* AI Prioritization / Rule-Based Fallback explainability panel — Phase 15 */}
                <AIPrioritizationPanel incident={incident} />

                <div className="cm-glass-panel p-5">
                  <div className="text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] font-medium mb-3">
                    Suggested Volunteers
                  </div>
                  <VolunteerSuggestions suggestedVolunteerDetails={suggestedVolunteerDetails} onConfirm={handleConfirmVolunteer} busy={busy} />
                </div>

                <div className="cm-glass-panel p-5">
                  <div className="text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] font-medium mb-3">
                    Raw Reports ({reports.length})
                  </div>
                  <div className="flex flex-col gap-3">
                    {reports.map((r) => (
                      <div key={r.reportId} className="border border-[color:var(--cm-border)] rounded-md p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="cm-mono text-[10px] px-1.5 py-0.5 rounded bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)]">
                            {SOURCE_LABELS[r.source] || r.source}
                          </span>
                          <span className="text-[11px] text-[color:var(--cm-text-muted)]">{relativeTime(r.createdAt)}</span>
                        </div>
                        {r.text && <p className="text-[13px] text-[color:var(--cm-text-secondary)]">{r.text}</p>}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[color:var(--cm-text-muted)]">
                          {r.locationText && (
                            <span className="flex items-center gap-1"><MapPin size={11} aria-hidden="true" /> {r.locationText}</span>
                          )}
                          {r.mediaUrls?.length > 0 && (
                            <span className="flex items-center gap-1"><Paperclip size={11} aria-hidden="true" /> {r.mediaUrls.length} attachment(s)</span>
                          )}
                          {r.isEmergency && <span className="text-[color:var(--cm-danger)] font-medium">EMERGENCY</span>}
                        </div>
                      </div>
                    ))}
                    {reports.length === 0 && <div className="text-[13px] text-[color:var(--cm-text-muted)]">No reports loaded for this incident.</div>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <AuthorityActionPanel incident={incident} onChangeStatus={handleChangeStatus} onAddNote={handleAddNote} busy={busy} />

                <div className="cm-glass-panel p-5">
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

/**
 * Explainability panel required by Phase 15 — shows exactly the fields the
 * guide specifies, in AI or fallback framing depending on scoringMethod.
 * Color is never the only signal: the heading text itself says which path
 * produced this score.
 */
function AIPrioritizationPanel({ incident }) {
  const isFallback = incident.scoringMethod === 'rule_based_fallback';
  const Icon = isFallback ? Settings2 : Sparkles;

  return (
    <div className="cm-glass-panel p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{ color: isFallback ? 'var(--cm-text-secondary)' : 'var(--cm-ai-accent)' }} aria-hidden="true" />
        <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: isFallback ? 'var(--cm-text-secondary)' : 'var(--cm-ai-accent)' }}>
          {isFallback ? 'Rule-Based Fallback' : 'AI Prioritization'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-[13px]">
        <Field label="Priority" value={`${incident.priorityScore}/100`} />
        <Field label="Confidence" value={CONFIDENCE_LABELS[incident.confidence] || incident.confidence} />
        <Field label="Method" value={SCORING_METHOD_LABELS[incident.scoringMethod] || incident.scoringMethod} />
        <Field
          label="Human Review"
          value={incident.needsHumanReview ? 'Required' : 'Not required'}
          valueColor={incident.needsHumanReview ? 'var(--cm-warning)' : 'var(--cm-operational)'}
        />
      </div>
    </div>
  );
}

function Field({ label, value, mono, valueColor }) {
  return (
    <div>
      <div className="text-[11px] text-[color:var(--cm-text-muted)]">{label}</div>
      <div className={mono ? 'cm-mono' : ''} style={valueColor ? { color: valueColor, fontWeight: 600 } : undefined}>{value ?? '—'}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`cm-focusable px-2.5 py-1.5 rounded-md text-[12px] font-medium ${
        active ? 'bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)]' : 'text-[color:var(--cm-text-secondary)]'
      }`}
    >
      {children}
    </button>
  );
}
