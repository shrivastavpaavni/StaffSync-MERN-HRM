const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');
const Notification = require('../models/Notification');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at', mongoUri);

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Announcement.deleteMany({});
    await Training.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed] Cleared existing collections');

    // 1. Create Users
    console.log('[Seed] Creating Users...');
    const hrUser = await User.create({
      name: 'Eleanor Vance (HR Director)',
      email: 'hr@staffsync.com',
      password: 'password123',
      role: 'hr',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      isActive: true,
      lastLogin: new Date(),
    });

    const managerUser = await User.create({
      name: 'Marcus Sterling (Eng Manager)',
      email: 'manager@staffsync.com',
      password: 'password123',
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      isActive: true,
      lastLogin: new Date(),
    });

    const empAlex = await User.create({
      name: 'Alex Morgan',
      email: 'employee@staffsync.com',
      password: 'password123',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isActive: true,
      lastLogin: new Date(),
    });

    const empSarah = await User.create({
      name: 'Sarah Chen',
      email: 'sarah.chen@staffsync.com',
      password: 'password123',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      isActive: true,
      lastLogin: new Date(),
    });

    const empDavid = await User.create({
      name: 'David Kim',
      email: 'david.kim@staffsync.com',
      password: 'password123',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isActive: true,
      lastLogin: new Date(),
    });

    const empEmily = await User.create({
      name: 'Emily Davis',
      email: 'emily.davis@staffsync.com',
      password: 'password123',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isActive: true,
      lastLogin: new Date(),
    });

    // 2. Create Employee Profiles
    console.log('[Seed] Creating Employee Profiles...');
    const hrProfile = await Employee.create({
      userId: hrUser._id,
      employeeId: 'EMP-1001',
      department: 'Human Resources',
      position: 'Chief People Officer',
      salary: 120000,
      phone: '+1 (555) 234-5678',
      address: { street: '100 Silicon Way', city: 'San Francisco', state: 'CA', zipCode: '94105' },
      emergencyContact: { name: 'Robert Vance', relationship: 'Spouse', phone: '+1 (555) 999-1111' },
      joiningDate: new Date('2022-01-15'),
      skills: ['Talent Acquisition', 'Strategic HR', 'Conflict Resolution', 'Compensation & Benefits'],
      bio: 'Seasoned HR Director with over 10 years of experience shaping high-performing engineering cultures.',
    });

    const managerProfile = await Employee.create({
      userId: managerUser._id,
      employeeId: 'EMP-1002',
      department: 'Engineering',
      position: 'Senior Engineering Manager',
      salary: 145000,
      phone: '+1 (555) 345-6789',
      address: { street: '202 Mission St', city: 'San Francisco', state: 'CA', zipCode: '94105' },
      emergencyContact: { name: 'Elena Sterling', relationship: 'Spouse', phone: '+1 (555) 888-2222' },
      joiningDate: new Date('2022-03-01'),
      skills: ['Cloud Architecture', 'Agile Leadership', 'Node.js', 'System Design'],
      bio: 'Passionate engineering leader leading the core platform team with modern microservices architecture.',
    });

    const alexProfile = await Employee.create({
      userId: empAlex._id,
      employeeId: 'EMP-1003',
      department: 'Engineering',
      position: 'Senior Full Stack Engineer',
      managerId: managerUser._id,
      salary: 105000,
      phone: '+1 (555) 456-7890',
      address: { street: '404 Tech Boulevard', city: 'San Francisco', state: 'CA', zipCode: '94107' },
      emergencyContact: { name: 'Chloe Morgan', relationship: 'Sister', phone: '+1 (555) 777-3333' },
      joiningDate: new Date('2023-05-10'),
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'GraphQL', 'Docker'],
      leaveBalances: {
        annual: { total: 15, used: 3 },
        sick: { total: 10, used: 1 },
        casual: { total: 8, used: 0 },
      },
      bio: 'Full-stack software engineer building performant, accessible web applications and reliable microservices.',
    });

    const sarahProfile = await Employee.create({
      userId: empSarah._id,
      employeeId: 'EMP-1004',
      department: 'Engineering',
      position: 'Frontend Engineer',
      managerId: managerUser._id,
      salary: 88000,
      phone: '+1 (555) 567-8901',
      address: { street: '512 Market St', city: 'San Francisco', state: 'CA', zipCode: '94102' },
      emergencyContact: { name: 'Kevin Chen', relationship: 'Brother', phone: '+1 (555) 666-4444' },
      joiningDate: new Date('2023-09-01'),
      skills: ['React', 'Next.js', 'UI/UX Design', 'CSS Modules', 'Redux Toolkit'],
      bio: 'Frontend craftsman passionate about design systems and intuitive user interfaces.',
    });

    const davidProfile = await Employee.create({
      userId: empDavid._id,
      employeeId: 'EMP-1005',
      department: 'Marketing',
      position: 'Product Marketing Manager',
      salary: 92000,
      phone: '+1 (555) 678-9012',
      address: { street: '789 Castro St', city: 'San Francisco', state: 'CA', zipCode: '94114' },
      emergencyContact: { name: 'Hannah Kim', relationship: 'Mother', phone: '+1 (555) 555-5555' },
      joiningDate: new Date('2024-01-10'),
      skills: ['Growth Marketing', 'SEO', 'Content Strategy', 'Brand Messaging'],
      bio: 'Driven marketing specialist focused on product-led growth and B2B SaaS adoption.',
    });

    const emilyProfile = await Employee.create({
      userId: empEmily._id,
      employeeId: 'EMP-1006',
      department: 'Design',
      position: 'Senior Product Designer',
      salary: 96000,
      phone: '+1 (555) 789-0123',
      address: { street: '900 Valencia St', city: 'San Francisco', state: 'CA', zipCode: '94110' },
      emergencyContact: { name: 'James Davis', relationship: 'Father', phone: '+1 (555) 444-6666' },
      joiningDate: new Date('2024-02-15'),
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
      bio: 'Product designer passionate about accessibility, user journey mapping, and clean interaction aesthetics.',
    });

    // 3. Create Pre-filled Attendance Records for the past 5 days
    console.log('[Seed] Creating Attendance Records...');
    const allEmps = [
      { user: hrUser, emp: hrProfile },
      { user: managerUser, emp: managerProfile },
      { user: empAlex, emp: alexProfile },
      { user: empSarah, emp: sarahProfile },
      { user: empDavid, emp: davidProfile },
      { user: empEmily, emp: emilyProfile },
    ];

    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      for (let j = 0; j < allEmps.length; j++) {
        const item = allEmps[j];
        // Skip some on today so user can test check-in!
        if (i === 0 && (item.user.email === 'employee@staffsync.com' || item.user.email === 'manager@staffsync.com')) {
          continue; // Leave Alex Morgan & Manager ready to Check-In right now!
        }

        const isLate = j % 3 === 2;
        const checkInTime = new Date(`${dateStr}T09:${isLate ? '45' : '05'}:00`);
        const checkOutTime = i === 0 ? null : new Date(`${dateStr}T17:30:00`);
        const workHours = i === 0 ? 0 : isLate ? 7.75 : 8.4;

        await Attendance.create({
          userId: item.user._id,
          employeeId: item.emp._id,
          date: dateStr,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          status: isLate ? 'Late' : 'Present',
          workHours,
          notes: isLate ? 'Checked in after 09:30 AM' : 'Standard business day',
        });
      }
    }

    // 4. Create Pre-filled Leaves
    console.log('[Seed] Creating Leaves...');
    await Leave.create({
      userId: empAlex._id,
      employeeId: alexProfile._id,
      leaveType: 'Annual',
      startDate: new Date('2026-11-10'),
      endDate: new Date('2026-11-12'),
      totalDays: 3,
      reason: 'Family reunion trip and rest',
      status: 'Approved',
      reviewedBy: managerUser._id,
      reviewedAt: new Date(),
      reviewRemarks: 'Enjoy your time off! Team coverage arranged.',
    });

    await Leave.create({
      userId: empSarah._id,
      employeeId: sarahProfile._id,
      leaveType: 'Sick',
      startDate: new Date('2026-11-02'),
      endDate: new Date('2026-11-03'),
      totalDays: 2,
      reason: 'Wisdom tooth extraction surgery and recovery',
      status: 'Pending',
    });

    await Leave.create({
      userId: empDavid._id,
      employeeId: davidProfile._id,
      leaveType: 'Casual',
      startDate: new Date('2026-11-05'),
      endDate: new Date('2026-11-05'),
      totalDays: 1,
      reason: 'Personal paperwork appointment',
      status: 'Pending',
    });

    await Leave.create({
      userId: empEmily._id,
      employeeId: emilyProfile._id,
      leaveType: 'Annual',
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-10-17'),
      totalDays: 3,
      reason: 'Annual wellness retreat',
      status: 'Approved',
      reviewedBy: hrUser._id,
      reviewedAt: new Date('2026-10-10'),
      reviewRemarks: 'Approved by HR',
    });

    // 5. Create Announcements
    console.log('[Seed] Creating Announcements...');
    await Announcement.create({
      title: 'StaffSync 2026 Annual Company Retreat Announcement',
      content:
        'We are thrilled to announce our upcoming annual company summit in Lake Tahoe! All team members across all departments are invited for 3 days of strategic planning, team building, and celebration. Details on travel booking will be shared shortly.',
      priority: 'High',
      targetAudience: 'All',
      authorId: hrUser._id,
      authorName: hrUser.name,
      isPinned: true,
    });

    await Announcement.create({
      title: 'Open Enrollment for 2027 Health & Wellness Benefits',
      content:
        'The annual open enrollment window for medical, dental, vision, and wellness stipends begins next Monday. Please review the updated benefit guides on your portal and submit any modifications by November 20th.',
      priority: 'Urgent',
      targetAudience: 'All',
      authorId: hrUser._id,
      authorName: hrUser.name,
      isPinned: true,
    });

    await Announcement.create({
      title: 'Engineering Sprint 42 Release & Architectural Review',
      content:
        'The engineering department will host the Sprint 42 retrospective and microservice architecture showcase this Thursday at 3:00 PM PST. Demo links will be shared in Slack.',
      priority: 'Medium',
      targetAudience: 'Engineering',
      authorId: managerUser._id,
      authorName: managerUser.name,
      isPinned: false,
    });

    await Announcement.create({
      title: 'Q4 Performance Review & Bonus Evaluation Cycle',
      content:
        'Managers and employees are requested to complete self-evaluations and peer reviews before the end of next week. 1-on-1 performance review meetings will follow immediately.',
      priority: 'High',
      targetAudience: 'All',
      authorId: hrUser._id,
      authorName: hrUser.name,
      isPinned: false,
    });

    // 6. Create Training Programs
    console.log('[Seed] Creating Training Programs...');
    await Training.create({
      title: 'Modern Full-Stack Cloud Architecture & Microservices',
      description:
        'Hands-on masterclass covering distributed system design, event-driven architectures with Kafka, Docker containerization, and AWS serverless deployments.',
      trainer: 'Marcus Sterling',
      department: 'Engineering',
      startDate: new Date('2026-11-15'),
      endDate: new Date('2026-11-25'),
      durationHours: 20,
      maxParticipants: 25,
      status: 'Upcoming',
      createdBy: managerUser._id,
      participants: [
        {
          userId: empAlex._id,
          employeeId: alexProfile._id,
          enrolledAt: new Date(),
          status: 'Enrolled',
        },
        {
          userId: empSarah._id,
          employeeId: sarahProfile._id,
          enrolledAt: new Date(),
          status: 'Enrolled',
        },
      ],
    });

    await Training.create({
      title: 'Enterprise Cyber Security & Secure Coding Principles',
      description:
        'Comprehensive security awareness training covering OWASP Top 10 vulnerabilities, API authentication security, JWT hardening, and data encryption best practices.',
      trainer: 'Dr. Gregory Vance',
      department: 'All',
      startDate: new Date('2026-10-20'),
      endDate: new Date('2026-11-05'),
      durationHours: 12,
      maxParticipants: 40,
      status: 'Ongoing',
      createdBy: hrUser._id,
      participants: [
        {
          userId: empAlex._id,
          employeeId: alexProfile._id,
          enrolledAt: new Date('2026-10-20'),
          status: 'In Progress',
        },
        {
          userId: empDavid._id,
          employeeId: davidProfile._id,
          enrolledAt: new Date('2026-10-21'),
          status: 'In Progress',
        },
      ],
    });

    await Training.create({
      title: 'Modern Product Leadership & Cross-Functional Empathy',
      description:
        'Training workshop on aligning product design, engineering, and marketing goals for high-impact feature launches.',
      trainer: 'Eleanor Vance',
      department: 'All',
      startDate: new Date('2026-11-20'),
      endDate: new Date('2026-12-01'),
      durationHours: 15,
      maxParticipants: 30,
      status: 'Upcoming',
      createdBy: hrUser._id,
      participants: [],
    });

    // 7. Create Sample Notifications
    console.log('[Seed] Creating Notifications...');
    await Notification.create({
      userId: empAlex._id,
      title: 'Leave Approved',
      message: 'Your leave request for Annual Leave (3 days) has been approved by Marcus Sterling.',
      type: 'leave',
      link: '/leaves',
    });

    await Notification.create({
      userId: empAlex._id,
      title: 'New Announcement',
      message: 'Eleanor Vance posted: StaffSync 2026 Annual Company Retreat Announcement',
      type: 'announcement',
      link: '/announcements',
    });

    await Notification.create({
      userId: managerUser._id,
      title: 'Pending Leave Request',
      message: 'Sarah Chen submitted a Sick Leave request for 2 days.',
      type: 'leave',
      link: '/leaves',
    });

    console.log('[Seed] Database seeded successfully!');
    console.log('===========================================================');
    console.log('Test Accounts available:');
    console.log('HR Admin:   hr@staffsync.com        / password123');
    console.log('Manager:    manager@staffsync.com   / password123');
    console.log('Employee:   employee@staffsync.com  / password123');
    console.log('===========================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
