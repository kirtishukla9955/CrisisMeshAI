import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Search, MoreHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge';
import IncidentCard from './IncidentCard';
import EmptyState from './EmptyState';
import { SEVERITY_STYLES, TAG_LABELS } from '../utils/constants';

const PAGE_SIZE = 8;

const SORT_FIELDS = {
  priority: (i) => i.priorityScore,
  status: (i) => i.status,
  type: (i) => i.primaryTag,
};

/**
 * Main incidents table (Phase 10), columns per the mockup exactly: Type,
 * Status, Location, Priority, Reported By, Action. Sortable, searchable,
 * paginated. Below the `md` breakpoint it renders as a stacked list of
 * IncidentCard instead of a cramped table (Phase 20 responsive rule).
 *
 * `reportedByLookup` is an OPTIONAL {incidentId: displayName} map. Member 4
 * does not fetch per-row reporter identity by default (that would mean an
 * expensive per-incident report read for every visible row) — if the
 * caller has this data already (e.g. from demo seed data, or a future
 * batched endpoint), pass it in; otherwise the column shows "—" rather
 * than fabricating a name.
 */
export default function IncidentsTable({ incidents = [], loading, error, onOpen, reportedByLookup = {} }) {
  const [sortField, setSortField] = useState('priority');
  const [sortDesc, setSortDesc] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = incidents;
    if (q) {
      list = list.filter(
        (i) =>
          i.incidentId.toLowerCase().includes(q) ||
          (i.severitySummary || '').toLowerCase().includes(q) ||
          (TAG_LABELS[i.primaryTag] || '').toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      const av = SORT_FIELDS[sortField](a);
      const bv = SORT_FIELDS[sortField](b);
      if (av < bv) return sortDesc ? 1 : -1;
      if (av > bv) return sortDesc ? -1 : 1;
      return 0;
    });
    return sorted;
  }, [incidents, search, sortField, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDesc((d) => !d);
    else { setSortField(field); setSortDesc(true); }
  };

  if (loading) {
    return <div className="cm-glass-panel h-64 animate-pulse" />;
  }
  if (error) {
    return <div className="cm-glass-panel p-6 text-center text-[color:var(--cm-danger)] text-sm">Couldn't load incidents.</div>;
  }
  if (incidents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="cm-glass-panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-[color:var(--cm-border)]">
        <div className="font-semibold text-[14px]">Incidents</div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[color:var(--cm-text-muted)]" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search incidents"
            aria-label="Search incidents"
            className="cm-focusable pl-8 pr-3 py-1.5 rounded-md bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)] text-[12px] outline-none w-44"
          />
        </div>
      </div>

      {/* Table — md and up */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] border-b border-[color:var(--cm-border)]">
              <SortableHeader label="Type" field="type" sortField={sortField} sortDesc={sortDesc} onSort={toggleSort} />
              <SortableHeader label="Status" field="status" sortField={sortField} sortDesc={sortDesc} onSort={toggleSort} />
              <th className="px-4 py-2.5 font-medium">Location</th>
              <SortableHeader label="Priority" field="priority" sortField={sortField} sortDesc={sortDesc} onSort={toggleSort} />
              <th className="px-4 py-2.5 font-medium">Reported By</th>
              <th className="px-4 py-2.5 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((incident) => {
              const style = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.moderate;
              return (
                <tr key={incident.incidentId} className="border-b border-[color:var(--cm-border)] last:border-0 hover:bg-[color:var(--cm-bg-panel-raised)]">
                  <td className="px-4 py-3">{TAG_LABELS[incident.primaryTag] || incident.primaryTag}</td>
                  <td className="px-4 py-3"><StatusBadge status={incident.status} /></td>
                  <td className="px-4 py-3 cm-mono text-[12px] text-[color:var(--cm-text-secondary)]">
                    {incident.centerLocation ? `${incident.centerLocation.lat.toFixed(2)}, ${incident.centerLocation.lng.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="cm-mono font-semibold" style={{ color: style.color }}>{style.label}</span>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--cm-text-secondary)]">
                    {reportedByLookup[incident.incidentId] || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onOpen(incident.incidentId)}
                      className="cm-focusable p-1.5 rounded-md hover:bg-[color:var(--cm-bg-panel)]"
                      aria-label={`Open incident ${incident.incidentId}`}
                    >
                      <MoreHorizontal size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stacked cards — below md */}
      <div className="md:hidden flex flex-col gap-3 p-4">
        {pageItems.map((incident) => (
          <IncidentCard key={incident.incidentId} incident={incident} onOpen={onOpen} />
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-[color:var(--cm-border)] text-[12px] text-[color:var(--cm-text-muted)]">
        <span>{filtered.length} incident{filtered.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="cm-focusable px-2 py-1 rounded border border-[color:var(--cm-border-strong)] disabled:opacity-40"
          >
            Prev
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="cm-focusable px-2 py-1 rounded border border-[color:var(--cm-border-strong)] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableHeader({ label, field, sortField, sortDesc, onSort }) {
  const active = sortField === field;
  return (
    <th className="px-4 py-2.5 font-medium">
      <button onClick={() => onSort(field)} className="cm-focusable flex items-center gap-1 hover:text-[color:var(--cm-text-primary)]">
        {label}
        <ArrowUpDown size={11} aria-hidden="true" style={{ opacity: active ? 1 : 0.4, transform: active && !sortDesc ? 'scaleY(-1)' : undefined }} />
      </button>
    </th>
  );
}
