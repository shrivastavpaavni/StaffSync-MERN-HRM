import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Clock,
  CalendarCheck,
  Shield,
  GraduationCap,
  Bell,
  BarChart,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Sparkles,
} from 'lucide-react';

const Home = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password) => {
    try {
      const res = await login(email, password);
      if (res?.user?.role === 'hr') navigate('/dashboard/hr');
      else if (res?.user?.role === 'manager') navigate('/dashboard/manager');
      else navigate('/dashboard/employee');
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  return (
    <div className="bg-white min-vh-100">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 sticky-top">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4">
            <div
              className="rounded-3 p-2 d-flex align-items-center justify-content-center text-white"
              style={{ background: 'var(--primary-gradient)', width: '36px', height: '36px' }}
            >
              <Briefcase size={20} />
            </div>
            <span>
              Staff<span style={{ color: 'var(--primary)' }}>Sync</span>
            </span>
          </Link>

          <div className="d-flex align-items-center gap-3">
            <Link to="/login" className="btn btn-outline-custom">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary-custom">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
        <div className="container py-4 text-center">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-light border text-primary small fw-semibold mb-4">
            <Sparkles size={16} /> Next-Generation Human Resource Management
          </div>

          <h1 className="display-4 fw-extrabold text-dark mb-3" style={{ letterSpacing: '-1px' }}>
            Smart HR Operations for <br />
            <span style={{ color: 'var(--primary)' }}>Modern Distributed Teams</span>
          </h1>

          <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '680px' }}>
            StaffSync centralizes employee data, streamlines automated leave approvals,
            tracks real-time attendance, and manages professional development in one intuitive MERN platform.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <Link to="/login" className="btn btn-primary-custom px-4 py-2">
              Launch HRM Portal <ArrowRight size={18} />
            </Link>
            <a href="#quick-demo" className="btn btn-outline-custom px-4 py-2">
              Quick Role Demos
            </a>
          </div>

          {/* 1-Click Interactive Role Preview Cards */}
          <div id="quick-demo" className="pt-4">
            <h5 className="fw-bold text-dark mb-3">1-Click Live Role Demos</h5>
            <p className="text-muted small mb-4">Click any profile below to instantly log in and experience that role's interface.</p>

            <div className="row g-3 justify-content-center" style={{ maxWidth: '960px', margin: '0 auto' }}>
              {/* HR Card */}
              <div className="col-md-4">
                <div
                  className="card-custom p-4 text-start quick-login-card border-top border-4 border-danger"
                  onClick={() => handleQuickLogin('hr@staffsync.com', 'password123')}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
                      alt="HR"
                      className="avatar-img"
                    />
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">Eleanor Vance</h6>
                      <span className="badge-soft-danger">HR Director</span>
                    </div>
                  </div>
                  <p className="text-secondary small mb-3">
                    Company-wide analytics, employee lifecycle management, leave approvals, and notice board.
                  </p>
                  <button className="btn btn-sm btn-outline-danger w-100 fw-semibold">
                    Login as HR Admin →
                  </button>
                </div>
              </div>

              {/* Manager Card */}
              <div className="col-md-4">
                <div
                  className="card-custom p-4 text-start quick-login-card border-top border-4 border-primary"
                  onClick={() => handleQuickLogin('manager@staffsync.com', 'password123')}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"
                      alt="Manager"
                      className="avatar-img"
                    />
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">Marcus Sterling</h6>
                      <span className="badge-soft-primary">Engineering Manager</span>
                    </div>
                  </div>
                  <p className="text-secondary small mb-3">
                    Team supervision, pending leave reviews, daily team attendance tracking, and training.
                  </p>
                  <button className="btn btn-sm btn-outline-primary w-100 fw-semibold">
                    Login as Manager →
                  </button>
                </div>
              </div>

              {/* Employee Card */}
              <div className="col-md-4">
                <div
                  className="card-custom p-4 text-start quick-login-card border-top border-4 border-info"
                  onClick={() => handleQuickLogin('employee@staffsync.com', 'password123')}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                      alt="Employee"
                      className="avatar-img"
                    />
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">Alex Morgan</h6>
                      <span className="badge-soft-info">Software Engineer</span>
                    </div>
                  </div>
                  <p className="text-secondary small mb-3">
                    Interactive attendance clock-in, leave application with balance counters, and workshops.
                  </p>
                  <button className="btn btn-sm btn-outline-info w-100 fw-semibold">
                    Login as Employee →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-5 bg-white border-top">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge-soft-primary mb-2 d-inline-block">Full HRM Capabilities</span>
            <h2 className="fw-bold text-dark">Engineered for Efficiency & Transparency</h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
              Eliminate paper workflows and spreadsheets with modern, automated HR modules.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="badge-soft-primary p-3 rounded-3 d-inline-block mb-3">
                  <Clock size={24} />
                </div>
                <h5 className="fw-bold text-dark">Smart Attendance Tracking</h5>
                <p className="text-muted small">
                  One-click check-in and check-out with automatic late-arrival detection, work duration calculation, and monthly historical logs.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="badge-soft-success p-3 rounded-3 d-inline-block mb-3">
                  <CalendarCheck size={24} />
                </div>
                <h5 className="fw-bold text-dark">Leave Management System</h5>
                <p className="text-muted small">
                  Employees check real-time leave balances and apply instantly. Managers review requests with remarks, auto-deducting approved days.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="badge-soft-warning p-3 rounded-3 d-inline-block mb-3">
                  <Users size={24} />
                </div>
                <h5 className="fw-bold text-dark">Role-Based Access Control</h5>
                <p className="text-muted small">
                  Fine-grained permissions for HR, Managers, and Employees ensure that sensitive employee data, salaries, and controls remain strictly protected.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="badge-soft-info p-3 rounded-3 d-inline-block mb-3">
                  <GraduationCap size={24} />
                </div>
                <h5 className="fw-bold text-dark">Training & Development</h5>
                <p className="text-muted small">
                  Upskill workforce with centralized workshops. Employees enroll in courses while managers track completion and performance scores.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="badge-soft-danger p-3 rounded-3 d-inline-block mb-3">
                  <Bell size={24} />
                </div>
                <h5 className="fw-bold text-dark">Company Announcements</h5>
                <p className="text-muted small">
                  Broadcast urgent alerts, policy changes, and company events across the entire organization or targeted to specific departments.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="badge-soft-primary p-3 rounded-3 d-inline-block mb-3">
                  <BarChart size={24} />
                </div>
                <h5 className="fw-bold text-dark">HR Analytics & Reports</h5>
                <p className="text-muted small">
                  Executive visibility into attendance trends, department headcounts, salary expenditures, and leave distributions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-top bg-light">
        <div className="container text-center text-muted small">
          <p className="mb-1">
            <strong>StaffSync</strong> - Modern Human Resource Management Solution (MERN Stack)
          </p>
          <p className="mb-0">Designed for organizations demanding high transparency, agility, and security.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
