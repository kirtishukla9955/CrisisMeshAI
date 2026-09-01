// Formatting helpers shared across Member 2 and Member 4 components.

export function relativeTime(dateInput) {
  if (!dateInput) return '—';
  const date = dateInput?.toDate ? dateInput.toDate() : new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

// Both names work — my components call formatTimeAgo, teammate's call relativeTime
export const formatTimeAgo = relativeTime;

export function clockTime(dateInput) {
  if (!dateInput) return '—';
  const date = dateInput?.toDate ? dateInput.toDate() : new Date(dateInput);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function percent(value) {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value * 100)}%`;
}

export function titleCase(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

export function formatCoordinates(lat, lng) {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function formatPriorityScore(score) {
  return score.toString();
}