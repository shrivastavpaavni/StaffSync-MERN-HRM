const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['Engineering', 'Human Resources', 'Marketing', 'Sales', 'Finance', 'Operations', 'Design'],
      default: 'Engineering',
      index: true,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'USA' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    dateOfBirth: {
      type: Date,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 65000,
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Probation', 'Terminated'],
      default: 'Active',
      index: true,
    },
    leaveBalances: {
      annual: {
        total: { type: Number, default: 15 },
        used: { type: Number, default: 0 },
      },
      sick: {
        total: { type: Number, default: 10 },
        used: { type: Number, default: 0 },
      },
      casual: {
        total: { type: Number, default: 8 },
        used: { type: Number, default: 0 },
      },
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    bio: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
