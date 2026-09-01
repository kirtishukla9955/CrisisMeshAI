import { getSeverityColor, getSeverityLabel } from "../utils/severityColors";

export default function PriorityBadge({ score }) {
  const color = getSeverityColor(score);
  const label = getSeverityLabel(score);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold tabular-nums"
      style={{
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      {score}
      <span className="opacity-60 font-normal">{label}</span>
    </span>
  );
}