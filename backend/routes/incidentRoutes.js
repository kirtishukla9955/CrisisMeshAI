// backend/routes/incidentRoutes.js
const express = require('express');
const { requireAuthority } = require('../middleware/authMiddleware');
const controller = require('../controllers/incidentController');

const router = express.Router();

// List all incidents
router.get('/', requireAuthority, controller.listIncidents);

// Fetch clustered incidents for mapping (Must remain BEFORE /:id)
router.get('/clustered', requireAuthority, controller.getClusteredIncidents);

// Specific incident operations by ID
router.get('/:id', requireAuthority, controller.getIncident);
router.patch('/:id/status', requireAuthority, controller.updateStatus);
router.post('/:id/notes', requireAuthority, controller.addNote);
router.post('/:id/assign', requireAuthority, controller.assignResponder);
router.get('/:id/history', requireAuthority, controller.getHistory);

module.exports = router;