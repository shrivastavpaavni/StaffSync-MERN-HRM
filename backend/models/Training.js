const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Training description is required'],
    },
    trainer: {
      type: String,
      required: [true, 'Trainer name is required'],
      trim: true,
    },
    department: {
      type: String,
      enum: ['All', 'Engineering', 'Human Resources', 'Marketing', 'Sales', 'Finance', 'Operations', 'Design'],
      default: 'All',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    durationHours: {
      type: Number,
      default: 10,
    },
    maxParticipants: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee',
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['Enrolled', 'In Progress', 'Completed', 'Dropped'],
          default: 'Enrolled',
        },
        completionDate: {
          type: Date,
        },
        feedback: {
          type: String,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Training', trainingSchema);
