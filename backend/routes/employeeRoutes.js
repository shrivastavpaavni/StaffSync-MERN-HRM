const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  updateOwnProfile,
  createEmployee,
  updateEmployeeByHR,
  deleteEmployee,
  getManagersList,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/managers/list', getManagersList);
router.put('/profile', updateOwnProfile);

router
  .route('/')
  .get(authorize('hr', 'manager'), getAllEmployees)
  .post(authorize('hr'), createEmployee);

router
  .route('/:id')
  .get(getEmployeeById)
  .put(authorize('hr'), updateEmployeeByHR)
  .delete(authorize('hr'), deleteEmployee);

module.exports = router;
