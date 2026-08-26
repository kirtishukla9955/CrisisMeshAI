import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SEVERITY_STYLES } from '../../utils/constants';

/** data: [{ severity: 'critical', count: 8 }, ...] */
export default function SeverityDonut({ data }) {
  const chartData = (data || []).map((d) => ({ name: SEVERITY_STYLES[d.severity]?.label || d.severity, value: d.count, severity: d.severity }));

  if (chartData.every((d) => d.value === 0)) {
    return <div className="text-[13px] text-[color:var(--cm-text-muted)] h-[220px] flex items-center justify-center">No severity data yet.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
          {chartData.map((d) => (
            <Cell key={d.severity} fill={SEVERITY_STYLES[d.severity]?.color || '#94A3B8'} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'var(--cm-bg-panel-raised)', border: '1px solid var(--cm-border-strong)', borderRadius: 8, fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
