import React from 'react';
import AIConfidenceBadge from './AIConfidenceBadge';
import CategoryBar from './charts/CategoryBar';

/**
 * Renders a stored PostDisasterReport (AI-generated or rule-based
 * fallback). Section headers mirror the structure required in project
 * brief section 21 exactly, so nothing the AI/fallback returns is dropped.
 */
export default function PostDisasterReport({ report }) {
  if (!report) return null;

  const isFallback = report.generatedBy === 'rule_based_fallback';

  return (
    <div className="flex flex-col gap-5">
      <div className="cm-glass-panel p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="cm-mono text-[11px] tracking-[0.2em] text-[color:var(--cm-text-muted)]">
            {isFallback ? 'FALLBACK REPORT' : 'AI GENERATED'}
          </div>
          <div className="text-[13px] text-[color:var(--cm-text-secondary)] mt-1">
            Data analyzed: {report.dataAnalyzed?.reportsAnalyzed ?? '—'} reports ·{' '}
            {report.dataAnalyzed?.incidentsAnalyzed ?? '—'} incidents
          </div>
        </div>
        <AIConfidenceBadge confidence={report.confidence} fallbackUsed={isFallback} />
      </div>

      <Section title="Executive Summary">
        <p className="text-[13px] leading-relaxed text-[color:var(--cm-text-secondary)]">{report.executiveSummary}</p>
      </Section>

      <Section title="Disaster Impact">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Total Incidents" value={report.impact?.totalIncidents} />
          <Stat label="Critical" value={report.impact?.criticalIncidents} color="var(--cm-critical)" />
          <Stat label="High Severity" value={report.impact?.highSeverityIncidents} color="var(--cm-high)" />
          <Stat label="Affected Areas" value={report.impact?.affectedAreas?.length ?? 0} />
        </div>
      </Section>

      <Section title="Hardest-Hit Areas">
        {report.hardestHitAreas?.length ? (
          <ol className="flex flex-col gap-2">
            {report.hardestHitAreas.map((area, i) => (
              <li key={area} className="flex items-center gap-3 text-[13px]">
                <span className="cm-mono w-6 text-[color:var(--cm-text-muted)]">{String(i + 1).padStart(2, '0')}</span>
                {area}
              </li>
            ))}
          </ol>
        ) : (
          <Empty text="No area-level ranking available from the source data." />
        )}
      </Section>

      <Section title="Response Performance">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat
            label="Avg. Response Time"
            value={report.responsePerformance?.averageResponseTimeMinutes ?? '—'}
            suffix={report.responsePerformance?.averageResponseTimeMinutes ? 'min' : ''}
          />
          <Stat label="Unresolved" value={report.responsePerformance?.unresolvedCount ?? '—'} color="var(--cm-warning)" />
          <Stat label="Slowest Incidents" value={report.responsePerformance?.slowestIncidents?.length ?? 0} />
        </div>
      </Section>

      {report.incidentBreakdown?.length > 0 && (
        <Section title="Incident Breakdown">
          <CategoryBar data={report.incidentBreakdown} />
        </Section>
      )}

      <Section title="Infrastructure Impact">
        {report.infrastructureImpact?.length ? (
          <div className="flex flex-wrap gap-2">
            {report.infrastructureImpact.map((item) => (
              <span key={item} className="cm-mono text-[11px] px-2.5 py-1 rounded-md bg-[color:var(--cm-bg-panel-raised)] border border-[color:var(--cm-border-strong)]">
                {item}
              </span>
            ))}
          </div>
        ) : (
          <Empty text="No recurring infrastructure failures identified in the reported data." />
        )}
      </Section>

      <Section title="Key Findings">
        <ul className="flex flex-col gap-2">
          {report.keyFindings?.map((finding, i) => (
            <li key={i} className="text-[13px] text-[color:var(--cm-text-secondary)] flex gap-2">
              <span style={{ color: 'var(--cm-ai-accent)' }}>▸</span>
              {finding}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Recommendations">
        <ul className="flex flex-col gap-2">
          {report.recommendations?.map((rec, i) => (
            <li key={i} className="text-[13px] text-[color:var(--cm-text-secondary)] flex gap-2">
              <span style={{ color: 'var(--cm-operational)' }}>✓</span>
              {rec}
            </li>
          ))}
        </ul>
      </Section>

      <div className="text-center text-[11px] text-[color:var(--cm-text-muted)] italic pt-2">
        AI assists the authority. It never silently makes the final decision.
      </div>
    </div>
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
