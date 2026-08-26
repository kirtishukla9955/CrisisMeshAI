import React, { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import KPICard from '../components/KPICard';
import IncidentList from '../components/IncidentList';
import ReviewQueue from '../components/ReviewQueue';
import SeverityDonut from '../components/charts/SeverityDonut';
import { useIncidents } from '../hooks/useIncidents';

/**
 * Command Center — the authority's default landing page. KPIs are derived
 * live from the incidents snapshot; nothing here is hardcoded (project
 * brief section 8: "calculated dynamically from Firestore").
 */
export default function CommandCenterPage({ authority, onOpenIncident, onNavigate }) {
  const [tab, setTab] = useState('priority'); // 'priority' | 'review'
  const { incidents, loading, error } = useIncidents();

  const kpis = useMemo(() => {
    const active = incidents.filter((i) => !['resolved', 'rejected'].includes(i.status));
    const critical = incidents.filter((i) => i.severity === 'critical');
    const high = incidents.filter((i) => i.severity === 'high');
    const resolved = incidents.filter((i) => i.status === 'resolved');
    const pendingReview = incidents.filter(
      (i) => i.aiFallbackUsed || (i.aiConfidence !== undefined && i.aiConfidence < 0.6)
    );
    const confidences = incidents.filter((i) => !i.aiFallbackUsed && typeof i.aiConfidence === 'number');
    const avgConfidence = confidences.length
      ? Math.round((confidences.reduce((sum, i) => sum + i.aiConfidence, 0) / confidences.length) * 100)
      : null;

    return {
      active: active.length,
      critical: critical.length,
      high: high.length,
      resolved: resolved.length,
      pendingReview: pendingReview.length,
      avgConfidence,
    };
  }, [incidents]);

  const severityData = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    incidents.forEach((i) => { if (counts[i.severity] !== undefined) counts[i.severity] += 1; });
    return Object.entries(counts).map(([severity, count]) => ({ severity, count }));
  }, [incidents]);

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'var(--cm-font-body)' }}>
      <Sidebar active="command-center" onNavigate={onNavigate} authority={authority} />
      <div className="flex-1 min-w-0">
        <TopBar lastSync={new Date()} />
        <main className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KPICard label="Active Incidents" value={kpis.active} accentColor="var(--cm-info)" />
            <KPICard label="Critical" value={kpis.critical} accentColor="var(--cm-critical)" />
            <KPICard label="High Priority" value={kpis.high} accentColor="var(--cm-high)" />
            <KPICard label="Resolved" value={kpis.resolved} accentColor="var(--cm-operational)" />
            <KPICard label="Pending Review" value={kpis.pendingReview} accentColor="var(--cm-warning)" />
            <KPICard label="AI Confidence" value={kpis.avgConfidence} suffix={kpis.avgConfidence !== null ? '%' : ''} accentColor="var(--cm-ai-accent)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <TabButton active={tab === 'priority'} onClick={() => setTab('priority')}>Priority Queue</TabButton>
                <TabButton active={tab === 'review'} onClick={() => setTab('review')}>Human Review Queue</TabButton>
              </div>
              {tab === 'priority' ? (
                <IncidentList incidents={incidents} loading={loading} error={error} onOpen={onOpenIncident} />
              ) : (
                <ReviewQueue incidents={incidents} onOpen={onOpenIncident} />
              )}
            </div>

            <div className="cm-glass-panel p-5">
              <div className="text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] font-medium mb-2">
                Incident Severity
              </div>
              <SeverityDonut data={severityData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
        active
          ? 'bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)]'
          : 'text-[color:var(--cm-text-secondary)] hover:text-[color:var(--cm-text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}
