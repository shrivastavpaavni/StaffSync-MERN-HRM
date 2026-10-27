const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeaveRequest,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/apply', applyLeave);
router.get('/my-leaves', getMyLeaves);
router.delete('/:id', cancelLeave);

router.get('/all', authorize('hr', 'manager'), getAllLeaves);
router.put('/:id/review', authorize('hr', 'manager'), reviewLeaveRequest);

module.exports = router;
