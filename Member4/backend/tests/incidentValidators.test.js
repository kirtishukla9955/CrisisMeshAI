const test = require('node:test');
const assert = require('node:assert/strict');
const { validateStatusUpdate, validateNote, validateVolunteerConfirmation } = require('../validators/incidentValidators');

test('validateStatusUpdate: allows the canonical forward flow', () => {
  assert.deepEqual(validateStatusUpdate({ status: 'acknowledged' }, 'new'), { status: 'acknowledged', note: null });
  assert.deepEqual(validateStatusUpdate({ status: 'in_progress' }, 'acknowledged'), { status: 'in_progress', note: null });
  assert.deepEqual(validateStatusUpdate({ status: 'resolved' }, 'in_progress'), { status: 'resolved', note: null });
});

test('validateStatusUpdate: rejects skipping states', () => {
  assert.throws(() => validateStatusUpdate({ status: 'resolved' }, 'new'), /Cannot transition/);
  assert.throws(() => validateStatusUpdate({ status: 'in_progress' }, 'new'), /Cannot transition/);
});

test('validateStatusUpdate: rejects moving backward', () => {
  assert.throws(() => validateStatusUpdate({ status: 'new' }, 'acknowledged'), /Cannot transition/);
});

test('validateStatusUpdate: rejects legacy status values entirely', () => {
  assert.throws(() => validateStatusUpdate({ status: 'escalated' }, 'new'), /must be one of/);
  assert.throws(() => validateStatusUpdate({ status: 'rejected' }, 'new'), /must be one of/);
  assert.throws(() => validateStatusUpdate({ status: 'under_review' }, 'new'), /must be one of/);
});

test('validateStatusUpdate: rejects resolved incidents from transitioning further', () => {
  assert.throws(() => validateStatusUpdate({ status: 'in_progress' }, 'resolved'), /Cannot transition/);
});

test('validateStatusUpdate: rejects setting the same status again', () => {
  assert.throws(() => validateStatusUpdate({ status: 'new' }, 'new'), /already/);
});

test('validateStatusUpdate: rejects missing/invalid status', () => {
  assert.throws(() => validateStatusUpdate({}, 'new'), /required/);
  assert.throws(() => validateStatusUpdate({ status: 123 }, 'new'), /required/);
});

test('validateStatusUpdate: accepts an optional note, capped at 2000 chars', () => {
  const result = validateStatusUpdate({ status: 'acknowledged', note: 'Dispatched team.' }, 'new');
  assert.equal(result.note, 'Dispatched team.');
  assert.throws(() => validateStatusUpdate({ status: 'acknowledged', note: 'x'.repeat(2001) }, 'new'), /2000/);
});

test('validateNote: requires non-empty string', () => {
  assert.throws(() => validateNote({}), /required/);
  assert.throws(() => validateNote({ note: '   ' }), /required/);
  assert.deepEqual(validateNote({ note: ' Follow-up call placed. ' }), { note: 'Follow-up call placed.' });
});

test('validateVolunteerConfirmation: requires volunteerId', () => {
  assert.throws(() => validateVolunteerConfirmation({}), /required/);
  assert.deepEqual(
    validateVolunteerConfirmation({ volunteerId: 'VOL-1', volunteerName: 'Team Alpha' }),
    { volunteerId: 'VOL-1', volunteerName: 'Team Alpha' }
  );
});
