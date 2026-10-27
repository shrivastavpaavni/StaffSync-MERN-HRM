const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Training = require('../models/Training');

// Helper to get today's normalized date YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split('T')[0];

// @desc    Get team members managed by logged-in manager
// @route   GET /api/manager/team
// @access  Private (Manager, HR)
exports.getTeamMembers = async (req, res) => {
  try {
    const managerId = req.user._id;

    // Fetch employees assigned to this manager, or if HR/General manager fetch department
    let query = { managerId };
    if (req.user.role === 'hr') {
      query = {}; // HR can see all
    }

    const team = await Employee.find(query)
      .populate('userId', 'name email avatar isActive lastLogin')
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: team.length,
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members',
      error: error.message,
    });
  }
};

// @desc    Get team attendance for today or specific date
// @route   GET /api/manager/team-attendance
// @access  Private (Manager, HR)
exports.getTeamAttendance = async (req, res) => {
  try {
    const { date = getTodayStr() } = req.query;
    const managerId = req.user._id;

    // Get team members
    const teamMembers = await Employee.find({ managerId }).populate('userId', 'name email avatar');
    const userIds = teamMembers.map((m) => m.userId?._id).filter(Boolean);

    // Get attendance records for team members on given date
    const attendanceRecords = await Attendance.find({
      userId: { $in: userIds },
      date,
    }).populate('userId', 'name email avatar');

    // Merge to show who has checked in and who is absent/pending
    const result = teamMembers.map((member) => {
      const record = attendanceRecords.find(
        (a) => a.userId?._id?.toString() === member.userId?._id?.toString()
      );
      return {
        employee: member,
        attendance: record || {
          date,
          status: 'Absent',
          checkIn: null,
          checkOut: null,
          workHours: 0,
        },
      };
    });

    res.status(200).json({
      success: true,
      date,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve team attendance',
      error: error.message,
    });
  }
};

// @desc    Get team leave requests
// @route   GET /api/manager/team-leaves
// @access  Private (Manager, HR)
exports.getTeamLeaves = async (req, res) => {
  try {
    const managerId = req.user._id;

    // Find team members
    const teamMembers = await Employee.find({ managerId }).select('_id userId');
    const employeeIds = teamMembers.map((e) => e._id);

    const leaves = await Leave.find({ employeeId: { $in: employeeIds } })
      .populate('userId', 'name email avatar')
      .populate('employeeId', 'employeeId department position')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team leave requests',
      error: error.message,
    });
  }
};

// @desc    Get manager dashboard summary & team metrics
// @route   GET /api/manager/dashboard-summary
// @access  Private (Manager)
exports.getManagerDashboardSummary = async (req, res) => {
  try {
    const managerId = req.user._id;
    const today = getTodayStr();

    const teamMembers = await Employee.find({ managerId }).populate('userId', 'name email avatar');
    const userIds = teamMembers.map((m) => m.userId?._id).filter(Boolean);
    const employeeIds = teamMembers.map((m) => m._id);

    // Attendance today
    const attendanceToday = await Attendance.find({
      userId: { $in: userIds },
      date: today,
    });

    const presentCount = attendanceToday.filter((a) => a.status === 'Present' || a.status === 'Late').length;

    // Pending team leave requests
    const pendingLeaves = await Leave.find({
      employeeId: { $in: employeeIds },
      status: 'Pending',
    })
      .populate('userId', 'name email avatar')
      .populate('employeeId', 'department position');

    // Team trainings
    const trainings = await Training.find({
      $or: [{ createdBy: managerId }, { 'participants.userId': { $in: userIds } }],
    }).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      summary: {
        totalTeamMembers: teamMembers.length,
        presentToday: presentCount,
        absentToday: teamMembers.length - presentCount,
        pendingLeavesCount: pendingLeaves.length,
        activeTrainingsCount: trainings.filter((t) => t.status === 'Ongoing' || t.status === 'Upcoming').length,
      },
      pendingLeaves,
      recentTrainings: trainings.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate manager dashboard summary',
      error: error.message,
    });
  }
};
