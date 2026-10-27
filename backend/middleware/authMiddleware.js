const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'staffsync_super_secret_jwt_key_2026_xyz!@#');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR.',
      });
    }

    req.user = user;

    // Attach linked employee record if available
    const employee = await Employee.findOne({ userId: user._id });
    req.employee = employee;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or token has expired.',
      error: error.message,
    });
  }
};

module.exports = { protect };
