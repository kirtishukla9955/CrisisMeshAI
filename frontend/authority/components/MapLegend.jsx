import { SEVERITY_COLORS } from "../utils/severityColors";

export default function MapLegend() {
  return (
    <div className="rounded-xl bg-[#0f2337]/95 backdrop-blur-sm border border-white/[0.08] p-3">
      <div className="space-y-2">
        {["critical", "high", "moderate"].map((level) => (
          <div key={level} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: SEVERITY_COLORS[level],
                boxShadow: `0 0 6px ${SEVERITY_COLORS[level]}80`,
              }}
            />
            <span className="text-[11px] text-white/60 capitalize">
              {level}
            </span>
          </div>
        ))}
        <div className="border-t border-white/[0.06] my-1.5" />
        <div className="flex items-center gap-2">
          <span className="text-[11px]">🧑</span>
          <span className="text-[11px] text-white/50">Volunteer location</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px]">⛺</span>
          <span className="text-[11px] text-white/50">Relief camps</span>
        </div>
      </div>
    </div>
  );
}