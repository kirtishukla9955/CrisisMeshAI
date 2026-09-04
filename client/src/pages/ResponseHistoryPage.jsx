import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { useFirestoreIncidents } from '../hooks/useFirestoreIncidents';
import { useNavigate } from 'react-router-dom';
import { Search, History, FileText } from 'lucide-react';
import { relativeTime } from '../utils/formatters';

export default function ResponseHistoryPage({ authority }) {
  const navigate = useNavigate();
  const { incidents, loading } = useFirestoreIncidents();
  const [searchQuery, setSearchQuery] = useState("");

  const onNavigate = (key) => {
    if (key === 'command-center') navigate('/authority/dashboard');
    else if (key === 'ai-reports') navigate('/authority/reports');
    else navigate(`/authority/${key}`);
  };

  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');
  
  const filteredIncidents = resolvedIncidents
    .filter(i => 
      i.primaryTag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.severitySummary?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
      const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
      return timeB - timeA;
    });

  return (
    <div className="flex min-h-screen">
      <Sidebar active="response-history" onNavigate={onNavigate} authority={authority} />
      <div className="flex-1 min-w-0 bg-[#0f2337] text-white">
        <TopBar eventName="Response History & Archive" lastSync={new Date()} />
        <main className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <History className="h-6 w-6 text-[#9b59b6]" /> 
                Response History Archive
              </h1>
              <p className="text-white/50 text-sm mt-1">
                Historical record of resolved incidents and completed disaster responses.
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search archive..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#17324A] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#9b59b6] transition-colors"
              />
            </div>
          </div>

          <div className="bg-[#17324A] rounded-xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider bg-white/[0.02]">
                    <th className="p-4 font-medium">Incident Type</th>
                    <th className="p-4 font-medium">Location</th>
                    <th className="p-4 font-medium">Resolution Time</th>
                    <th className="p-4 font-medium">Original Priority</th>
                    <th className="p-4 font-medium text-right">Records</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-white/50 animate-pulse">Loading archive data...</td>
                    </tr>
                  ) : filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center">
                        <History className="h-10 w-10 text-white/20 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-white/80">No Records Found</h3>
                        <p className="text-white/40 text-sm mt-1">No resolved incidents match your current search.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map(incident => (
                      <tr 
                        key={incident.id} 
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                        onClick={() => navigate(`/authority/incidents/${incident.id}`)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <StatusBadge status="resolved" />
                            <div>
                              <div className="font-semibold text-white/90 capitalize">{incident.primaryTag || 'Unknown'}</div>
                              <div className="text-xs text-white/50 truncate max-w-[250px] mt-0.5">{incident.severitySummary || 'No summary'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-white/70">
                          {incident.locationLabel || 'Coordinates recorded'}
                        </td>
                        <td className="p-4 text-sm text-white/50">
                          {relativeTime(incident.updatedAt?.toDate ? incident.updatedAt.toDate() : new Date())}
                        </td>
                        <td className="p-4">
                          <PriorityBadge score={incident.priorityScore} />
                        </td>
                        <td className="p-4 text-right">
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-medium text-white/60 hover:text-white transition-colors">
                            <FileText className="h-3.5 w-3.5" />
                            View Log
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
                <span>Archived {filteredIncidents.length} resolved incidents</span>
              </div>
            )}
          </div>
          
        </main>
      </div>
    </div>
  );
}
