const express = require('express');
const { requireAuthority } = require('../middleware/authMiddleware');
const controller = require('../controllers/incidentController');

const router = express.Router();

router.get('/', requireAuthority, controller.listIncidents);
router.get('/:id', requireAuthority, controller.getIncident);
router.patch('/:id/status', requireAuthority, controller.updateStatus);
router.post('/:id/notes', requireAuthority, controller.addNote);
router.post('/:id/assign', requireAuthority, controller.assignResponder);
router.get('/:id/history', requireAuthority, controller.getHistory);

module.exports = router;
