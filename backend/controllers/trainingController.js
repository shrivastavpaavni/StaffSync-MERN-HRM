const Training = require('../models/Training');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

// @desc    Get all training programs
// @route   GET /api/trainings
// @access  Private
exports.getAllTrainings = async (req, res) => {
  try {
    const { status, department } = req.query;
    const query = {};

    if (status && status !== 'All') query.status = status;
    if (department && department !== 'All') query.department = { $in: ['All', department] };

    const trainings = await Training.find(query)
      .populate('createdBy', 'name email role')
      .populate('participants.userId', 'name email avatar')
      .populate('participants.employeeId', 'employeeId department position')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve training programs',
      error: error.message,
    });
  }
};

// @desc    Get single training by ID
// @route   GET /api/trainings/:id
// @access  Private
exports.getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('participants.userId', 'name email avatar')
      .populate('participants.employeeId', 'employeeId department position');

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    res.status(200).json({
      success: true,
      data: training,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch training program',
      error: error.message,
    });
  }
};

// @desc    Create new training program (HR, Manager)
// @route   POST /api/trainings
// @access  Private (HR, Manager)
exports.createTraining = async (req, res) => {
  try {
    const {
      title,
      description,
      trainer,
      department,
      startDate,
      endDate,
      durationHours,
      maxParticipants,
    } = req.body;

    if (!title || !description || !trainer || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required training details',
      });
    }

    const training = await Training.create({
      title,
      description,
      trainer,
      department: department || 'All',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      durationHours: durationHours || 10,
      maxParticipants: maxParticipants || 30,
      status: new Date(startDate) > new Date() ? 'Upcoming' : 'Ongoing',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: training,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create training program',
      error: error.message,
    });
  }
};

// @desc    Enroll in training (Employee, Manager)
// @route   POST /api/trainings/:id/enroll
// @access  Private
exports.enrollInTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = training.participants.some(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this training program',
      });
    }

    if (training.participants.length >= training.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Training program is already at maximum participant capacity',
      });
    }

    const employee = await Employee.findOne({ userId: req.user._id });

    training.participants.push({
      userId: req.user._id,
      employeeId: employee?._id,
      enrolledAt: new Date(),
      status: 'Enrolled',
    });

    await training.save();

    await Notification.create({
      userId: req.user._id,
      title: 'Training Enrollment Confirmed',
      message: `You have successfully enrolled in "${training.title}".`,
      type: 'training',
      link: '/trainings',
    });

    res.status(200).json({
      success: true,
      message: 'Enrolled successfully!',
      data: training,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in training program',
      error: error.message,
    });
  }
};

// @desc    Update participant progress/completion status (Manager, HR)
// @route   PUT /api/trainings/:id/participants/:userId
// @access  Private (HR, Manager)
exports.updateParticipantStatus = async (req, res) => {
  try {
    const { status, score, feedback } = req.body;
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found',
      });
    }

    const participant = training.participants.find(
      (p) => p.userId.toString() === req.params.userId
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant record not found in this training',
      });
    }

    if (status) participant.status = status;
    if (score !== undefined) participant.score = score;
    if (feedback !== undefined) participant.feedback = feedback;
    if (status === 'Completed') participant.completionDate = new Date();

    await training.save();

    res.status(200).json({
      success: true,
      message: 'Participant progress updated successfully',
      data: training,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update participant progress',
      error: error.message,
    });
  }
};

// @desc    Delete training (HR, Manager)
// @route   DELETE /api/trainings/:id
// @access  Private (HR, Manager)
exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training not found',
      });
    }

    await Training.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Training program removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete training',
      error: error.message,
    });
  }
};
