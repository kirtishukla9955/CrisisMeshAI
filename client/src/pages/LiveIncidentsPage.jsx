import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { useFirestoreIncidents } from '../hooks/useFirestoreIncidents';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { relativeTime } from '../utils/formatters';

export default function LiveIncidentsPage({ authority }) {
  const navigate = useNavigate();
  const { incidents, loading } = useFirestoreIncidents();
  const [searchQuery, setSearchQuery] = useState("");

  const onNavigate = (key) => {
    if (key === 'command-center') navigate('/authority/dashboard');
    else if (key === 'ai-reports') navigate('/authority/reports');
    else navigate(`/authority/${key}`);
  };

  const filteredIncidents = incidents.filter(i => 
    i.primaryTag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.severitySummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.id.includes(searchQuery)
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar active="live-incidents" onNavigate={onNavigate} authority={authority} />
      <div className="flex-1 min-w-0 bg-[#0f2337] text-white">
        <TopBar eventName="Live Incidents" lastSync={new Date()} />
        <main className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">All Incidents</h1>
              <p className="text-white/50 text-sm mt-1">Review and manage all incoming disaster incidents.</p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search incidents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#17324A] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#E67E22] transition-colors"
              />
            </div>
          </div>

          <div className="bg-[#17324A] rounded-xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider bg-white/[0.02]">
                    <th className="p-4 font-medium">Incident Type</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Location</th>
                    <th className="p-4 font-medium">Priority Score</th>
                    <th className="p-4 font-medium">Last Updated</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-white/50 animate-pulse">Loading incidents...</td>
                    </tr>
                  ) : filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-white/50">No incidents found matching your search.</td>
                    </tr>
                  ) : (
                    filteredIncidents.map(incident => (
                      <tr 
                        key={incident.id} 
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                        onClick={() => navigate(`/authority/incidents/${incident.id}`)}
                      >
                        <td className="p-4">
                          <div className="font-semibold text-white/90">{incident.primaryTag || 'Unknown'}</div>
                          <div className="text-xs text-white/50 truncate max-w-[200px] mt-1">{incident.severitySummary || 'No summary'}</div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={incident.status} />
                        </td>
                        <td className="p-4 text-sm text-white/70">
                          {incident.locationLabel || 'Exact location pending'}
                        </td>
                        <td className="p-4">
                          <PriorityBadge score={incident.priorityScore} />
                        </td>
                        <td className="p-4 text-sm text-white/50">
                          {relativeTime(incident.updatedAt?.toDate ? incident.updatedAt.toDate() : new Date())}
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-white/30 group-hover:text-[#E67E22] transition-colors p-2">
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && filteredIncidents.length > 0 && (
              <div className="p-4 border-t border-white/10 text-xs text-white/40 flex justify-between items-center bg-white/[0.02]">
                <span>Showing {filteredIncidents.length} incidents</span>
              </div>
            )}
          </div>
          
        </main>
      </div>
    </div>
  );
}
