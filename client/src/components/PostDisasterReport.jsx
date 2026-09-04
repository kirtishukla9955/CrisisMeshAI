import React from 'react';
import AIConfidenceBadge from './AIConfidenceBadge';
import CategoryBar from './charts/CategoryBar';

export default function PostDisasterReport({ report }) {
  if (!report) return null;

  const isFallback = report.generatedBy === 'rule_based_fallback';

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#17324A] border border-white/10 rounded-xl p-5 flex items-center justify-between flex-wrap gap-4 shadow-lg">
        <div>
          <div className="text-xs font-mono tracking-[0.2em] text-white/50">
            {isFallback ? 'FALLBACK REPORT' : 'AI GENERATED'}
          </div>
          <div className="text-sm text-white/60 mt-1">
            Data analyzed: {report.dataAnalyzed?.reportsAnalyzed ?? '—'} reports ·{' '}
            {report.dataAnalyzed?.incidentsAnalyzed ?? '—'} incidents
          </div>
        </div>
        <AIConfidenceBadge confidence={report.confidence} fallbackUsed={isFallback} />
      </div>

      <Section title="Executive Summary">
        <p className="text-sm leading-relaxed text-white/80">{report.executiveSummary}</p>
      </Section>

      <Section title="Disaster Impact">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Total Incidents" value={report.impact?.totalIncidents} />
          <Stat label="Critical" value={report.impact?.criticalIncidents} color="#e74c3c" />
          <Stat label="High Severity" value={report.impact?.highSeverityIncidents} color="#e67e22" />
          <Stat label="Affected Areas" value={report.impact?.affectedAreas?.length ?? 0} />
        </div>
      </Section>

      <Section title="Hardest-Hit Areas">
        {report.hardestHitAreas?.length ? (
          <ol className="flex flex-col gap-2">
            {report.hardestHitAreas.map((area, i) => (
              <li key={area} className="flex items-center gap-3 text-sm text-white/80">
                <span className="font-mono w-6 text-white/40">{String(i + 1).padStart(2, '0')}</span>
                {area}
              </li>
            ))}
          </ol>
        ) : (
          <Empty text="No area-level ranking available from the source data." />
        )}
      </Section>

      <Section title="Response Performance">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Stat
            label="Avg. Response Time"
            value={report.responsePerformance?.averageResponseTimeMinutes ?? '—'}
            suffix={report.responsePerformance?.averageResponseTimeMinutes ? 'min' : ''}
          />
          <Stat label="Unresolved" value={report.responsePerformance?.unresolvedCount ?? '—'} color="#f1c40f" />
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
              <span key={item} className="font-mono text-xs px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/10 text-white/80">
                {item}
              </span>
            ))}
          </div>
        ) : (
          <Empty text="No recurring infrastructure failures identified in the reported data." />
        )}
      </Section>

      <Section title="Key Findings">
        <ul className="flex flex-col gap-3">
          {report.keyFindings?.map((finding, i) => (
            <li key={i} className="text-sm text-white/80 flex items-start gap-3">
              <span className="text-[#9b59b6] mt-0.5">▸</span>
              {finding}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Recommendations">
        <ul className="flex flex-col gap-3">
          {report.recommendations?.map((rec, i) => (
            <li key={i} className="text-sm text-white/80 flex items-start gap-3">
              <span className="text-[#2ecc71] mt-0.5">✓</span>
              {rec}
            </li>
          ))}
        </ul>
      </Section>

      <div className="text-center text-xs text-white/40 italic pt-4">
        AI assists the authority. It never silently makes the final decision.
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#17324A] border border-white/10 rounded-xl p-6 shadow-lg">
      <div className="text-xs uppercase tracking-wider text-white/50 font-bold mb-4">{title}</div>
      {children}
    </div>
  );
}

function Stat({ label, value, color = '#ffffff', suffix = '' }) {
  return (
    <div>
      <div className="font-mono text-2xl font-bold" style={{ color }}>{value ?? '—'} <span className="text-sm font-normal text-white/50">{suffix}</span></div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="text-sm text-white/40 italic">{text}</div>;
}
