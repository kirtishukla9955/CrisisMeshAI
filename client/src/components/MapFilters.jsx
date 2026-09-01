import { TAG_ICONS } from "../utils/severityColors";

const TAGS = ["flood", "fire", "medical", "injury", "shelter", "evacuation", "infrastructure"];
const STATUSES = ["new", "acknowledged", "in_progress", "resolved"];

const STATUS_LABELS = {
  new: "New",
  acknowledged: "Ack'd",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export default function MapFilters({
  selectedTag,
  setSelectedTag,
  selectedStatus,
  setSelectedStatus,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all border ${
              selectedTag === tag
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-white/[0.06] text-neutral-500 hover:text-neutral-300 hover:border-white/10"
            }`}
          >
            <span className="text-xs">{TAG_ICONS[tag]}</span>
            <span className="capitalize">{tag}</span>
          </button>
        ))}
      </div>

      <div className="w-px bg-white/[0.06] mx-1 hidden sm:block" />

      <div className="flex items-center gap-1.5 flex-wrap">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all border ${
              selectedStatus === status
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-white/[0.06] text-neutral-500 hover:text-neutral-300 hover:border-white/10"
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>
    </div>
  );
}