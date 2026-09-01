import { STATUS_COLORS } from "../utils/severityColors";

const STATUS_LABELS = {
  new: "New",
  acknowledged: "Acknowledged",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "#888";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
