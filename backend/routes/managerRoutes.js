const express = require('express');
const router = express.Router();
const {
  getTeamMembers,
  getTeamAttendance,
  getTeamLeaves,
  getManagerDashboardSummary,
} = require('../controllers/managerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('manager', 'hr'));

router.get('/team', getTeamMembers);
router.get('/team-attendance', getTeamAttendance);
router.get('/team-leaves', getTeamLeaves);
router.get('/dashboard-summary', getManagerDashboardSummary);

module.exports = router;
