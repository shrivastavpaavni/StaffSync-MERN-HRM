const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

// Helper to get today's normalized date YYYY-MM-DD
const getTodayStr = (d = new Date()) => {
  return d.toISOString().split('T')[0];
};

// @desc    Check-in for today
// @route   POST /api/attendance/check-in
// @access  Private (Employee, Manager, HR)
exports.checkIn = async (req, res) => {
  try {
    const today = getTodayStr();
    const userId = req.user._id;

    // Find linked employee
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found for this user',
      });
    }

    // Check if already checked in today
    let record = await Attendance.findOne({ userId, date: today });
    if (record) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today at ' + new Date(record.checkIn).toLocaleTimeString(),
        data: record,
      });
    }

    const checkInTime = new Date();

    // Determine status based on standard 9:30 AM threshold
    const hour = checkInTime.getHours();
    const minute = checkInTime.getMinutes();
    const isLate = hour > 9 || (hour === 9 && minute > 30);
    const status = isLate ? 'Late' : 'Present';

    record = await Attendance.create({
      userId,
      employeeId: employee._id,
      date: today,
      checkIn: checkInTime,
      status,
      notes: req.body.notes || (isLate ? 'Checked in after 09:30 AM' : 'On-time check-in'),
      ipAddress: req.ip || '',
    });

    res.status(201).json({
      success: true,
      message: `Checked in successfully as ${status}`,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record check-in',
      error: error.message,
    });
  }
};

// @desc    Check-out for today
// @route   POST /api/attendance/check-out
// @access  Private (Employee, Manager, HR)
exports.checkOut = async (req, res) => {
  try {
    const today = getTodayStr();
    const userId = req.user._id;

    const record = await Attendance.findOne({ userId, date: today });
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'You must check-in before checking out',
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today at ' + new Date(record.checkOut).toLocaleTimeString(),
        data: record,
      });
    }

    const checkOutTime = new Date();
    const diffMs = checkOutTime - new Date(record.checkIn);
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // 2 decimal places

    record.checkOut = checkOutTime;
    record.workHours = hours;

    if (hours < 4 && record.status === 'Present') {
      record.status = 'Half-day';
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully! Total work duration: ${hours} hours.`,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record check-out',
      error: error.message,
    });
  }
};

// @desc    Get current user's today attendance status
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayStatus = async (req, res) => {
  try {
    const today = getTodayStr();
    const record = await Attendance.findOne({ userId: req.user._id, date: today });

    res.status(200).json({
      success: true,
      hasCheckedIn: !!record,
      hasCheckedOut: !!record?.checkOut,
      data: record || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check today status',
      error: error.message,
    });
  }
};

// @desc    Get current user's attendance history
// @route   GET /api/attendance/my-history
// @access  Private
exports.getMyAttendanceHistory = async (req, res) => {
  try {
    const { month, year, page = 1, limit = 15 } = req.query;
    const query = { userId: req.user._id };

    if (month && year) {
      const paddedMonth = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${paddedMonth}` };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate monthly stats
    const allUserRecords = await Attendance.find({ userId: req.user._id });
    const presentCount = allUserRecords.filter((r) => r.status === 'Present').length;
    const lateCount = allUserRecords.filter((r) => r.status === 'Late').length;
    const halfDayCount = allUserRecords.filter((r) => r.status === 'Half-day').length;
    const totalHours = allUserRecords.reduce((sum, r) => sum + (r.workHours || 0), 0);

    res.status(200).json({
      success: true,
      data: records,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      stats: {
        totalDays: allUserRecords.length,
        presentCount,
        lateCount,
        halfDayCount,
        totalHours: Math.round(totalHours * 10) / 10,
        averageHours: allUserRecords.length > 0 ? (totalHours / allUserRecords.length).toFixed(1) : '0',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance history',
      error: error.message,
    });
  }
};

// @desc    Get all attendance (HR & Managers) with filters
// @route   GET /api/attendance/all
// @access  Private (HR, Manager)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, department, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (date) query.date = date;
    if (status && status !== 'All') query.status = status;

    let recordsQuery = Attendance.find(query)
      .populate('userId', 'name email avatar')
      .populate('employeeId', 'employeeId department position')
      .sort({ date: -1, createdAt: -1 });

    let records = await recordsQuery.exec();

    // Department filter
    if (department && department !== 'All') {
      records = records.filter((r) => r.employeeId?.department === department);
    }

    const total = records.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedRecords = records.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginatedRecords,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance logs',
      error: error.message,
    });
  }
};

// @desc    Mark manual attendance (HR only)
// @route   POST /api/attendance/manual
// @access  Private (HR)
exports.markManualAttendance = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, date, and status are required',
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    let workHours = 0;
    if (checkIn && checkOut) {
      const diffMs = new Date(checkOut) - new Date(checkIn);
      workHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
    } else if (status === 'Present') {
      workHours = 8;
    } else if (status === 'Half-day') {
      workHours = 4;
    }

    const record = await Attendance.findOneAndUpdate(
      { userId: employee.userId, date },
      {
        userId: employee.userId,
        employeeId: employee._id,
        date,
        checkIn: checkIn ? new Date(checkIn) : new Date(`${date}T09:00:00`),
        checkOut: checkOut ? new Date(checkOut) : status === 'Present' ? new Date(`${date}T17:00:00`) : null,
        status,
        workHours,
        notes: notes || 'Manual entry by HR',
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark manual attendance',
      error: error.message,
    });
  }
};
