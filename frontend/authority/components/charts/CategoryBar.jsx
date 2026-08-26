import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CATEGORY_LABELS } from '../../utils/constants';

/** data: [{ category: 'flood', count: 12 }, ...] */
export default function CategoryBar({ data }) {
  const chartData = (data || []).map((d) => ({ name: CATEGORY_LABELS[d.category] || d.category, count: d.count }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--cm-border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'var(--cm-text-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--cm-border-strong)' }} />
        <YAxis tick={{ fill: 'var(--cm-text-muted)', fontSize: 11 }} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ background: 'var(--cm-bg-panel-raised)', border: '1px solid var(--cm-border-strong)', borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="count" fill="var(--cm-info)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
