/**
 * Shared schemas for the CrisisMesh AI platform.
 * (For reference / documentation purposes)
 */

const IncidentSchema = {
  incidentId: "string", // auto-generated
  centerLocation: { lat: "number", lng: "number" },
  reportIds: ["string"],
  reportCount: "number",
  primaryTag: "string",
  severitySummary: "string", 
  priorityScore: "number (0-100)",
  confidence: "high | medium | low | fallback_only",
  scoringMethod: "ai | rule_based_fallback",
  neededSkills: ["string"], 
  status: "new | acknowledged | in_progress | resolved",
  needsHumanReview: "boolean",
  createdAt: "Firestore timestamp",
  updatedAt: "Firestore timestamp"
};

const VolunteerSchema = {
  volunteerId: "string",
  name: "string",
  phone: "string",
  skills: ["string"],
  location: { lat: "number", lng: "number" },
  isVerified: "boolean",
  isAvailable: "boolean",
  createdAt: "Firestore timestamp"
};

module.exports = { IncidentSchema, VolunteerSchema };
