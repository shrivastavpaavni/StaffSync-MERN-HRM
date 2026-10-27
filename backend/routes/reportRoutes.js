const express = require('express');
const router = express.Router();
const { getHRAnalytics } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('hr', 'manager'));

router.get('/analytics', getHRAnalytics);

module.exports = router;
