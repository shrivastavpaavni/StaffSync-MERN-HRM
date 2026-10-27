const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get announcements (filtered by user audience/department)
// @route   GET /api/announcements
// @access  Private
exports.getAllAnnouncements = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userDepartment = req.employee?.department || '';

    let query = {};

    // HR and Managers can view everything. Employees see 'All' or their department.
    if (userRole === 'employee') {
      query = {
        targetAudience: { $in: ['All', userDepartment] },
      };
    }

    const announcements = await Announcement.find(query)
      .populate('authorId', 'name email avatar role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
      error: error.message,
    });
  }
};

// @desc    Create announcement (HR, Manager)
// @route   POST /api/announcements
// @access  Private (HR, Manager)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, targetAudience, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content',
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || 'Medium',
      targetAudience: targetAudience || 'All',
      isPinned: isPinned || false,
      authorId: req.user._id,
      authorName: req.user.name,
    });

    // Notify all active users or department
    const users = await User.find({ isActive: true }).select('_id');
    const notificationDocs = users.map((u) => ({
      userId: u._id,
      title: `Company Announcement: ${title}`,
      message: content.length > 80 ? content.substring(0, 80) + '...' : content,
      type: 'announcement',
      link: '/announcements',
    }));

    await Notification.insertMany(notificationDocs);

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message,
    });
  }
};

// @desc    Update announcement (HR)
// @route   PUT /api/announcements/:id
// @access  Private (HR)
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
      error: error.message,
    });
  }
};

// @desc    Delete announcement (HR)
// @route   DELETE /api/announcements/:id
// @access  Private (HR)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: error.message,
    });
  }
};
