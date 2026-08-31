const express = require('express');
const { requireAuthority } = require('../middleware/authMiddleware');
const controller = require('../controllers/incidentController');

const router = express.Router();

router.get('/', requireAuthority, controller.listIncidents);
router.get('/:id', requireAuthority, controller.getIncident);
router.patch('/:id/status', requireAuthority, controller.updateStatus);
router.post('/:id/notes', requireAuthority, controller.addNote);
// Round 2: volunteer *matching* is Member 3's algorithm (writes
// incident.suggestedVolunteers). This only records the authority's
// confirmation as an audit event — it never mutates the incident document.
router.post('/:id/confirm-volunteer', requireAuthority, controller.confirmVolunteer);
router.get('/:id/history', requireAuthority, controller.getHistory);

module.exports = router;
