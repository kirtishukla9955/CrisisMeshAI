import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

/** data: [{ label: 'Ward 14', minutes: 22 }, ...] */
export default function ResponseTimeChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-[13px] text-[color:var(--cm-text-muted)] h-[220px] flex items-center justify-center">Not enough resolved incidents yet to chart response time.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="cmResponseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cm-info)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--cm-info)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--cm-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: 'var(--cm-text-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--cm-border-strong)' }} />
        <YAxis tick={{ fill: 'var(--cm-text-muted)', fontSize: 11 }} axisLine={false} unit="m" />
        <Tooltip contentStyle={{ background: 'var(--cm-bg-panel-raised)', border: '1px solid var(--cm-border-strong)', borderRadius: 8, fontSize: 12 }} />
        <Area type="monotone" dataKey="minutes" stroke="var(--cm-info)" fill="url(#cmResponseFill)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
