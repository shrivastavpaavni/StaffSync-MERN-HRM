const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  getTrainingById,
  createTraining,
  enrollInTraining,
  updateParticipantStatus,
  deleteTraining,
} = require('../controllers/trainingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getAllTrainings)
  .post(authorize('hr', 'manager'), createTraining);

router
  .route('/:id')
  .get(getTrainingById)
  .delete(authorize('hr', 'manager'), deleteTraining);

router.post('/:id/enroll', enrollInTraining);
router.put('/:id/participants/:userId', authorize('hr', 'manager'), updateParticipantStatus);

module.exports = router;
