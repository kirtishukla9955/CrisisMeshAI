import React from 'react';
import { Printer, Sparkles, Settings2 } from 'lucide-react';
import CategoryBar from './charts/CategoryBar';
import { clockTime } from '../utils/formatters';

/**
 * Renders a stored `insight_reports` document (AI-generated or rule-based
 * fallback). Section structure mirrors the canonical shape exactly plus
 * Member 4's documented extension fields — see
 * shared/schemas/incidentSchema.js -> InsightReport typedef.
 */
export default function PostDisasterReport({ report }) {
  if (!report) return null;

  const isFallback = report.generatedBy === 'rule_based_fallback';

  return (
    <div className="flex flex-col gap-5">
      <div className="cm-glass-panel p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="cm-mono text-[11px] tracking-[0.2em] text-[color:var(--cm-text-muted)]">
            {report.periodCovered ? `${formatDate(report.periodCovered.from)} — ${formatDate(report.periodCovered.to)}` : 'PERIOD UNKNOWN'}
          </div>
          <div className="text-[13px] text-[color:var(--cm-text-secondary)] mt-1">
            Generated {clockTime(report.generatedAt)} · Data analyzed: {report.dataAnalyzed?.reportsAnalyzed ?? '—'} reports ·{' '}
            {report.dataAnalyzed?.incidentsAnalyzed ?? '—'} incidents
            {report.excludedForUnknownResolution > 0 && (
              <> · {report.excludedForUnknownResolution} excluded (unknown resolution time)</>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 cm-no-print">
          <GeneratedByBadge isFallback={isFallback} />
          <button
            onClick={() => window.print()}
            className="cm-focusable flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] border border-[color:var(--cm-border-strong)] hover:bg-[color:var(--cm-bg-panel-raised)]"
          >
            <Printer size={13} aria-hidden="true" /> Export / Print
          </button>
        </div>
      </div>

      <Section title="Summary">
        <p className="text-[13px] leading-relaxed text-[color:var(--cm-text-secondary)]">{report.summaryText}</p>
      </Section>

      <Section title="Overview">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat label="Total Incidents" value={report.totalIncidents} />
          <Stat
            label="Avg. Response Time"
            value={report.avgResponseTimeMinutes ?? '—'}
            suffix={report.avgResponseTimeMinutes !== null && report.avgResponseTimeMinutes !== undefined ? 'min' : ''}
          />
          <Stat label="Worst-Hit Areas" value={report.worstHitAreas?.length ?? 0} />
        </div>
      </Section>

      <Section title="Worst-Hit Areas">
        {report.worstHitAreas?.length ? (
          <>
            <ol className="flex flex-col gap-2 mb-3">
              {report.worstHitAreas.map((area, i) => (
                <li key={area.areaName} className="flex items-center gap-3 text-[13px]">
                  <span className="cm-mono w-6 text-[color:var(--cm-text-muted)]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1">{area.areaName}</span>
                  <span className="cm-mono text-[color:var(--cm-text-secondary)]">{area.incidentCount} incident{area.incidentCount !== 1 ? 's' : ''}</span>
                </li>
              ))}
            </ol>
            <CategoryBar data={report.worstHitAreas.map((a) => ({ category: a.areaName, count: a.incidentCount }))} />
          </>
        ) : (
          <Empty text="No area-level ranking available from the source data." />
        )}
      </Section>

      <Section title="Response Performance">
        {report.slowestResponseAreas?.length ? (
          <div className="flex flex-wrap gap-2">
            {report.slowestResponseAreas.map((area) => (
              <span key={area} className="cm-mono text-[11px] px-2.5 py-1 rounded-md bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)]">
                {area}
              </span>
            ))}
          </div>
        ) : (
          <Empty text="No slowest-response areas identified — insufficient response-time data for this period." />
        )}
      </Section>

      {report.keyFindings?.length > 0 && (
        <Section title="Key Findings">
          <ul className="flex flex-col gap-2">
            {report.keyFindings.map((finding, i) => (
              <li key={i} className="text-[13px] text-[color:var(--cm-text-secondary)] flex gap-2">
                <span style={{ color: 'var(--cm-ai-accent)' }}>▸</span>
                {finding}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {report.recommendations?.length > 0 && (
        <Section title="Recommendations">
          <ul className="flex flex-col gap-2">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="text-[13px] text-[color:var(--cm-text-secondary)] flex gap-2">
                <span style={{ color: 'var(--cm-operational)' }}>✓</span>
                {rec}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="text-center text-[11px] text-[color:var(--cm-text-muted)] italic pt-2">
        AI assists the authority. It never silently makes the final decision.
      </div>
    </div>
  );
}

function GeneratedByBadge({ isFallback }) {
  const Icon = isFallback ? Settings2 : Sparkles;
  return (
    <span
      className="cm-mono inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium"
      style={
        isFallback
          ? { color: 'var(--cm-text-secondary)', background: 'var(--cm-bg-panel-raised)', borderColor: 'var(--cm-border-strong)' }
          : { color: 'var(--cm-ai-accent)', background: 'rgba(167,139,250,0.10)', borderColor: 'rgba(167,139,250,0.35)' }
      }
    >
      <Icon size={12} aria-hidden="true" />
      {isFallback ? 'Rule-Based Fallback' : 'AI Generated'}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div className="cm-glass-panel p-5">
      <div className="text-[11px] uppercase tracking-wider text-[color:var(--cm-text-muted)] font-medium mb-3">{title}</div>
      {children}
    </div>
  );
}

function Stat({ label, value, color = 'var(--cm-text-primary)', suffix = '' }) {
  return (
    <div>
      <div className="cm-mono text-xl font-semibold" style={{ color }}>{value ?? '—'} <span className="text-xs font-normal">{suffix}</span></div>
      <div className="text-[11px] text-[color:var(--cm-text-muted)]">{label}</div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="text-[13px] text-[color:var(--cm-text-muted)]">{text}</div>;
}

function formatDate(value) {
  if (!value) return '—';
  const d = value?.toDate ? value.toDate() : new Date(value);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
