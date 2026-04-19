const express = require('express');
const router = express.Router();
const {
  recordVisit,
  recordPageView,
  recordInteraction,
  batchRecord,
  getStats,
} = require('../controllers/analyticsController');

router.post('/visit', recordVisit);
router.post('/pageview', recordPageView);
router.post('/interaction', recordInteraction);
router.post('/batch', batchRecord);
router.get('/stats', getStats);

module.exports = router;
