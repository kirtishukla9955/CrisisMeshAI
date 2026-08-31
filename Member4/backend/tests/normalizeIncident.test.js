const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeIncident, normalizeReport, deriveAreaLabel } = require('../../shared/normalizeIncident');

test('normalizeIncident: passes through an already-canonical document unchanged', () => {
  const raw = {
    incidentId: 'CRS-9001',
    centerLocation: { lat: 26.9, lng: 75.8 },
    reportIds: ['r1', 'r2'],
    reportCount: 2,
    primaryTag: 'flood',
    severitySummary: 'Rising water in residential area',
    priorityScore: 91,
    confidence: 'high',
    scoringMethod: 'ai',
    neededSkills: ['medical'],
    status: 'new',
    needsHumanReview: false,
    suggestedVolunteers: [{ volunteerId: 'v1' }],
    updatedAt: 'TIMESTAMP',
  };
  const result = normalizeIncident(raw, 'doc1');
  assert.equal(result.incidentId, 'CRS-9001');
  assert.equal(result.priorityScore, 91);
  assert.equal(result.confidence, 'high');
  assert.equal(result.status, 'new');
  assert.equal(result.severity, 'critical'); // derived from priorityScore >= 80
  assert.equal(result._meta.usedLegacyMapping, false);
});

test('normalizeIncident: maps legacy Round 1 fields to canonical shape', () => {
  const legacy = {
    id: 'CRS-1042',
    title: 'Trapped residents',
    category: 'trapped',
    severity: 'critical', // legacy field, should be ignored in favor of derived severity
    priorityScore: 94,
    aiConfidence: 0.97,
    aiFallbackUsed: false,
    status: 'new',
    location: { lat: 26.9124, lng: 75.7873 },
    locationLabel: 'Ward 14, Jaipur',
    reportCount: 23,
    reportIds: ['RPT-3001'],
  };
  const result = normalizeIncident(legacy, 'doc2');

  assert.equal(result.incidentId, 'CRS-1042');
  assert.equal(result.centerLocation.lat, 26.9124);
  assert.equal(result.primaryTag, 'trapped');
  assert.equal(result.severitySummary, 'Trapped residents');
  assert.equal(result.confidence, 'high'); // 0.97 >= 0.85
  assert.equal(result.scoringMethod, 'ai');
  assert.equal(result.status, 'new');
  assert.equal(result._meta.usedLegacyMapping, true);
  assert.ok(result._meta.warnings.length > 0);
});

test('normalizeIncident: legacy category "infrastructure" maps to "road_blocked"', () => {
  const result = normalizeIncident({ id: 'X', category: 'infrastructure', priorityScore: 40, status: 'new' }, 'doc3');
  assert.equal(result.primaryTag, 'road_blocked');
});

test('normalizeIncident: legacy aiFallbackUsed=true maps to fallback_only confidence + rule_based_fallback method', () => {
  const result = normalizeIncident(
    { id: 'X', aiFallbackUsed: true, aiConfidence: 0.42, priorityScore: 50, status: 'new' },
    'doc4'
  );
  assert.equal(result.confidence, 'fallback_only');
  assert.equal(result.scoringMethod, 'rule_based_fallback');
  assert.equal(result.needsHumanReview, true); // derived: fallback method always forces review
});

test('normalizeIncident: legacy escalated/rejected statuses force needsHumanReview=true', () => {
  const escalated = normalizeIncident({ id: 'A', status: 'escalated', priorityScore: 80 }, 'a');
  const rejected = normalizeIncident({ id: 'B', status: 'rejected', priorityScore: 10 }, 'b');
  assert.equal(escalated.status, 'in_progress');
  assert.equal(escalated.needsHumanReview, true);
  assert.equal(rejected.status, 'resolved');
  assert.equal(rejected.needsHumanReview, true);
});

test('normalizeIncident: legacy under_review/assigned both map to acknowledged', () => {
  assert.equal(normalizeIncident({ id: 'A', status: 'under_review' }, 'a').status, 'acknowledged');
  assert.equal(normalizeIncident({ id: 'A', status: 'assigned' }, 'a').status, 'acknowledged');
});

test('normalizeIncident: does not fabricate suggestedVolunteers from legacy assignedResponderId', () => {
  const result = normalizeIncident(
    { id: 'X', assignedResponderId: 'VOL-1', assignedResponderName: 'Team Alpha', priorityScore: 50, status: 'new' },
    'doc5'
  );
  assert.deepEqual(result.suggestedVolunteers, []);
  assert.ok(result._meta.warnings.some((w) => w.includes('dropped')));
});

test('normalizeIncident: derives severity from priorityScore, not a stored field', () => {
  assert.equal(normalizeIncident({ id: 'A', priorityScore: 85, status: 'new' }, 'a').severity, 'critical');
  assert.equal(normalizeIncident({ id: 'A', priorityScore: 60, status: 'new' }, 'a').severity, 'high');
  assert.equal(normalizeIncident({ id: 'A', priorityScore: 20, status: 'new' }, 'a').severity, 'moderate');
});

test('normalizeIncident: returns null for falsy input', () => {
  assert.equal(normalizeIncident(null, 'x'), null);
});

test('normalizeReport: maps legacy hasMedia flag without fabricating a URL', () => {
  const result = normalizeReport({ id: 'RPT-1', text: 'Help needed', hasMedia: true, source: 'app' }, 'doc');
  assert.deepEqual(result.mediaUrls, []);
  assert.ok(result._meta.warnings.some((w) => w.includes('fabricated')));
});

test('normalizeReport: defaults missing tag to "other" with a warning', () => {
  const result = normalizeReport({ id: 'RPT-1', text: 'x', source: 'sms' }, 'doc');
  assert.equal(result.tag, 'other');
  assert.ok(result._meta.warnings.some((w) => w.includes('tag missing')));
});

test('deriveAreaLabel: buckets coordinates into a coarse zone label', () => {
  assert.equal(deriveAreaLabel({ lat: 26.9124, lng: 75.7873 }), 'Zone 26.91, 75.79');
  assert.equal(deriveAreaLabel(null), 'Unknown Area');
});
