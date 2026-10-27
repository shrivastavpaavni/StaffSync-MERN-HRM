import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { managerService, leaveService } from '../services/api';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import {
  Users,
  Clock,
  CalendarCheck,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  UserCheck,
  UserX,
  MessageSquare,
} from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadData = async () => {
    try {
      const [sumRes, teamRes, attRes] = await Promise.all([
        managerService.getDashboardSummary(),
        managerService.getTeamMembers(),
        managerService.getTeamAttendance(),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data);
      if (teamRes.data.success) setTeamMembers(teamRes.data.data);
      if (attRes.data.success) setTeamAttendance(attRes.data.data);
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReview = (leave, status) => {
    setSelectedLeave(leave);
    setReviewStatus(status);
    setReviewRemarks(status === 'Approved' ? 'Approved by Team Lead' : 'Denied due to high sprint workload');
  };

  const handleConfirmReview = async () => {
    if (!selectedLeave) return;
    setReviewLoading(true);
    try {
      await leaveService.review(selectedLeave._id, {
        status: reviewStatus,
        reviewRemarks,
      });
      setSelectedLeave(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Manager Dashboard...</span>
        </div>
      </div>
    );
  }

  const stats = summary?.summary || {
    totalTeamMembers: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeavesCount: 0,
    activeTrainingsCount: 0,
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="card-custom p-4 mb-4 border-start border-4 border-primary">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <span className="badge-soft-primary mb-2 d-inline-block">Manager Workspace</span>
            <h3 className="fw-bold text-dark mb-1">Team Operations & Leadership</h3>
            <p className="text-secondary small mb-0">
              Welcome back, <strong>{user?.name}</strong>. Oversee direct reports, approve leaves, and track daily shifts.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/attendance" className="btn btn-outline-custom btn-sm">
              All Attendance
            </Link>
            <Link to="/trainings" className="btn btn-primary-custom btn-sm">
              Schedule Training
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Team Size"
            value={stats.totalTeamMembers}
            subtitle="Direct reports assigned"
            icon={Users}
            color="primary"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            subtitle={`${stats.absentToday} not checked-in`}
            icon={UserCheck}
            color="success"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeavesCount}
            subtitle="Requires manager sign-off"
            icon={CalendarCheck}
            color={stats.pendingLeavesCount > 0 ? 'warning' : 'info'}
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Team Trainings"
            value={stats.activeTrainingsCount}
            subtitle="Active skill workshops"
            icon={GraduationCap}
            color="info"
          />
        </div>
      </div>

      {/* Pending Leave Requests Section */}
      <div className="card-custom p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-0 text-dark">Pending Leave Requests</h5>
            <p className="text-muted small mb-0">Review and authorize time-off applications from your team</p>
          </div>
          <span className="badge bg-warning text-dark fw-bold">
            {summary?.pendingLeaves?.length || 0} Awaiting Action
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!summary?.pendingLeaves || summary.pendingLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    <CheckCircle size={20} className="text-success mb-2 d-block mx-auto" />
                    All caught up! No pending leave requests.
                  </td>
                </tr>
              ) : (
                summary.pendingLeaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {l.userId?.avatar ? (
                          <img src={l.userId.avatar} alt="" className="avatar-img" style={{ width: '32px', height: '32px' }} />
                        ) : (
                          <div className="avatar-initials" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                            {l.userId?.name?.[0] || 'E'}
                          </div>
                        )}
                        <div>
                          <div className="fw-semibold text-dark">{l.userId?.name}</div>
                          <small className="text-muted">{l.employeeId?.position}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-soft-primary">{l.leaveType}</span>
                    </td>
                    <td className="small text-muted">
                      {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="fw-bold">{l.totalDays}</span> day(s)
                    </td>
                    <td className="small text-secondary" style={{ maxWidth: '200px' }}>
                      {l.reason}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-success d-flex align-items-center gap-1"
                          onClick={() => handleOpenReview(l, 'Approved')}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenReview(l, 'Rejected')}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Attendance Today */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0 text-dark">Today's Team Attendance</h5>
                <p className="text-muted small mb-0">Live check-in status for direct reports</p>
              </div>
              <span className="badge-soft-info small">{new Date().toLocaleDateString()}</span>
            </div>

            <div className="table-responsive">
              <table className="table table-modern">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {teamAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No team attendance records found
                      </td>
                    </tr>
                  ) : (
                    teamAttendance.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {item.employee?.userId?.avatar ? (
                              <img src={item.employee.userId.avatar} alt="" className="avatar-img" style={{ width: '32px', height: '32px' }} />
                            ) : (
                              <div className="avatar-initials" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                                {item.employee?.userId?.name?.[0] || 'U'}
                              </div>
                            )}
                            <div>
                              <div className="fw-semibold text-dark small">{item.employee?.userId?.name}</div>
                              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                {item.employee?.position}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {item.attendance?.status === 'Present' ? (
                            <span className="badge-soft-success">Present</span>
                          ) : item.attendance?.status === 'Late' ? (
                            <span className="badge-soft-warning">Late</span>
                          ) : item.attendance?.status === 'Half-day' ? (
                            <span className="badge-soft-info">Half-day</span>
                          ) : (
                            <span className="badge-soft-danger">Absent</span>
                          )}
                        </td>
                        <td className="small text-muted">
                          {item.attendance?.checkIn
                            ? new Date(item.attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </td>
                        <td className="small font-monospace">
                          {item.attendance?.workHours ? `${item.attendance.workHours} hrs` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="col-lg-5">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 text-dark">Direct Reports Directory</h5>
              <span className="badge bg-light text-muted border">{teamMembers.length} Members</span>
            </div>

            <div className="d-flex flex-column gap-3 overflow-y-auto" style={{ maxHeight: '360px' }}>
              {teamMembers.length === 0 ? (
                <div className="text-center text-muted py-4 small">No direct reports currently assigned.</div>
              ) : (
                teamMembers.map((m) => (
                  <div key={m._id} className="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      {m.userId?.avatar ? (
                        <img src={m.userId.avatar} alt="" className="avatar-img" />
                      ) : (
                        <div className="avatar-initials">{m.userId?.name?.[0] || 'E'}</div>
                      )}
                      <div>
                        <div className="fw-bold text-dark small">{m.userId?.name}</div>
                        <div className="text-muted small">{m.position}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {m.employeeId} • {m.userId?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        show={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        title={`${reviewStatus} Leave Request`}
      >
        {selectedLeave && (
          <div>
            <div className="p-3 bg-light rounded-3 mb-3">
              <div className="fw-bold text-dark">{selectedLeave.userId?.name}</div>
              <div className="text-muted small">
                {selectedLeave.leaveType} Leave • {selectedLeave.totalDays} day(s)
              </div>
              <div className="small text-muted mt-1">
                <strong>Reason:</strong> {selectedLeave.reason}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">
                Supervisor Remarks / Note
              </label>
              <textarea
                className="form-control form-control-custom"
                rows="3"
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Enter feedback or explanation..."
              ></textarea>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSelectedLeave(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-sm ${reviewStatus === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleConfirmReview}
                disabled={reviewLoading}
              >
                {reviewLoading ? 'Processing...' : `Confirm ${reviewStatus}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
