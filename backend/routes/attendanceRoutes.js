const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendanceHistory,
  getAllAttendance,
  markManualAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/my-history', getMyAttendanceHistory);

router.get('/all', authorize('hr', 'manager'), getAllAttendance);
router.post('/manual', authorize('hr'), markManualAttendance);

module.exports = router;
