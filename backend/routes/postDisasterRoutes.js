const express = require('express');
const { requireAuthority } = require('../middleware/authMiddleware');
const controller = require('../controllers/postDisasterController');

const router = express.Router();

router.post('/report', requireAuthority, controller.generateReport);
router.get('/report/latest', requireAuthority, controller.getLatestReport);
router.get('/report/:id', requireAuthority, controller.getReport);

module.exports = router;
