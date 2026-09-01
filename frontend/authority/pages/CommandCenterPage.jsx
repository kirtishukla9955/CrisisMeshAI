import { useState, useMemo } from "react";
import { useFirestoreIncidents } from "../hooks/useFirestoreIncidents";
import CrisisMap from "../components/CrisisMap";
import TopPrioritySidebar from "../components/TopPrioritySidebar";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import { TAG_ICONS } from "../utils/severityColors";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, AlertTriangle, Bell, Users, MapPin, LogOut,
  Search, Shield, Camera, Mic, Send, ChevronRight, CircleAlert,
  Navigation, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: AlertTriangle, label: "Incidents", active: false },
  { icon: Bell, label: "Alerts", active: false },
  { icon: MapPin, label: "Resources", active: false },
  { icon: Users, label: "Users", active: false },
];

const MOCK_ALERTS = [
  { id: 1, title: "Critical alert", desc: "State reported floods and storm conditions, infrastructure collapse", time: "1:30 AM" },
  { id: 2, title: "Critical alert", desc: "Severe flooding near industrial zone, evacuation underway", time: "1:28 AM" },
  { id: 3, title: "Critical alert", desc: "Building fire spreading rapidly, trapped residents reported", time: "1:26 AM" },
  { id: 4, title: "Critical alert", desc: "Water treatment plant offline, contamination risk", time: "1:25 AM" },
  { id: 5, title: "Critical alert", desc: "School evacuation in progress, children stranded", time: "1:24 AM" },
];

function hasValidLocation(i) {
  return (
    i.centerLocation != null &&
    typeof i.centerLocation.lat === "number" &&
    typeof i.centerLocation.lng === "number" &&
    i.centerLocation.lat !== 0
  );
}

export default function CommandCenterPage() {
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { incidents, loading } = useFirestoreIncidents();

  const locatedIncidents = useMemo(
    () => incidents.filter(hasValidLocation),
    [incidents]
  );

  const filteredIncidents = useMemo(() => {
    if (!searchQuery.trim()) return locatedIncidents;
    const q = searchQuery.toLowerCase();
    return locatedIncidents.filter(
      (i) =>
        i.primaryTag?.toLowerCase().includes(q) ||
        i.severitySummary?.toLowerCase().includes(q)
    );
  }, [locatedIncidents, searchQuery]);

  return (
    <div className="h-screen flex bg-[#17324A] text-white overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="hidden md:flex w-14 shrink-0 bg-[#0f2337] border-r border-white/[0.08] flex-col items-center py-4 gap-1">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#C0392B]/20 mb-6">
          <Shield className="h-4 w-4 text-[#C0392B]" />
        </div>
        {NAV_ITEMS.map((item) => (
          <button key={item.label} type="button" title={item.label}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${item.active ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"}`}
          >
            <item.icon className="h-4 w-4" />
          </button>
        ))}
        <div className="flex-1" />
        <button type="button" onClick={() => navigate("/")} title="Home"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-11 shrink-0 flex items-center justify-between px-4 border-b border-white/[0.08] bg-[#0f2337]/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#C0392B] hidden sm:block" />
              <h1 className="text-sm font-semibold text-white">CrisisMap AI</h1>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {["Dashboard", "Incidents", "Users"].map((tab) => (
                <button key={tab} type="button"
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${tab === "Dashboard" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"}`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Live</span>
            </div>
            <Bell className="h-4 w-4 text-white/40 hidden sm:block" />
          </div>
        </header>

        {/* CONTENT: MAP + ALERTS */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-[#17324A]">
                <div className="text-center">
                  <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin mx-auto" />
                  <p className="mt-3 text-xs text-white/40">Loading map data...</p>
                </div>
              </div>
            ) : (
              <>
                <CrisisMap
                  selectedIncident={selectedIncident}
                  onSelectIncident={(inc) => {
                    if (inc.centerLocation) setSelectedIncident(inc.centerLocation);
                  }}
                />

                <div className="absolute top-3 left-3 z-[1000] w-60 sm:w-72">
                  <TopPrioritySidebar onSelectIncident={(inc) => setSelectedIncident(inc.centerLocation)} />
                </div>

                <div className="absolute top-3 right-3 z-[1000] w-52 hidden lg:block">
                  <QuickReportPanel />
                </div>

                <div className="absolute bottom-3 left-3 z-[1000]">
                  <VolunteerReliefLegend />
                </div>

                <button type="button"
                  className="absolute top-3 right-3 z-[1000] lg:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f2337]/90 border border-white/[0.1] text-white/60 hover:text-white backdrop-blur-sm"
                >
                  <Navigation className="h-4 w-4" />
                </button>

                {!loading && locatedIncidents.length > 0 && (
                  <div className="absolute bottom-3 left-auto right-3 w-[75%] z-[1000] hidden lg:block">
                    <IncidentsTable
                      incidents={filteredIncidents}
                      totalCount={locatedIncidents.length}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      onSelectIncident={(loc) => setSelectedIncident(loc)}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* ALERTS SIDEBAR */}
          <aside className="hidden md:flex w-64 shrink-0 border-l border-white/[0.08] bg-[#0f2337] flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.08]">
              <h3 className="text-xs font-semibold text-white/80">Alerts Feed</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-white/[0.06]">
                {MOCK_ALERTS.map((alert) => (
                  <div key={alert.id} className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer">
                    <div className="flex items-start gap-2">
                      <CircleAlert className="h-3.5 w-3.5 text-[#C0392B] mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-[#C0392B]">{alert.title}</span>
                          <span className="text-[9px] text-white/30 shrink-0">{alert.time}</span>
                        </div>
                        <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed line-clamp-2">{alert.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#0f2337]/95 backdrop-blur-sm">
          <div className="flex flex-col pt-16 px-6 gap-2">
            {NAV_ITEMS.map((item) => (
              <button key={item.label} type="button" onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70 hover:bg-white/[0.05]"}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickReportPanel() {
  return (
    <div className="rounded-xl bg-[#0f2337]/95 backdrop-blur-sm border border-white/[0.08] p-3">
      <h3 className="text-[11px] font-semibold text-white/80 mb-2">Quick Report</h3>
      <div className="space-y-2 mb-2">
        <button type="button" className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
          <Camera className="h-5 w-5 text-white/50" />
          <span className="text-[10px] text-white/40">Photo</span>
        </button>
        <button type="button" className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
          <Mic className="h-5 w-5 text-white/50" />
          <span className="text-[10px] text-white/40">Voice</span>
        </button>
      </div>
      <div className="relative mb-2">
        <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/30" />
        <input type="text" placeholder="Location or severity label"
          className="w-full h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] pl-7 pr-2 text-[10px] text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#E67E22]/40"
        />
      </div>
      <button type="button"
        className="w-full h-7 rounded-lg bg-[#E67E22] text-[#17324A] text-[11px] font-semibold hover:bg-[#E67E22]/90 transition-colors flex items-center justify-center gap-1.5"
      >
        <Send className="h-3 w-3" />
        Submit Report
      </button>
    </div>
  );
}

function VolunteerReliefLegend() {
  return (
    <div className="rounded-xl bg-[#0f2337]/95 backdrop-blur-sm border border-white/[0.08] px-3 py-2">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs">🧑</span>
          <span className="text-[11px] text-white/60">Volunteer location</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">⛺</span>
          <span className="text-[11px] text-white/60">Relief camps</span>
        </div>
      </div>
    </div>
  );
}

function IncidentsTable({ incidents, totalCount, searchQuery, setSearchQuery, onSelectIncident }) {
  return (
    <div className="rounded-xl bg-[#0f2337]/95 backdrop-blur-sm border border-white/[0.08] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] font-semibold text-white/80">Incidents</h3>
          <span className="text-[9px] text-white/40 bg-white/[0.06] px-1.5 py-0.5 rounded">{incidents.length}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/30" />
          <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="h-5 w-32 rounded border border-white/[0.08] bg-white/[0.04] pl-6 pr-2 text-[10px] text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>
      </div>
      <div className="max-h-36 overflow-y-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-white/[0.06] text-white/40">
              <th className="text-left px-3 py-1.5 font-medium">Type</th>
              <th className="text-left px-3 py-1.5 font-medium">Status</th>
              <th className="text-left px-3 py-1.5 font-medium">Location</th>
              <th className="text-left px-3 py-1.5 font-medium">Priority</th>
              <th className="text-left px-3 py-1.5 font-medium hidden xl:table-cell">Reported By</th>
              <th className="text-left px-3 py-1.5 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id}
                className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
                onClick={() => onSelectIncident(incident.centerLocation)}
              >
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">{TAG_ICONS[incident.primaryTag] || "📍"}</span>
                    <span className="text-white/80 capitalize">{incident.primaryTag}</span>
                  </div>
                </td>
                <td className="px-3 py-1.5"><StatusBadge status={incident.status} /></td>
                <td className="px-3 py-1.5 text-white/50">{incident.locationName || `${incident.centerLocation.lat.toFixed(1)}, ${incident.centerLocation.lng.toFixed(1)}`}</td>
                <td className="px-3 py-1.5"><PriorityBadge score={incident.priorityScore} /></td>
                <td className="px-3 py-1.5 text-white/50 hidden xl:table-cell">John Mesh</td>
                <td className="px-3 py-1.5">
                  <button type="button" className="text-[#E67E22] hover:text-[#E67E22]/80 text-[10px] font-medium flex items-center gap-0.5">
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-3 py-1 border-t border-white/[0.06] text-[9px] text-white/30">
        <span>Sort 1 – {Math.min(incidents.length, 15)} of {totalCount}</span>
        <div className="flex items-center gap-1">
          <span className="px-1 py-0.5 rounded border border-white/[0.08] text-white/40">{"<"}</span>
          <span className="px-1 py-0.5 rounded border border-white/[0.08] text-white/40">{">"}</span>
        </div>
      </div>
    </div>
  );
}