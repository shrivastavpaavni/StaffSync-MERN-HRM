const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getAllAnnouncements)
  .post(authorize('hr', 'manager'), createAnnouncement);

router
  .route('/:id')
  .put(authorize('hr'), updateAnnouncement)
  .delete(authorize('hr'), deleteAnnouncement);

module.exports = router;
