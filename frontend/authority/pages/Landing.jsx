import { Shield, ArrowRight, Map, Radio, Users, Zap, Eye, Bell } from "lucide-react";
import { useNavigate } from "react-router";

const FEATURES = [
  { icon: Map, title: "Live Severity Map", desc: "Real-time disaster severity visualization across affected regions" },
  { icon: Radio, title: "Instant Alerts", desc: "Critical alerts pushed to your team as incidents are reported" },
  { icon: Users, title: "Team Coordination", desc: "Volunteer locations, relief camps, and resource tracking in one view" },
  { icon: Zap, title: "AI-Powered Scoring", desc: "Incidents prioritized by severity, confidence, and report count" },
  { icon: Eye, title: "Full Situational Awareness", desc: "See everything at a glance — map, table, alerts, and top priorities" },
  { icon: Bell, title: "Quick Reporting", desc: "Submit photo, voice, and location reports directly from the command center" },
];

const STATS = [
  { value: "19+", label: "Active Incidents" },
  { value: "13", label: "Volunteer Teams" },
  { value: "9", label: "Relief Camps" },
  { value: "Real-time", label: "Data Updates" },
];

const STEPS = [
  { num: "01", title: "Report", desc: "Teams submit incident reports with photos, voice notes, and GPS coordinates" },
  { num: "02", title: "Analyze", desc: "AI clusters and scores reports by severity, confidence, and urgency" },
  { num: "03", title: "Prioritize", desc: "Top incidents surface automatically — no manual sorting needed" },
  { num: "04", title: "Respond", desc: "Your team sees the full picture and coordinates response in real time" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0a0e17]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#C0392B]" />
            <span className="text-sm font-semibold tracking-tight">CrisisMap AI</span>
          </div>
          <button onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-[#C0392B] text-white hover:bg-[#C0392B]/90 transition-colors"
          >
            Open Command Center
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] text-white/50 mb-8">
            <div className="h-1.5 w-1.5 rounded-full bg-[#C0392B] animate-pulse" />
            Internal team tool — disaster severity mapping
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            See the severity.<br />
            <span className="text-[#E67E22]">Respond where it matters.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
            A live disaster-severity map for your internal response team.
            Track incidents, coordinate volunteers, and prioritize response — all in real time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <button onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#C0392B] text-white hover:bg-[#C0392B]/90 transition-all shadow-lg shadow-[#C0392B]/20"
            >
              Open Command Center
              <ArrowRight className="h-4 w-4" />
            </button>
            <a href="#features"
              className="px-6 py-3 text-sm font-medium rounded-xl border border-white/[0.1] text-white/50 hover:text-white/80 hover:border-white/20 transition-all"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{stat.value}</div>
              <div className="mt-1 text-xs text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">Disaster severity at a glance</h2>
          <p className="mt-3 text-sm text-white/40 text-center max-w-md mx-auto">
            Everything your team needs to see, assess, and respond to disasters in one place.
          </p>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <f.icon className="h-5 w-5 text-[#E67E22] mb-3" />
                <h3 className="text-sm font-semibold text-white/90">{f.title}</h3>
                <p className="mt-1.5 text-xs text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">How CrisisMap AI works</h2>
          <p className="mt-3 text-sm text-white/40 text-center max-w-md mx-auto">From report to response in four steps.</p>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/[0.1] text-sm font-bold text-[#E67E22] mb-4">{step.num}</div>
                <h3 className="text-sm font-semibold text-white/90">{step.title}</h3>
                <p className="mt-1.5 text-xs text-white/40 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="mt-3 text-sm text-white/40">Sign in to open the command center and see your team's disaster severity map in real time.</p>
          <button onClick={() => navigate("/dashboard")}
            className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-[#C0392B] text-white hover:bg-[#C0392B]/90 transition-all shadow-lg shadow-[#C0392B]/20"
          >
            Open Command Center
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-[11px] text-white/30">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            <span>CrisisMap AI — Internal team tool</span>
          </div>
          <span>v1.0 — Built for disaster response teams</span>
        </div>
      </footer>
    </div>
  );
}