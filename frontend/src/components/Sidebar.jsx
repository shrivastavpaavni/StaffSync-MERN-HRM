import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  Bell,
  GraduationCap,
  Users,
  BarChart3,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isHR, isManager } = useAuth();

  const getDashboardPath = () => {
    if (user?.role === 'hr') return '/dashboard/hr';
    if (user?.role === 'manager') return '/dashboard/manager';
    return '/dashboard/employee';
  };

  return (
    <aside className="sidebar p-3">
      {/* Brand Logo Header */}
      <div className="d-flex align-items-center gap-2 mb-4 px-2 py-2">
        <div
          className="rounded-3 p-2 d-flex align-items-center justify-content-center text-white"
          style={{ background: 'var(--primary-gradient)', width: '38px', height: '38px' }}
        >
          <Briefcase size={20} />
        </div>
        <div>
          <h5 className="mb-0 fw-bold" style={{ letterSpacing: '-0.5px' }}>
            Staff<span style={{ color: 'var(--primary)' }}>Sync</span>
          </h5>
          <span className="text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
            HR ENTERPRISE SUITE
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-grow-1 overflow-y-auto">
        <div className="text-uppercase text-muted fw-bold px-3 mb-2" style={{ fontSize: '0.7rem' }}>
          Core Menu
        </div>

        <NavLink
          to={getDashboardPath()}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <User size={18} />
          <span>My Profile</span>
        </NavLink>

        <NavLink
          to="/attendance"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Clock size={18} />
          <span>Attendance</span>
        </NavLink>

        <NavLink
          to="/leaves"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <CalendarDays size={18} />
          <span>Leave Management</span>
        </NavLink>

        <NavLink
          to="/announcements"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Bell size={18} />
          <span>Announcements</span>
        </NavLink>

        <NavLink
          to="/trainings"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <GraduationCap size={18} />
          <span>Training Programs</span>
        </NavLink>

        {/* Manager Section */}
        {isManager && (
          <>
            <div className="text-uppercase text-muted fw-bold px-3 mt-4 mb-2" style={{ fontSize: '0.7rem' }}>
              Management
            </div>
            <NavLink
              to="/dashboard/manager"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Team Management</span>
            </NavLink>
          </>
        )}

        {/* HR Section */}
        {isHR && (
          <>
            <div className="text-uppercase text-muted fw-bold px-3 mt-4 mb-2" style={{ fontSize: '0.7rem' }}>
              HR Administration
            </div>
            <NavLink
              to="/dashboard/hr"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <ShieldCheck size={18} />
              <span>HR Control Center</span>
            </NavLink>

            <NavLink
              to="/employees"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Employee Directory</span>
            </NavLink>

            <NavLink
              to="/analytics"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Reports & Analytics</span>
            </NavLink>
          </>
        )}
      </div>

      {/* User Info Footer in Sidebar */}
      <div className="pt-3 border-top mt-auto">
        <div className="p-2 rounded bg-light d-flex align-items-center gap-2">
          <div className="avatar-initials" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
            {user?.name?.[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="fw-bold small text-truncate">{user?.name}</div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
              {user?.email}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
