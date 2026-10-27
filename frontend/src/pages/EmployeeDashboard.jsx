import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attendanceService, leaveService, announcementService, trainingService } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Bell,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Briefcase,
  Play,
  Square,
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, employee } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leavesData, setLeavesData] = useState({ data: [], balances: {} });
  const [announcements, setAnnouncements] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [attRes, leaveRes, annRes, trainRes] = await Promise.all([
        attendanceService.getTodayStatus(),
        leaveService.getMyLeaves(),
        announcementService.getAll(),
        trainingService.getAll(),
      ]);

      if (attRes.data.success) setTodayAttendance(attRes.data);
      if (leaveRes.data.success) setLeavesData(leaveRes.data);
      if (annRes.data.success) setAnnouncements(annRes.data.data.slice(0, 3));
      if (trainRes.data.success) setTrainings(trainRes.data.data.slice(0, 3));
    } catch (err) {
      console.error('Failed to load employee dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkIn({ notes: 'On-time web check-in' });
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkOut();
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  const balances = leavesData.balances || employee?.leaveBalances || {
    annual: { total: 15, used: 0 },
    sick: { total: 10, used: 0 },
    casual: { total: 8, used: 0 },
  };

  const annualAvailable = (balances.annual?.total || 15) - (balances.annual?.used || 0);
  const sickAvailable = (balances.sick?.total || 10) - (balances.sick?.used || 0);
  const casualAvailable = (balances.casual?.total || 8) - (balances.casual?.used || 0);

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card-gradient-primary p-4 mb-4 shadow-sm">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-white text-primary mb-2 fw-semibold">
              {employee?.position || 'Employee'} • {employee?.department || 'StaffSync'}
            </span>
            <h2 className="fw-bold mb-1">Good day, {user?.name}! 👋</h2>
            <p className="mb-0 text-white-50 small">
              Employee ID: <strong>{employee?.employeeId || 'EMP-1000'}</strong> • Here is your current work summary and schedule.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <div className="bg-white bg-opacity-25 rounded-3 p-3 d-inline-block text-center">
              <div className="small text-white-50">Local Work Time</div>
              <div className="fs-4 fw-bold">{currentTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Annual Leave"
            value={`${annualAvailable} Days`}
            subtitle={`${balances.annual?.used || 0} days used of ${balances.annual?.total || 15}`}
            icon={Calendar}
            color="primary"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Sick Leave"
            value={`${sickAvailable} Days`}
            subtitle={`${balances.sick?.used || 0} days used of ${balances.sick?.total || 10}`}
            icon={Calendar}
            color="warning"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Casual Leave"
            value={`${casualAvailable} Days`}
            subtitle={`${balances.casual?.used || 0} days used of ${balances.casual?.total || 8}`}
            icon={Calendar}
            color="info"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Today's Status"
            value={
              todayAttendance?.hasCheckedOut
                ? 'Checked Out'
                : todayAttendance?.hasCheckedIn
                ? 'Checked In'
                : 'Not Checked In'
            }
            subtitle={
              todayAttendance?.hasCheckedIn
                ? `At ${new Date(todayAttendance.data.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Pending check-in'
            }
            icon={Clock}
            color={todayAttendance?.hasCheckedIn ? 'success' : 'danger'}
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Real-time Attendance Station */}
        <div className="col-lg-5">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 text-dark">Attendance Clock Station</h5>
              <span className="badge-soft-primary small">Live</span>
            </div>

            <p className="text-secondary small mb-4">
              Record your daily work attendance. Standard shift starts at 09:00 AM.
            </p>

            <div className="p-3 bg-light rounded-3 text-center mb-4">
              <div className="text-muted small">Current Date</div>
              <div className="fw-bold fs-5 text-dark mb-2">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {todayAttendance?.hasCheckedIn ? (
                <div className="badge-soft-success d-inline-flex align-items-center gap-1 px-3 py-1 mb-2">
                  <CheckCircle size={14} /> Checked In at{' '}
                  {new Date(todayAttendance.data.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              ) : (
                <div className="badge-soft-warning d-inline-flex align-items-center gap-1 px-3 py-1 mb-2">
                  <AlertCircle size={14} /> Awaiting Check-In
                </div>
              )}

              {todayAttendance?.hasCheckedOut && (
                <div className="text-muted small mt-1">
                  Checked out at {new Date(todayAttendance.data.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({todayAttendance.data.workHours} hrs)
                </div>
              )}
            </div>

            <div className="d-grid gap-2">
              {!todayAttendance?.hasCheckedIn ? (
                <button
                  className="btn btn-primary-custom py-2"
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                >
                  <Play size={18} /> Clock-In Now
                </button>
              ) : !todayAttendance?.hasCheckedOut ? (
                <button
                  className="btn btn-danger py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                >
                  <Square size={18} /> Clock-Out & Save Hours
                </button>
              ) : (
                <button className="btn btn-outline-secondary py-2" disabled>
                  <CheckCircle size={18} /> Shift Completed for Today
                </button>
              )}

              <Link to="/attendance" className="btn btn-light btn-sm text-primary text-center mt-2 text-decoration-none">
                View Full Attendance Log →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Leave Requests & Quick Apply */}
        <div className="col-lg-7">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 text-dark">My Leave Applications</h5>
              <Link to="/leaves" className="btn btn-sm btn-outline-custom">
                Apply for Leave
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-modern">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leavesData.data?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No recent leave requests
                      </td>
                    </tr>
                  ) : (
                    leavesData.data.slice(0, 4).map((l) => (
                      <tr key={l._id}>
                        <td>
                          <span className="fw-semibold text-dark">{l.leaveType}</span>
                        </td>
                        <td className="small text-muted">
                          {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td>{l.totalDays} day(s)</td>
                        <td>
                          {l.status === 'Approved' ? (
                            <span className="badge-soft-success">Approved</span>
                          ) : l.status === 'Rejected' ? (
                            <span className="badge-soft-danger">Rejected</span>
                          ) : (
                            <span className="badge-soft-warning">Pending Review</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-auto pt-2 text-end">
              <Link to="/leaves" className="small text-primary text-decoration-none fw-semibold">
                View all leaves & balances →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements & Trainings Split */}
      <div className="row g-4">
        {/* Latest Announcements */}
        <div className="col-lg-6">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <Bell size={20} className="text-primary" />
                <h5 className="fw-bold mb-0 text-dark">Company Notices</h5>
              </div>
              <Link to="/announcements" className="small text-primary text-decoration-none fw-semibold">
                View All
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {announcements.length === 0 ? (
                <div className="text-muted small py-3 text-center">No active announcements</div>
              ) : (
                announcements.map((a) => (
                  <div key={a._id} className="p-3 rounded-3 bg-light border">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-dark small">{a.title}</span>
                      <span
                        className={`badge-soft-${
                          a.priority === 'Urgent' ? 'danger' : a.priority === 'High' ? 'warning' : 'info'
                        } small`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {a.priority}
                      </span>
                    </div>
                    <p className="text-secondary small mb-1" style={{ fontSize: '0.82rem' }}>
                      {a.content.length > 120 ? a.content.substring(0, 120) + '...' : a.content}
                    </p>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Posted by {a.authorName} • {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Development & Trainings */}
        <div className="col-lg-6">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <GraduationCap size={20} className="text-success" />
                <h5 className="fw-bold mb-0 text-dark">Professional Trainings</h5>
              </div>
              <Link to="/trainings" className="small text-primary text-decoration-none fw-semibold">
                Catalog
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {trainings.length === 0 ? (
                <div className="text-muted small py-3 text-center">No trainings scheduled</div>
              ) : (
                trainings.map((t) => {
                  const isEnrolled = t.participants?.some(
                    (p) => p.userId?._id === user?.id || p.userId === user?.id
                  );
                  return (
                    <div key={t._id} className="p-3 rounded-3 bg-light border">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold text-dark small">{t.title}</span>
                        {isEnrolled ? (
                          <span className="badge-soft-success small" style={{ fontSize: '0.7rem' }}>
                            Enrolled
                          </span>
                        ) : (
                          <span className="badge-soft-primary small" style={{ fontSize: '0.7rem' }}>
                            {t.status}
                          </span>
                        )}
                      </div>
                      <p className="text-secondary small mb-1" style={{ fontSize: '0.82rem' }}>
                        Trainer: {t.trainer} • {t.durationHours} Hours • Dept: {t.department}
                      </p>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Starts: {new Date(t.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
