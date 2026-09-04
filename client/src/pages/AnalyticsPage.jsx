import React, { useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useFirestoreIncidents } from '../hooks/useFirestoreIncidents';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

export default function AnalyticsPage({ authority }) {
  const navigate = useNavigate();
  const { incidents, loading } = useFirestoreIncidents();

  const onNavigate = (key) => {
    if (key === 'command-center') navigate('/authority/dashboard');
    else if (key === 'ai-reports') navigate('/authority/reports');
    else navigate(`/authority/${key}`);
  };

  const stats = useMemo(() => {
    if (!incidents.length) return null;
    
    let critical = 0;
    let resolved = 0;
    let newInc = 0;
    let inProgress = 0;
    
    const byTagMap = {};
    
    incidents.forEach(inc => {
      if (inc.priorityScore >= 80) critical++;
      if (inc.status === 'resolved') resolved++;
      if (inc.status === 'new') newInc++;
      if (inc.status === 'in_progress' || inc.status === 'dispatched') inProgress++;
      
      const tag = inc.primaryTag || 'Other';
      byTagMap[tag] = (byTagMap[tag] || 0) + 1;
    });

    const byTag = Object.keys(byTagMap).map(key => ({ name: key, value: byTagMap[key] })).sort((a,b) => b.value - a.value);
    
    const byStatus = [
      { name: 'New', value: newInc },
      { name: 'In Progress', value: inProgress },
      { name: 'Resolved', value: resolved }
    ];
    
    return {
      total: incidents.length,
      critical,
      resolved,
      inProgress,
      newInc,
      byTag,
      byStatus
    };
  }, [incidents]);

  return (
    <div className="flex min-h-screen">
      <Sidebar active="analytics" onNavigate={onNavigate} authority={authority} />
      <div className="flex-1 min-w-0 bg-[#0f2337] text-white overflow-y-auto">
        <TopBar eventName="Crisis Analytics Dashboard" lastSync={new Date()} />
        <main className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
          
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="h-6 w-6 text-[#00C49F]" /> 
              Real-time Analytics
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Data-driven overview of current disaster response operations.
            </p>
          </div>

          {loading || !stats ? (
            <div className="p-12 text-center text-white/50 animate-pulse bg-[#17324A] rounded-xl border border-white/10">
              Gathering analytics data...
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#17324A] p-5 rounded-xl border border-white/10 shadow-lg">
                  <div className="flex items-center gap-3 mb-2 text-white/50">
                    <AlertOctagon className="h-5 w-5 text-[#E67E22]" />
                    <span className="font-medium">Total Incidents</span>
                  </div>
                  <div className="text-4xl font-black text-white">{stats.total}</div>
                </div>
                <div className="bg-[#17324A] p-5 rounded-xl border border-[#C0392B]/30 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#C0392B]/10 rounded-bl-full" />
                  <div className="flex items-center gap-3 mb-2 text-white/50">
                    <Activity className="h-5 w-5 text-[#C0392B]" />
                    <span className="font-medium">Critical (80+)</span>
                  </div>
                  <div className="text-4xl font-black text-[#C0392B]">{stats.critical}</div>
                </div>
                <div className="bg-[#17324A] p-5 rounded-xl border border-white/10 shadow-lg">
                  <div className="flex items-center gap-3 mb-2 text-white/50">
                    <Clock className="h-5 w-5 text-[#3498DB]" />
                    <span className="font-medium">Active / In Progress</span>
                  </div>
                  <div className="text-4xl font-black text-[#3498DB]">{stats.newInc + stats.inProgress}</div>
                </div>
                <div className="bg-[#17324A] p-5 rounded-xl border border-white/10 shadow-lg">
                  <div className="flex items-center gap-3 mb-2 text-white/50">
                    <CheckCircle2 className="h-5 w-5 text-[#2ECC71]" />
                    <span className="font-medium">Resolved</span>
                  </div>
                  <div className="text-4xl font-black text-[#2ECC71]">{stats.resolved}</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-[#17324A] p-5 rounded-xl border border-white/10 shadow-lg">
                  <h3 className="text-lg font-semibold text-white/90 mb-6">Incidents by Type</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.byTag.slice(0, 7)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={10} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} allowDecimals={false} />
                        <Tooltip 
                          cursor={{fill: 'rgba(255,255,255,0.05)'}}
                          contentStyle={{ backgroundColor: '#0f2337', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="value" fill="#3498DB" radius={[4, 4, 0, 0]} barSize={40}>
                          {stats.byTag.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#17324A] p-5 rounded-xl border border-white/10 shadow-lg">
                  <h3 className="text-lg font-semibold text-white/90 mb-2">Resolution Status</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.byStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#FF8042" /> {/* New */}
                          <Cell fill="#3498DB" /> {/* In Progress */}
                          <Cell fill="#2ECC71" /> {/* Resolved */}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f2337', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </>
          )}
          
        </main>
      </div>
    </div>
  );
}
