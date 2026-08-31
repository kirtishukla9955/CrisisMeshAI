/**
 * shared/normalizeIncident.js
 *
 * THE canonical read-boundary adapter for CrisisMesh AI, Round 2.
 *
 * Every place Member 4's code reads an `incidents` or `reports` document —
 * backend services, the post-disaster agent, and (once wired in) frontend
 * hooks — MUST pass the raw Firestore data through `normalizeIncident()` /
 * `normalizeReport()` before using it. Nothing downstream should read a raw
 * Firestore document directly. That gives us exactly one place that knows
 * about legacy field names, and lets every component/service consume only
 * the canonical shape defined in the Round 2 Full-Stack Build Guide.
 *
 * WHY THIS EXISTS
 * The Round 1 demo data and Round 1 Member 4 code used a different shape
 * (`id`, `title`, `category`, `severity`, `aiConfidence: number`,
 * `aiFallbackUsed: boolean`, `location`/`locationLabel`, a 7-state status
 * enum). The Round 2 guide defines a different, authoritative shape. Rather
 * than destructively rewriting whatever is actually sitting in Firestore —
 * which risks corrupting another member's real data — this module maps
 * *at read time* from whatever shape is present into the canonical one.
 * Writes still only ever touch the specific canonical fields Member 4 owns
 * (see backend/services/incidentService.js) — this file never mutates
 * Firestore, it only reshapes JS objects already in memory.
 *
 * CANONICAL INCIDENT SHAPE (source of truth: Full-Stack Build Guide, Round 2)
 * {
 *   incidentId: string,
 *   centerLocation: { lat: number, lng: number } | null,
 *   reportIds: string[],
 *   reportCount: number,
 *   primaryTag: "flood"|"injury"|"trapped"|"food_water"|"medical"|"road_blocked"|"other",
 *   severitySummary: string,
 *   priorityScore: number,               // 0-100
 *   confidence: "high"|"medium"|"low"|"fallback_only",
 *   scoringMethod: "ai"|"rule_based_fallback",
 *   neededSkills: string[],
 *   status: "new"|"acknowledged"|"in_progress"|"resolved",
 *   needsHumanReview: boolean,
 *   suggestedVolunteers: Array<{volunteerId, name, ...}>,
 *   updatedAt: FirestoreTimestamp | null,
 *   severity: "critical"|"high"|"moderate",  // DERIVED, not stored — added by this adapter
 * }
 *
 * CANONICAL REPORT SHAPE (source of truth: Full-Stack Build Guide, Round 2)
 * {
 *   reportId: string,
 *   source: "app"|"offline_sync"|"sms",
 *   reporterId: string | null,
 *   reporterPhone: string | null,
 *   text: string | null,
 *   mediaUrls: string[],
 *   location: { lat: number, lng: number } | null,
 *   locationText: string | null,
 *   tag: "flood"|"injury"|"trapped"|"food_water"|"medical"|"road_blocked"|"other",
 *   isEmergency: boolean,
 *   status: "new"|"reviewed"|"resolved",
 *   createdAt: FirestoreTimestamp | null,
 *   syncedAt: FirestoreTimestamp | null,
 * }
 *
 * Both normalizers also attach a non-canonical `_meta` object
 * (`{ usedLegacyMapping: boolean, warnings: string[] }`) for logging /
 * debugging ONLY. Nothing outside this file should read `_meta` for
 * functional decisions — components consume canonical fields only.
 */

const {
  INCIDENT_STATUS,
  CONFIDENCE,
  SCORING_METHOD,
  TAG,
  REPORT_SOURCE,
  REPORT_STATUS,
  LOW_SIGNAL_CONFIDENCE,
  deriveSeverity,
} = require('./constants/statuses');

const VALID_STATUSES = new Set(Object.values(INCIDENT_STATUS));
const VALID_CONFIDENCE = new Set(Object.values(CONFIDENCE));
const VALID_TAGS = new Set(Object.values(TAG));
const VALID_SOURCES = new Set(Object.values(REPORT_SOURCE));
const VALID_REPORT_STATUSES = new Set(Object.values(REPORT_STATUS));

// Round 1 status -> Round 2 canonical status. Lossy by nature: Round 1 had
// escalation/rejection states with no Round 2 equivalent, so those are
// mapped conservatively AND forced into human review rather than guessed
// away silently.
const LEGACY_STATUS_MAP = Object.freeze({
  new: INCIDENT_STATUS.NEW,
  under_review: INCIDENT_STATUS.ACKNOWLEDGED,
  assigned: INCIDENT_STATUS.ACKNOWLEDGED,
  in_progress: INCIDENT_STATUS.IN_PROGRESS,
  resolved: INCIDENT_STATUS.RESOLVED,
  escalated: INCIDENT_STATUS.IN_PROGRESS, // closest "still active" state; forced to human review below
  rejected: INCIDENT_STATUS.RESOLVED,      // closed, but forced to human review below so it isn't lost
});

// Round 1 "category" -> Round 2 "primaryTag". Only one value actually
// changed name; everything else maps 1:1 if it's already a valid tag.
const LEGACY_TAG_MAP = Object.freeze({
  infrastructure: TAG.ROAD_BLOCKED,
});

/**
 * Round 1 numeric aiConfidence (0-1) -> Round 2 categorical confidence.
 * Thresholds are a documented, deliberately conservative approximation —
 * there is no lossless mapping from a float to this enum.
 */
function confidenceFromLegacyFloat(aiConfidence, aiFallbackUsed) {
  if (aiFallbackUsed) return CONFIDENCE.FALLBACK_ONLY;
  if (typeof aiConfidence !== 'number') return CONFIDENCE.MEDIUM; // unknown -> conservative default, never "high"
  if (aiConfidence >= 0.85) return CONFIDENCE.HIGH;
  if (aiConfidence >= 0.6) return CONFIDENCE.MEDIUM;
  return CONFIDENCE.LOW;
}

/**
 * Normalizes one Firestore `incidents` document into the canonical shape.
 * Never throws on missing/legacy fields — degrades to safe defaults and
 * records what it had to guess in `_meta.warnings`.
 *
 * @param {Object} raw - the raw Firestore document data (already spread with .data())
 * @param {string} docId - the Firestore document id, used as incidentId fallback
 * @returns {Object|null} canonical incident, or null if raw is falsy
 */
function normalizeIncident(raw, docId) {
  if (!raw) return null;

  const warnings = [];
  let usedLegacyMapping = false;

  // --- incidentId ---
  const incidentId = raw.incidentId || raw.id || docId;
  if (!raw.incidentId) { usedLegacyMapping = true; warnings.push('incidentId derived from legacy `id`/docId'); }

  // --- centerLocation ---
  let centerLocation = null;
  if (raw.centerLocation && typeof raw.centerLocation.lat === 'number' && typeof raw.centerLocation.lng === 'number') {
    centerLocation = { lat: raw.centerLocation.lat, lng: raw.centerLocation.lng };
  } else if (raw.location && typeof raw.location.lat === 'number' && typeof raw.location.lng === 'number') {
    centerLocation = { lat: raw.location.lat, lng: raw.location.lng };
    usedLegacyMapping = true;
    warnings.push('centerLocation derived from legacy `location`');
  }

  // --- reportIds / reportCount ---
  const reportIds = Array.isArray(raw.reportIds) ? raw.reportIds : [];
  const reportCount = typeof raw.reportCount === 'number' ? raw.reportCount : reportIds.length;

  // --- primaryTag ---
  let primaryTag = raw.primaryTag;
  if (!VALID_TAGS.has(primaryTag)) {
    const legacyCategory = raw.category;
    primaryTag = LEGACY_TAG_MAP[legacyCategory] || (VALID_TAGS.has(legacyCategory) ? legacyCategory : TAG.OTHER);
    if (raw.primaryTag !== undefined || raw.category !== undefined) {
      usedLegacyMapping = true;
      warnings.push(`primaryTag derived from legacy \`category\` ("${legacyCategory}")`);
    }
  }

  // --- severitySummary ---
  let severitySummary = raw.severitySummary;
  if (!severitySummary || typeof severitySummary !== 'string') {
    severitySummary = raw.title || '';
    if (raw.title) { usedLegacyMapping = true; warnings.push('severitySummary derived from legacy `title`'); }
  }

  // --- priorityScore ---
  const priorityScore = typeof raw.priorityScore === 'number' ? raw.priorityScore : 0;
  if (typeof raw.priorityScore !== 'number') warnings.push('priorityScore missing, defaulted to 0');

  // --- confidence ---
  let confidence = raw.confidence;
  if (!VALID_CONFIDENCE.has(confidence)) {
    confidence = confidenceFromLegacyFloat(raw.aiConfidence, raw.aiFallbackUsed);
    if (raw.aiConfidence !== undefined || raw.aiFallbackUsed !== undefined) {
      usedLegacyMapping = true;
      warnings.push(`confidence derived from legacy \`aiConfidence\`/\`aiFallbackUsed\` -> "${confidence}"`);
    }
  }

  // --- scoringMethod ---
  let scoringMethod = raw.scoringMethod;
  if (scoringMethod !== SCORING_METHOD.AI && scoringMethod !== SCORING_METHOD.RULE_BASED_FALLBACK) {
    scoringMethod = raw.aiFallbackUsed ? SCORING_METHOD.RULE_BASED_FALLBACK : SCORING_METHOD.AI;
    if (raw.aiFallbackUsed !== undefined) {
      usedLegacyMapping = true;
      warnings.push(`scoringMethod derived from legacy \`aiFallbackUsed\` -> "${scoringMethod}"`);
    }
  }

  // --- neededSkills ---
  const neededSkills = Array.isArray(raw.neededSkills) ? raw.neededSkills : [];

  // --- status ---
  let status = raw.status;
  let forcedReviewFromStatus = false;
  if (!VALID_STATUSES.has(status)) {
    const mapped = LEGACY_STATUS_MAP[status];
    if (mapped) {
      status = mapped;
      usedLegacyMapping = true;
      warnings.push(`status derived from legacy value "${raw.status}" -> "${mapped}"`);
      if (raw.status === 'escalated' || raw.status === 'rejected') forcedReviewFromStatus = true;
    } else {
      status = INCIDENT_STATUS.NEW;
      warnings.push(`status missing/unrecognized ("${raw.status}"), defaulted to "new"`);
    }
  }

  // --- needsHumanReview ---
  // Canonical field is explicit and authoritative when present. When absent
  // (legacy data), derive conservatively from confidence/scoringMethod/status
  // so nothing that used to be flagged silently stops being flagged.
  let needsHumanReview = typeof raw.needsHumanReview === 'boolean' ? raw.needsHumanReview : undefined;
  if (needsHumanReview === undefined) {
    needsHumanReview =
      scoringMethod === SCORING_METHOD.RULE_BASED_FALLBACK ||
      LOW_SIGNAL_CONFIDENCE.includes(confidence) ||
      forcedReviewFromStatus;
    usedLegacyMapping = true;
    warnings.push(`needsHumanReview derived (no explicit field) -> ${needsHumanReview}`);
  } else if (forcedReviewFromStatus && !needsHumanReview) {
    needsHumanReview = true;
    warnings.push('needsHumanReview forced true due to legacy escalated/rejected status with no Round 2 equivalent');
  }

  // --- suggestedVolunteers ---
  // Member 3-owned output. Never fabricated from legacy assignment fields
  // (assignedResponderId/Name meant something different — a confirmed
  // assignment, not an algorithmic suggestion) — those are simply dropped.
  const suggestedVolunteers = Array.isArray(raw.suggestedVolunteers) ? raw.suggestedVolunteers : [];
  if (raw.assignedResponderId || raw.assignedResponderName) {
    warnings.push('legacy assignedResponderId/assignedResponderName present but has no canonical home — dropped, not merged into suggestedVolunteers');
  }

  // --- updatedAt ---
  const updatedAt = raw.updatedAt || null;

  return {
    incidentId,
    centerLocation,
    reportIds,
    reportCount,
    primaryTag,
    severitySummary,
    priorityScore,
    confidence,
    scoringMethod,
    neededSkills,
    status,
    needsHumanReview,
    suggestedVolunteers,
    updatedAt,
    severity: deriveSeverity(priorityScore), // derived, not stored
    _meta: { usedLegacyMapping, warnings },
  };
}

/**
 * Normalizes one Firestore `reports` document into the canonical shape.
 * Round 1 reports carried an `incidentId` foreign key and different field
 * names; Round 2 reports are looked up via `incident.reportIds[]` instead,
 * so `incidentId` (if present) is preserved for legacy compatibility but is
 * no longer how Member 4 joins reports to incidents (see incidentService.js).
 */
function normalizeReport(raw, docId) {
  if (!raw) return null;

  const warnings = [];
  let usedLegacyMapping = false;

  const reportId = raw.reportId || raw.id || docId;
  if (!raw.reportId) { usedLegacyMapping = true; warnings.push('reportId derived from legacy `id`/docId'); }

  let source = VALID_SOURCES.has(raw.source) ? raw.source : REPORT_SOURCE.APP;
  if (!VALID_SOURCES.has(raw.source)) warnings.push(`source missing/unrecognized ("${raw.source}"), defaulted to "app"`);

  const reporterId = raw.reporterId || null;
  const reporterPhone = raw.reporterPhone || null;
  if (!raw.reporterId && !raw.reporterPhone && raw.reporterType) {
    usedLegacyMapping = true;
    warnings.push(`legacy \`reporterType\` ("${raw.reporterType}") has no canonical home — dropped`);
  }

  const text = typeof raw.text === 'string' ? raw.text : null;

  let mediaUrls = Array.isArray(raw.mediaUrls) ? raw.mediaUrls : [];
  if (mediaUrls.length === 0 && raw.hasMedia) {
    usedLegacyMapping = true;
    warnings.push('legacy `hasMedia: true` present but no real media URL is available — mediaUrls left empty rather than fabricated');
  }

  let location = null;
  if (raw.location && typeof raw.location.lat === 'number' && typeof raw.location.lng === 'number') {
    location = { lat: raw.location.lat, lng: raw.location.lng };
  }

  const locationText = typeof raw.locationText === 'string' ? raw.locationText : null;

  let tag = VALID_TAGS.has(raw.tag) ? raw.tag : undefined;
  if (!tag) {
    tag = TAG.OTHER;
    usedLegacyMapping = true;
    warnings.push('tag missing on report (Round 1 reports did not carry a tag) — defaulted to "other"');
  }

  const isEmergency = typeof raw.isEmergency === 'boolean' ? raw.isEmergency : false;
  if (typeof raw.isEmergency !== 'boolean') warnings.push('isEmergency missing, defaulted to false');

  let status = VALID_REPORT_STATUSES.has(raw.status) ? raw.status : REPORT_STATUS.NEW;
  if (!VALID_REPORT_STATUSES.has(raw.status)) warnings.push(`report status missing/unrecognized, defaulted to "new"`);

  return {
    reportId,
    source,
    reporterId,
    reporterPhone,
    text,
    mediaUrls,
    location,
    locationText,
    tag,
    isEmergency,
    status,
    createdAt: raw.createdAt || null,
    syncedAt: raw.syncedAt || null,
    _meta: { usedLegacyMapping, warnings },
  };
}

/**
 * Derives a coarse, human-readable "area" label from a centerLocation for
 * use in post-disaster analytics (worstHitAreas / slowestResponseAreas).
 *
 * IMPORTANT LIMITATION: the canonical incident contract has no
 * locationLabel/area-name field — only raw coordinates. This buckets
 * nearby incidents into ~1.1km grid cells (2 decimal places) so the
 * post-disaster report can talk about "areas" without inventing place
 * names. This is a documented approximation, not a real place name.
 * If Member 2's map module or Member 1's report `locationText` exposes
 * real place names, prefer wiring those in over this fallback — see
 * ai/postDisasterAgent/README.md.
 *
 * @param {{lat:number,lng:number}|null} centerLocation
 * @returns {string}
 */
function deriveAreaLabel(centerLocation) {
  if (!centerLocation || typeof centerLocation.lat !== 'number' || typeof centerLocation.lng !== 'number') {
    return 'Unknown Area';
  }
  const lat = centerLocation.lat.toFixed(2);
  const lng = centerLocation.lng.toFixed(2);
  return `Zone ${lat}, ${lng}`;
}

module.exports = {
  normalizeIncident,
  normalizeReport,
  deriveAreaLabel,
  LEGACY_STATUS_MAP,
  LEGACY_TAG_MAP,
};
