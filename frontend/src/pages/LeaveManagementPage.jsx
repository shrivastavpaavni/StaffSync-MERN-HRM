import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveService } from '../services/api';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import {
  CalendarDays,
  PlusCircle,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  FileText,
} from 'lucide-react';

const LeaveManagementPage = () => {
  const { user, employee, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'review'
  const [myLeaves, setMyLeaves] = useState([]);
  const [balances, setBalances] = useState({});
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Apply Leave Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Review Modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Filter
  const [filterStatus, setFilterStatus] = useState('All');

  const loadData = async () => {
    try {
      const myRes = await leaveService.getMyLeaves();
      if (myRes.data.success) {
        setMyLeaves(myRes.data.data);
        setBalances(myRes.data.balances || {});
      }

      if (isHR || isManager) {
        const allRes = await leaveService.getAll({ status: filterStatus });
        if (allRes.data.success) setAllLeaves(allRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await leaveService.apply(applyForm);
      setShowApplyModal(false);
      setApplyForm({ leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
      await loadData();
      alert('Leave application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) return;
    try {
      await leaveService.cancel(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  const handleOpenReview = (leave, status) => {
    setSelectedLeave(leave);
    setReviewStatus(status);
    setReviewRemarks(status === 'Approved' ? 'Approved by Supervisor' : 'Rejected');
  };

  const handleConfirmReview = async () => {
    if (!selectedLeave) return;
    setActionLoading(true);
    try {
      await leaveService.review(selectedLeave._id, {
        status: reviewStatus,
        reviewRemarks,
      });
      setSelectedLeave(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review request');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate duration helper
  const calculateDays = () => {
    if (!applyForm.startDate || !applyForm.endDate) return 0;
    const start = new Date(applyForm.startDate);
    const end = new Date(applyForm.endDate);
    if (end < start) return 0;
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Leave Management...</span>
        </div>
      </div>
    );
  }

  const annualBal = balances.annual || { total: 15, used: 0 };
  const sickBal = balances.sick || { total: 10, used: 0 };
  const casualBal = balances.casual || { total: 8, used: 0 };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Leave Management System</h3>
          <p className="text-secondary small mb-0">
            Request time-off, track balance allocations, and oversee approvals across teams.
          </p>
        </div>

        <button
          className="btn btn-primary-custom btn-sm"
          onClick={() => setShowApplyModal(true)}
        >
          <PlusCircle size={16} /> Apply for Time-Off
        </button>
      </div>

      {/* Balance Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatCard
            title="Annual Vacation Leave"
            value={`${annualBal.total - annualBal.used} Days Available`}
            subtitle={`${annualBal.used} days taken of ${annualBal.total} allowance`}
            icon={CalendarDays}
            color="primary"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            title="Sick / Medical Leave"
            value={`${sickBal.total - sickBal.used} Days Available`}
            subtitle={`${sickBal.used} days taken of ${sickBal.total} allowance`}
            icon={CalendarDays}
            color="warning"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            title="Casual / Personal Leave"
            value={`${casualBal.total - casualBal.used} Days Available`}
            subtitle={`${casualBal.used} days taken of ${casualBal.total} allowance`}
            icon={CalendarDays}
            color="info"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-custom p-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between border-bottom pb-3 mb-3 gap-2">
          <ul className="nav nav-pills gap-2">
            <li className="nav-item">
              <button
                className={`btn btn-sm ${activeTab === 'my' ? 'btn-primary-custom' : 'btn-outline-custom'}`}
                onClick={() => setActiveTab('my')}
              >
                My Leave History ({myLeaves.length})
              </button>
            </li>
            {(isHR || isManager) && (
              <li className="nav-item">
                <button
                  className={`btn btn-sm ${activeTab === 'review' ? 'btn-primary-custom' : 'btn-outline-custom'}`}
                  onClick={() => setActiveTab('review')}
                >
                  Review Requests ({allLeaves.filter((l) => l.status === 'Pending').length} Pending)
                </button>
              </li>
            )}
          </ul>

          {activeTab === 'review' && (
            <select
              className="form-select form-select-sm form-control-custom w-auto"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Requests</option>
              <option value="Pending">Pending Only</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          )}
        </div>

        {/* Tab 1: My Leave Requests */}
        {activeTab === 'my' && (
          <div className="table-responsive">
            <table className="table table-modern">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Reviewer Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  myLeaves.map((l) => (
                    <tr key={l._id}>
                      <td>
                        <span className="fw-semibold text-dark">{l.leaveType}</span>
                      </td>
                      <td className="small text-muted">
                        {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="fw-bold">{l.totalDays} day(s)</td>
                      <td className="small text-secondary" style={{ maxWidth: '220px' }}>
                        {l.reason}
                      </td>
                      <td>
                        {l.status === 'Approved' ? (
                          <span className="badge-soft-success">Approved</span>
                        ) : l.status === 'Rejected' ? (
                          <span className="badge-soft-danger">Rejected</span>
                        ) : (
                          <span className="badge-soft-warning">Pending Review</span>
                        )}
                      </td>
                      <td className="small text-muted">
                        {l.reviewRemarks ? `"${l.reviewRemarks}"` : '-'}
                      </td>
                      <td>
                        {l.status === 'Pending' && (
                          <button
                            className="btn btn-sm btn-outline-danger p-1"
                            title="Cancel Request"
                            onClick={() => handleCancelLeave(l._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Review Requests for Managers & HR */}
        {activeTab === 'review' && (
          <div className="table-responsive">
            <table className="table table-modern">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No leave requests matching filter.
                    </td>
                  </tr>
                ) : (
                  allLeaves.map((l) => (
                    <tr key={l._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-initials" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                            {l.userId?.name?.[0] || 'E'}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark small">{l.userId?.name}</div>
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {l.employeeId?.employeeId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="small">{l.employeeId?.department}</td>
                      <td>
                        <span className="badge-soft-primary">{l.leaveType}</span>
                      </td>
                      <td className="small text-muted">
                        {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="fw-bold">{l.totalDays} day(s)</td>
                      <td className="small text-secondary" style={{ maxWidth: '200px' }}>
                        {l.reason}
                      </td>
                      <td>
                        {l.status === 'Approved' ? (
                          <span className="badge-soft-success">Approved</span>
                        ) : l.status === 'Rejected' ? (
                          <span className="badge-soft-danger">Rejected</span>
                        ) : (
                          <span className="badge-soft-warning">Pending</span>
                        )}
                      </td>
                      <td>
                        {l.status === 'Pending' ? (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-success p-1 px-2 d-flex align-items-center gap-1"
                              onClick={() => handleOpenReview(l, 'Approved')}
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger p-1 px-2 d-flex align-items-center gap-1"
                              onClick={() => handleOpenReview(l, 'Rejected')}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="small text-muted">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal
        show={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Apply for Leave / Time-Off"
      >
        <form onSubmit={handleApplyLeave}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Leave Category</label>
            <select
              className="form-select form-control-custom"
              value={applyForm.leaveType}
              onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
            >
              <option value="Annual">Annual Vacation ({annualBal.total - annualBal.used} days left)</option>
              <option value="Sick">Sick / Medical ({sickBal.total - sickBal.used} days left)</option>
              <option value="Casual">Casual / Personal ({casualBal.total - casualBal.used} days left)</option>
              <option value="Maternity/Paternity">Maternity / Paternity</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Start Date</label>
              <input
                type="date"
                className="form-control form-control-custom"
                required
                value={applyForm.startDate}
                onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">End Date</label>
              <input
                type="date"
                className="form-control form-control-custom"
                required
                value={applyForm.endDate}
                onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
              />
            </div>
          </div>

          {calculateDays() > 0 && (
            <div className="alert alert-info py-2 px-3 small rounded-3 mb-3">
              Total Requested Duration: <strong>{calculateDays()} day(s)</strong>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Reason for Absence</label>
            <textarea
              className="form-control form-control-custom"
              rows="3"
              required
              value={applyForm.reason}
              onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
              placeholder="Please provide details for supervisor review..."
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowApplyModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-custom btn-sm"
              disabled={actionLoading}
            >
              {actionLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Remarks Modal */}
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
                Reviewer Remarks / Feedback
              </label>
              <textarea
                className="form-control form-control-custom"
                rows="3"
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Remarks sent in notification to employee..."
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
                disabled={actionLoading}
              >
                {actionLoading ? 'Updating...' : `Confirm ${reviewStatus}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveManagementPage;
