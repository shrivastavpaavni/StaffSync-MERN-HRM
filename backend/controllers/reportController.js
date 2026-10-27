const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Training = require('../models/Training');

const getTodayStr = (d = new Date()) => d.toISOString().split('T')[0];

// @desc    Get comprehensive HR Reports & Analytics
// @route   GET /api/reports/analytics
// @access  Private (HR, Manager)
exports.getHRAnalytics = async (req, res) => {
  try {
    const today = getTodayStr();

    // 1. Employee headcount and status
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalEmployees = await Employee.countDocuments({ status: { $ne: 'Terminated' } });
    const totalManagers = await User.countDocuments({ role: 'manager', isActive: true });
    const totalHR = await User.countDocuments({ role: 'hr', isActive: true });

    // 2. Department Breakdown
    const departmentAgg = await Employee.aggregate([
      { $match: { status: { $ne: 'Terminated' } } },
      { $group: { _id: '$department', count: { $sum: 1 }, avgSalary: { $avg: '$salary' } } },
      { $sort: { count: -1 } },
    ]);

    // 3. Today's Attendance breakdown
    const todayAttendance = await Attendance.find({ date: today });
    const presentToday = todayAttendance.filter((a) => a.status === 'Present').length;
    const lateToday = todayAttendance.filter((a) => a.status === 'Late').length;
    const halfDayToday = todayAttendance.filter((a) => a.status === 'Half-day').length;
    const absentToday = Math.max(0, totalEmployees - (presentToday + lateToday + halfDayToday));

    const attendanceRate = totalEmployees > 0
      ? Math.round(((presentToday + lateToday) / totalEmployees) * 100)
      : 100;

    // 4. Past 7 days attendance trend
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getTodayStr(d);
      const dayRecords = await Attendance.find({ date: dateStr });
      const present = dayRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
      past7Days.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        present,
        total: totalEmployees,
        rate: totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0,
      });
    }

    // 5. Leave distribution & pending requests
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });

    const leaveTypeAgg = await Leave.aggregate([
      { $group: { _id: '$leaveType', count: { $sum: 1 }, totalDays: { $sum: '$totalDays' } } },
    ]);

    // 6. Training statistics
    const totalTrainings = await Training.countDocuments();
    const activeTrainings = await Training.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } });
    const trainings = await Training.find().select('participants');
    let totalEnrolledParticipants = 0;
    let completedTrainingsCount = 0;

    trainings.forEach((t) => {
      totalEnrolledParticipants += t.participants?.length || 0;
      completedTrainingsCount += t.participants?.filter((p) => p.status === 'Completed').length || 0;
    });

    res.status(200).json({
      success: true,
      data: {
        workforce: {
          totalUsers,
          totalEmployees,
          totalManagers,
          totalHR,
          departmentDistribution: departmentAgg,
        },
        attendance: {
          todayDate: today,
          present: presentToday,
          late: lateToday,
          halfDay: halfDayToday,
          absent: absentToday,
          attendanceRate,
          weeklyTrend: past7Days,
        },
        leaves: {
          pending: pendingLeaves,
          approved: approvedLeaves,
          rejected: rejectedLeaves,
          distributionByType: leaveTypeAgg,
        },
        trainings: {
          totalTrainings,
          activeTrainings,
          totalParticipants: totalEnrolledParticipants,
          completions: completedTrainingsCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics report',
      error: error.message,
    });
  }
};
