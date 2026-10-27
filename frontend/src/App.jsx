import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import HRDashboard from './pages/HRDashboard';
import AttendancePage from './pages/AttendancePage';
import LeaveManagementPage from './pages/LeaveManagementPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import TrainingsPage from './pages/TrainingsPage';
import EmployeesListPage from './pages/EmployeesListPage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import Profile from './pages/Profile';

// App Layout with Sidebar and Navbar
const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="content-body">{children}</main>
      </div>
    </div>
  );
};

// Role-based Dashboard Redirector
const DashboardDispatcher = () => {
  const { user } = useAuth();
  if (user?.role === 'hr') return <Navigate to="/dashboard/hr" replace />;
  if (user?.role === 'manager') return <Navigate to="/dashboard/manager" replace />;
  return <Navigate to="/dashboard/employee" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside AppLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardDispatcher />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/employee"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EmployeeDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/manager"
            element={
              <ProtectedRoute allowedRoles={['manager', 'hr']}>
                <AppLayout>
                  <ManagerDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/hr"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <AppLayout>
                  <HRDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AttendancePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaves"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LeaveManagementPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AnnouncementsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/trainings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TrainingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={['hr', 'manager']}>
                <AppLayout>
                  <EmployeesListPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['hr', 'manager']}>
                <AppLayout>
                  <ReportsAnalyticsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
