import React, { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import KPICard from '../components/KPICard';
import LiveCrisisMap from '../components/LiveCrisisMap';
import TopPriorityIncidents from '../components/TopPriorityIncidents';
import QuickReportPanel from '../components/QuickReportPanel';
import AlertsFeed from '../components/AlertsFeed';
import IncidentsTable from '../components/IncidentsTable';
import ReviewQueue from '../components/ReviewQueue';
import { useIncidents } from '../hooks/useIncidents';
import { useAlertsFeed } from '../hooks/useAlertsFeed';

/**
 * Command Center — matches the Round 2 mockup layout: Top 3 Priority +
 * Live Crisis Map on the left, Quick Report shortcut in the middle,
 * real-time Alerts Feed on the right, and the full incidents table below.
 *
 * `MapComponent` and `onOpenQuickReport` are integration props — Member 4
 * doesn't own the map or report intake (Phases 10/12). Pass Member 2's
 * real map component and Member 1's real quick-report opener once
 * integrated; both degrade to clearly-labeled placeholders otherwise.
 */
export default function CommandCenterPage({ authority, onOpenIncident, onNavigate, MapComponent, onOpenQuickReport }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState('incidents'); // 'incidents' | 'review'
  const { incidents, loading, error } = useIncidents();
  const { alerts, loading: alertsLoading, error: alertsError } = useAlertsFeed();

  const kpis = useMemo(() => {
    const active = incidents.filter((i) => i.status !== 'resolved');
    const critical = incidents.filter((i) => i.severity === 'critical');
    const resolved = incidents.filter((i) => i.status === 'resolved');
    const pendingReview = incidents.filter(
      (i) => i.needsHumanReview || i.scoringMethod === 'rule_based_fallback'
    );
    return { active: active.length, critical: critical.length, resolved: resolved.length, pendingReview: pendingReview.length };
  }, [incidents]);

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'var(--cm-font-body)' }}>
      <Sidebar active="dashboard" onNavigate={onNavigate} authority={authority} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <TopBar lastSync={new Date()} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard label="Active Incidents" value={kpis.active} accentColor="var(--cm-info)" />
            <KPICard label="Critical" value={kpis.critical} accentColor="var(--cm-critical)" />
            <KPICard label="Pending Review" value={kpis.pendingReview} accentColor="var(--cm-warning)" />
            <KPICard label="Resolved" value={kpis.resolved} accentColor="var(--cm-operational)" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-4">
              <TopPriorityIncidents incidents={incidents} onSelect={onOpenIncident} />
              <LiveCrisisMap incidents={incidents} onIncidentSelect={onOpenIncident} MapComponent={MapComponent} />
            </div>
            <div className="lg:col-span-1">
              <QuickReportPanel onOpenQuickReport={onOpenQuickReport} />
            </div>
            <div className="lg:col-span-1">
              <AlertsFeed alerts={alerts} loading={alertsLoading} error={alertsError} onSelect={onOpenIncident} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TabButton active={tab === 'incidents'} onClick={() => setTab('incidents')}>All Incidents</TabButton>
            <TabButton active={tab === 'review'} onClick={() => setTab('review')}>Human Review Queue</TabButton>
          </div>
          {tab === 'incidents' ? (
            <IncidentsTable incidents={incidents} loading={loading} error={error} onOpen={onOpenIncident} />
          ) : (
            <ReviewQueue incidents={incidents} onOpen={onOpenIncident} />
          )}
        </main>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`cm-focusable px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
        active
          ? 'bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)]'
          : 'text-[color:var(--cm-text-secondary)] hover:text-[color:var(--cm-text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}
