# StaffSync - Modern Human Resource Management Solution

StaffSync is an enterprise-grade, comprehensive web-based Human Resource Management (HRM) solution built on the **MERN Stack** (MongoDB, Express.js, React.js, and Node.js). It digitizes, automates, and streamlines human resource processes across organizations with dedicated interfaces and fine-grained access control for **HR Administrators**, **Department Managers**, and **Employees**.

---

## 🌟 Key Capabilities & Features

### 1. 🛡️ Role-Based Access Control (RBAC) & Portals
- **HR Director Portal**: Organization-wide oversight, employee directory with onboarding/termination workflows, company attendance tracking, leave approval pipeline, announcement broadcasting, and interactive reports & analytics.
- **Department Manager Portal**: Direct report supervision, daily team attendance tracking, time-off review & approvals with supervisor remarks, team skill development.
- **Employee Portal**: Live attendance clock-in/clock-out station with real-time shift timers, leave applications with automatic balance calculations (Annual, Sick, Casual), company bulletin board, and training program enrollments.

### 2. ⏱️ Smart Attendance Management
- Interactive Clock-In / Clock-Out station with live elapsed time.
- Automatic late detection (shifts starting after 09:30 AM).
- Work duration computation in hours (e.g. 8.5 hrs) and half-day detection for shifts under 4 hours.
- Daily/monthly historical logs with filterable status badges (`Present`, `Late`, `Half-day`, `Absent`).
- HR manual attendance override with audit notes.

### 3. 🏖️ Leave Management Workflow
- Real-time leave balance tracking across multiple categories (**Annual Vacation**, **Sick/Medical**, **Casual/Personal**).
- Duration auto-calculation based on start and end dates.
- Approval workflow with supervisor remarks that automatically deducts approved days from employee leave balances.
- Employee self-service cancellation for pending requests.

### 4. 📢 Announcements & Notice Board
- Corporate communications with priority indicators (`Urgent`, `High`, `Medium`, `Low`).
- Pinned notices for critical organizational updates.
- Departmental targeting (`All`, `Engineering`, `HR`, `Marketing`, `Sales`, `Finance`, `Managers`).

### 5. 🎓 Training & Development
- Centralized workshop catalog with trainer profiles, duration, and capacity metrics.
- One-click employee self-enrollment.
- Real-time participant progress tracking (`Enrolled`, `In Progress`, `Completed`).

### 6. 📊 Reports & Analytics
- Live workforce headcount and department distribution with benchmark salary analysis.
- 7-day attendance health trend charts.
- Time-off distribution by leave category.
- Training completion ratios.

---

## 🔑 Pre-Configured Demo Accounts

For immediate evaluation, the database includes pre-seeded demo accounts:

| Role | Name | Email | Password |
|---|---|---|---|
| **HR Director** | Eleanor Vance | `hr@staffsync.com` | `password123` |
| **Engineering Manager** | Marcus Sterling | `manager@staffsync.com` | `password123` |
| **Senior Engineer** | Alex Morgan | `employee@staffsync.com` | `password123` |
| **Frontend Engineer** | Sarah Chen | `sarah.chen@staffsync.com` | `password123` |
| **Product Marketing** | David Kim | `david.kim@staffsync.com` | `password123` |
| **Product Designer** | Emily Davis | `emily.davis@staffsync.com` | `password123` |

> 💡 *The home landing page and login page also feature **1-Click Quick Demo Login** buttons for instant access.*

---

## 📂 Project Structure

```text
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js         # JWT auth, login, registration, password updates
│   │   ├── employeeController.js     # Directory, profile CRUD, manager assignment
│   │   ├── managerController.js      # Team dashboard, team leaves, team attendance
│   │   ├── attendanceController.js   # Clock in/out, history, manual records
│   │   ├── leaveController.js        # Leave applications, approval workflow, balance deduction
│   │   ├── announcementController.js # Notice board CRUD & priority management
│   │   ├── trainingController.js     # Program scheduling, enrollment, progress
│   │   ├── reportController.js       # Executive analytics, department metrics
│   │   └── notificationController.js # Real-time notification feed
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification & user attachment
│   │   └── roleMiddleware.js     # RBAC authorization middleware
│   ├── models/
│   │   ├── User.js               # Auth credentials, role, active status
│   │   ├── Employee.js           # Extended profile, department, salary, leave balances
│   │   ├── Attendance.js         # Check-in/out timestamps, duration, status
│   │   ├── Leave.js              # Time-off requests, status, reviewer notes
│   │   ├── Announcement.js       # Corporate notices, audience targeting
│   │   ├── Training.js           # Courses, enrolled participants, completion
│   │   └── Notification.js       # In-app notifications
│   ├── routes/                   # Express REST API routes
│   ├── test/
│   │   └── api.test.js           # 20 automated integration tests
│   ├── utils/
│   │   └── seedData.js           # Realistic enterprise database seeder
│   └── server.js                 # Express server & static asset handler
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, StatCard, Modal, ProtectedRoute
│   │   ├── context/              # AuthContext (state, JWT storage, refresh)
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing page with interactive demo triggers
│   │   │   ├── Login.jsx             # 1-click credentials login
│   │   │   ├── Register.jsx          # Self-service employee registration
│   │   │   ├── EmployeeDashboard.jsx # Personalized work dashboard
│   │   │   ├── ManagerDashboard.jsx  # Team supervision & approvals
│   │   │   ├── HRDashboard.jsx       # Organization control center
│   │   │   ├── AttendancePage.jsx    # Live clock station & logs
│   │   │   ├── LeaveManagementPage.jsx # Balances & review workflows
│   │   │   ├── AnnouncementsPage.jsx # Interactive notice board
│   │   │   ├── TrainingsPage.jsx     # Course catalog & enrollment
│   │   │   ├── EmployeesListPage.jsx # Full searchable staff directory
│   │   │   ├── ReportsAnalyticsPage.jsx # Visual analytics & charts
│   │   │   └── Profile.jsx           # Personal profile & security settings
│   │   ├── services/
│   │   │   └── api.js                # Axios instance with JWT interceptors
│   │   ├── App.jsx               # React Router layout & role guards
│   │   └── index.css             # Modern SaaS design system
│   └── vite.config.js            # Vite configuration with API proxy
└── package.json                  # Root runner scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on port 27017 or a MongoDB Atlas URI

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Seed Database
Run the seed script to populate realistic enterprise sample data:
```bash
node backend/utils/seedData.js
```

### 4. Run Automated Tests
StaffSync comes with a 20-test automated API test suite covering authentication, RBAC, attendance, leaves, and analytics:
```bash
node backend/test/api.test.js
```

### 5. Start the Application
You can run the full application in production or development mode:

**Option A: Single-Port Unified Production Mode (Fastest & Simplest)**
Build the frontend and run backend server (serves both React SPA and REST API from `http://localhost:5000`):
```bash
# In frontend directory:
npm run build

# In backend directory:
node server.js
```
Open **`http://localhost:5000`** in your browser.

**Option B: Independent Development Mode**
- Backend: `node backend/server.js` (runs on `http://localhost:5000`)
- Frontend: `cd frontend && npm run dev` (runs on `http://localhost:3000` with automated API proxy)

---

## 🔒 Security Best Practices
- **Password Protection**: Passwords salted and hashed with `bcryptjs` (salt rounds: 10).
- **Session Tokens**: Signed JSON Web Tokens (JWT) with configurable expiry.
- **Route Protection**: Client-side route guards combined with server-side role middleware ensuring non-authorized roles cannot access restricted resources.
- **Database Indexing**: Compound unique index `{ userId: 1, date: 1 }` prevents duplicate daily attendance entries.
