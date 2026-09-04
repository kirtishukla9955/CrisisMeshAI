import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import PriorityBadge from '../components/PriorityBadge';
import { useFirestoreIncidents } from '../hooks/useFirestoreIncidents';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { relativeTime } from '../utils/formatters';

export default function PriorityQueuePage({ authority }) {
  const navigate = useNavigate();
  const { incidents, loading } = useFirestoreIncidents();
  const [searchQuery, setSearchQuery] = useState("");

  const onNavigate = (key) => {
    if (key === 'command-center') navigate('/authority/dashboard');
    else if (key === 'ai-reports') navigate('/authority/reports');
    else navigate(`/authority/${key}`);
  };

  // Sort incidents by priority score in strictly descending order
  const priorityIncidents = [...incidents]
    .filter(i => i.status !== 'resolved') // Only actionable items
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .filter(i => 
      i.primaryTag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.severitySummary?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar active="priority-queue" onNavigate={onNavigate} authority={authority} />
      <div className="flex-1 min-w-0 bg-[#0f2337] text-white">
        <TopBar eventName="Triage & Priority Queue" lastSync={new Date()} />
        <main className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-[#E67E22]" /> 
                Action Queue
              </h1>
              <p className="text-white/50 text-sm mt-1">
                Active incidents sorted by AI-determined urgency. Address top items immediately.
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Filter queue..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#17324A] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#E67E22] transition-colors"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="p-12 text-center text-white/50 animate-pulse">Loading priority queue...</div>
            ) : priorityIncidents.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <CheckCircle className="h-10 w-10 text-[#3F7D5C] mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white/80">Queue is Clear</h3>
                <p className="text-white/40 text-sm mt-1">No active incidents require immediate attention.</p>
              </div>
            ) : (
              priorityIncidents.map((incident, index) => {
                const isCritical = incident.priorityScore >= 80;
                return (
                  <div 
                    key={incident.id}
                    className={`relative p-5 rounded-xl border transition-all cursor-pointer group ${
                      isCritical 
                        ? "bg-[#C0392B]/10 border-[#C0392B]/30 hover:bg-[#C0392B]/20" 
                        : "bg-[#17324A] border-white/10 hover:border-white/30"
                    }`}
                    onClick={() => navigate(`/authority/incidents/${incident.id}`)}
                  >
                    {isCritical && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#C0392B] rounded-l-xl shadow-[0_0_10px_#C0392B]" />
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-2">
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-center w-12 pt-1">
                          <span className="block text-xs text-white/40 uppercase font-bold tracking-wider mb-1">Rank</span>
                          <span className={`text-2xl font-black ${isCritical ? 'text-[#C0392B]' : 'text-white/60'}`}>
                            #{index + 1}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-white/90 capitalize">
                              {incident.primaryTag || 'Uncategorized'}
                            </h3>
                            <PriorityBadge score={incident.priorityScore} />
                          </div>
                          
                          <p className="text-sm text-white/70 max-w-2xl mb-3">
                            {incident.severitySummary || 'No summary available.'}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <strong>Location:</strong> {incident.locationLabel || 'Exact coordinates pending'}
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <strong>Updated:</strong> {relativeTime(incident.updatedAt?.toDate ? incident.updatedAt.toDate() : new Date())}
                            </span>
                            <span>&bull;</span>
                            <span className="uppercase text-[#E67E22] font-semibold tracking-wider">
                              {(incident.status || 'unknown').replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex items-center justify-center sm:justify-end">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
                          Triage
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
          
        </main>
      </div>
    </div>
  );
}
