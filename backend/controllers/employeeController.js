const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Get all employees with pagination & filters
// @route   GET /api/employees
// @access  Private (HR, Manager)
exports.getAllEmployees = async (req, res) => {
  try {
    const { department, status, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // If manager is requesting, manager can view all or their own team
    let employeesQuery = Employee.find(query)
      .populate('userId', 'name email role avatar isActive lastLogin')
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });

    let employees = await employeesQuery.exec();

    // Search filter across name, email, employeeId, position
    if (search) {
      const term = search.toLowerCase();
      employees = employees.filter((emp) => {
        const name = emp.userId?.name?.toLowerCase() || '';
        const email = emp.userId?.email?.toLowerCase() || '';
        const empId = emp.employeeId?.toLowerCase() || '';
        const pos = emp.position?.toLowerCase() || '';
        const dept = emp.department?.toLowerCase() || '';
        return (
          name.includes(term) ||
          email.includes(term) ||
          empId.includes(term) ||
          pos.includes(term) ||
          dept.includes(term)
        );
      });
    }

    const total = employees.length;
    const paginatedEmployees = employees.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      count: paginatedEmployees.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: paginatedEmployees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employees',
      error: error.message,
    });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'name email role avatar isActive lastLogin')
      .populate('managerId', 'name email role');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found',
      });
    }

    // Role check: Employee can only view self unless HR/Manager
    if (
      req.user.role === 'employee' &&
      employee.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view other employee details',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee details',
      error: error.message,
    });
  }
};

// @desc    Update employee personal profile (Employee self-update)
// @route   PUT /api/employees/profile
// @access  Private
exports.updateOwnProfile = async (req, res) => {
  try {
    const { name, phone, address, emergencyContact, bio, skills } = req.body;

    // Update User name
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name }, { runValidators: true });
    }

    // Update Employee details
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    if (phone !== undefined) employee.phone = phone;
    if (address !== undefined) employee.address = { ...employee.address, ...address };
    if (emergencyContact !== undefined) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
    if (bio !== undefined) employee.bio = bio;
    if (skills !== undefined) {
      employee.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    await employee.save();

    const updatedEmployee = await Employee.findById(employee._id)
      .populate('userId', 'name email role avatar lastLogin')
      .populate('managerId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// @desc    Create/Onboard a new employee (HR only)
// @route   POST /api/employees
// @access  Private (HR)
exports.createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'employee',
      department,
      position,
      managerId,
      salary,
      phone,
      joiningDate,
    } = req.body;

    if (!name || !email || !password || !department || !position) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, department, position',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: ['hr', 'manager', 'employee'].includes(role) ? role : 'employee',
    });

    const count = await Employee.countDocuments();
    const employeeId = `EMP-${String(count + 1001).padStart(4, '0')}`;

    const employee = await Employee.create({
      userId: user._id,
      employeeId,
      department,
      position,
      managerId: managerId || null,
      salary: salary || 60000,
      phone: phone || '',
      joiningDate: joiningDate || new Date(),
    });

    const populated = await Employee.findById(employee._id)
      .populate('userId', 'name email role avatar isActive')
      .populate('managerId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Employee created and onboarded successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message,
    });
  }
};

// @desc    Update employee info (HR only)
// @route   PUT /api/employees/:id
// @access  Private (HR)
exports.updateEmployeeByHR = async (req, res) => {
  try {
    const {
      name,
      role,
      department,
      position,
      managerId,
      salary,
      status,
      phone,
      leaveBalances,
    } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found',
      });
    }

    // Update user info
    if (name || role) {
      const userUpdate = {};
      if (name) userUpdate.name = name;
      if (role && ['hr', 'manager', 'employee'].includes(role)) userUpdate.role = role;
      await User.findByIdAndUpdate(employee.userId, userUpdate);
    }

    // Update employee fields
    if (department) employee.department = department;
    if (position) employee.position = position;
    if (managerId !== undefined) employee.managerId = managerId || null;
    if (salary !== undefined) employee.salary = Number(salary);
    if (status) employee.status = status;
    if (phone !== undefined) employee.phone = phone;
    if (leaveBalances) employee.leaveBalances = leaveBalances;

    await employee.save();

    const updated = await Employee.findById(employee._id)
      .populate('userId', 'name email role avatar isActive')
      .populate('managerId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Employee details updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message,
    });
  }
};

// @desc    Delete/Deactivate employee (HR only)
// @route   DELETE /api/employees/:id
// @access  Private (HR)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Deactivate user
    await User.findByIdAndUpdate(employee.userId, { isActive: false });
    employee.status = 'Terminated';
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee account deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message,
    });
  }
};

// @desc    Get list of all managers (for assignment dropdown)
// @route   GET /api/employees/managers/list
// @access  Private
exports.getManagersList = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager', isActive: true }).select('name email _id');
    res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch managers list',
      error: error.message,
    });
  }
};
