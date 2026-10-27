const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

// @desc    Apply for a leave
// @route   POST /api/leaves/apply
// @access  Private (Employee, Manager, HR)
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leave type, start date, end date, and reason',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // Calculate total days (inclusive)
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found',
      });
    }

    // Check balance if type is annual, sick, or casual
    const balanceKey = leaveType.toLowerCase();
    if (employee.leaveBalances && employee.leaveBalances[balanceKey]) {
      const balance = employee.leaveBalances[balanceKey];
      const available = balance.total - balance.used;
      if (totalDays > available) {
        return res.status(400).json({
          success: false,
          message: `Insufficient leave balance for ${leaveType} leave. Available: ${available} days, Requested: ${totalDays} days.`,
        });
      }
    }

    const leave = await Leave.create({
      userId: req.user._id,
      employeeId: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      status: 'Pending',
    });

    // Notify manager if assigned
    if (employee.managerId) {
      await Notification.create({
        userId: employee.managerId,
        title: 'New Leave Request',
        message: `${req.user.name} applied for ${totalDays} day(s) of ${leaveType} leave.`,
        type: 'leave',
        link: '/leaves',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to apply for leave',
      error: error.message,
    });
  }
};

// @desc    Get current user's leaves & balance
// @route   GET /api/leaves/my-leaves
// @access  Private
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user._id })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    const employee = await Employee.findOne({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: leaves,
      balances: employee?.leaveBalances || {
        annual: { total: 15, used: 0 },
        sick: { total: 10, used: 0 },
        casual: { total: 8, used: 0 },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave history',
      error: error.message,
    });
  }
};

// @desc    Get all leave requests (HR & Manager)
// @route   GET /api/leaves/all
// @access  Private (HR, Manager)
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType, department, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'All') query.status = status;
    if (leaveType && leaveType !== 'All') query.leaveType = leaveType;

    let leaves = await Leave.find(query)
      .populate('userId', 'name email avatar')
      .populate('employeeId', 'employeeId department position leaveBalances')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    // Filter by department if needed
    if (department && department !== 'All') {
      leaves = leaves.filter((l) => l.employeeId?.department === department);
    }

    const total = leaves.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginated = leaves.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginated,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave requests',
      error: error.message,
    });
  }
};

// @desc    Review/Approve/Reject leave request
// @route   PUT /api/leaves/:id/review
// @access  Private (HR, Manager)
exports.reviewLeaveRequest = async (req, res) => {
  try {
    const { status, reviewRemarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'",
      });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This leave request has already been ${leave.status.toLowerCase()}`,
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.reviewRemarks = reviewRemarks || (status === 'Approved' ? 'Approved by supervisor' : 'Rejected');

    await leave.save();

    // If approved, deduct from employee leave balance
    if (status === 'Approved') {
      const employee = await Employee.findById(leave.employeeId);
      const balanceKey = leave.leaveType.toLowerCase();

      if (employee && employee.leaveBalances && employee.leaveBalances[balanceKey]) {
        employee.leaveBalances[balanceKey].used += leave.totalDays;
        await employee.save();
      }
    }

    // Notify employee of decision
    await Notification.create({
      userId: leave.userId,
      title: `Leave Request ${status}`,
      message: `Your leave request for ${leave.leaveType} (${leave.totalDays} day(s)) has been ${status.toLowerCase()}.${leave.reviewRemarks ? ` Note: "${leave.reviewRemarks}"` : ''}`,
      type: 'leave',
      link: '/leaves',
    });

    const populated = await Leave.findById(leave._id)
      .populate('userId', 'name email avatar')
      .populate('employeeId', 'employeeId department position')
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to review leave request',
      error: error.message,
    });
  }
};

// @desc    Cancel own pending leave
// @route   DELETE /api/leaves/:id
// @access  Private
exports.cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    if (leave.userId.toString() !== req.user._id.toString() && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave requests can be cancelled',
      });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel leave request',
      error: error.message,
    });
  }
};
