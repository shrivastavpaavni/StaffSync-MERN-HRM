import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceService, employeeService } from '../services/api';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Play,
  Square,
  Filter,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';

const AttendancePage = () => {
  const { user, isHR, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'all'
  const [todayStatus, setTodayStatus] = useState(null);
  const [myHistory, setMyHistory] = useState({ data: [], stats: {} });
  const [allAttendance, setAllAttendance] = useState({ data: [], total: 0 });
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters for Org attendance
  const [filterDate, setFilterDate] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Manual Attendance Modal (HR)
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'Present',
    notes: 'Manual entry by HR',
  });

  const loadData = async () => {
    try {
      const [todayRes, myRes] = await Promise.all([
        attendanceService.getTodayStatus(),
        attendanceService.getMyHistory({ page: 1, limit: 30 }),
      ]);

      if (todayRes.data.success) setTodayStatus(todayRes.data);
      if (myRes.data.success) setMyHistory(myRes.data);

      if (isHR || isManager) {
        const allRes = await attendanceService.getAll({
          date: filterDate,
          department: filterDept,
          status: filterStatus,
        });
        if (allRes.data.success) setAllAttendance(allRes.data);

        const empRes = await employeeService.getAll({ limit: 100 });
        if (empRes.data.success) setEmployeesList(empRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterDate, filterDept, filterStatus]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkIn({ notes: 'Standard online check-in' });
      await loadData();
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
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveManualAttendance = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await attendanceService.markManual(manualForm);
      setShowManualModal(false);
      await loadData();
      alert('Attendance recorded successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record manual attendance');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Attendance System...</span>
        </div>
      </div>
    );
  }

  const stats = myHistory.stats || {
    totalDays: 0,
    presentCount: 0,
    lateCount: 0,
    halfDayCount: 0,
    totalHours: 0,
    averageHours: 0,
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Time & Attendance Management</h3>
          <p className="text-secondary small mb-0">
            Real-time biometric shift tracking, historical work records, and supervisor auditing.
          </p>
        </div>

        {isHR && (
          <button
            className="btn btn-primary-custom btn-sm"
            onClick={() => setShowManualModal(true)}
          >
            <PlusCircle size={16} /> Record Manual Attendance
          </button>
        )}
      </div>

      {/* Check-In / Clock Section */}
      <div className="card-custom p-4 mb-4">
        <div className="row align-items-center">
          <div className="col-lg-6 mb-3 mb-lg-0">
            <span className="text-muted small fw-semibold text-uppercase">Today's Clock Station</span>
            <h4 className="fw-bold text-dark mt-1 mb-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h4>

            {todayStatus?.hasCheckedIn ? (
              <div className="d-flex align-items-center gap-3">
                <span className="badge-soft-success py-2 px-3">
                  <CheckCircle size={16} className="me-1 inline" /> Checked In:{' '}
                  {new Date(todayStatus.data.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {todayStatus.hasCheckedOut ? (
                  <span className="badge-soft-primary py-2 px-3">
                    Checked Out: {new Date(todayStatus.data.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({todayStatus.data.workHours} hrs)
                  </span>
                ) : (
                  <span className="badge-soft-warning py-2 px-3">Working (Active Shift)</span>
                )}
              </div>
            ) : (
              <span className="badge-soft-danger py-2 px-3">
                <AlertTriangle size={16} className="me-1 inline" /> Not Checked In Today
              </span>
            )}
          </div>

          <div className="col-lg-6 text-lg-end">
            {!todayStatus?.hasCheckedIn ? (
              <button
                className="btn btn-primary-custom px-4 py-2"
                onClick={handleCheckIn}
                disabled={actionLoading}
              >
                <Play size={18} /> Clock-In (Start Shift)
              </button>
            ) : !todayStatus?.hasCheckedOut ? (
              <button
                className="btn btn-danger px-4 py-2 rounded-3 fw-semibold"
                onClick={handleCheckOut}
                disabled={actionLoading}
              >
                <Square size={18} /> Clock-Out (End Shift)
              </button>
            ) : (
              <button className="btn btn-outline-secondary px-4 py-2" disabled>
                <CheckCircle size={18} /> Shift Completed Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats for User */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Total Days Tracked"
            value={stats.totalDays}
            subtitle="Registered shift logs"
            icon={Calendar}
            color="primary"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="On-Time Presences"
            value={stats.presentCount}
            subtitle="Before 09:30 AM"
            icon={CheckCircle}
            color="success"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Late Arrivals"
            value={stats.lateCount}
            subtitle="Arrived after 09:30 AM"
            icon={Clock}
            color="warning"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Avg Work Hours / Day"
            value={`${stats.averageHours} hrs`}
            subtitle={`Total: ${stats.totalHours} hrs`}
            icon={Clock}
            color="info"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="card-custom p-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between border-bottom pb-3 mb-3 gap-2">
          <ul className="nav nav-pills gap-2">
            <li className="nav-item">
              <button
                className={`btn btn-sm ${activeTab === 'my' ? 'btn-primary-custom' : 'btn-outline-custom'}`}
                onClick={() => setActiveTab('my')}
              >
                My Attendance History
              </button>
            </li>
            {(isHR || isManager) && (
              <li className="nav-item">
                <button
                  className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary-custom' : 'btn-outline-custom'}`}
                  onClick={() => setActiveTab('all')}
                >
                  Organization Attendance Records
                </button>
              </li>
            )}
          </ul>

          {activeTab === 'all' && (
            <div className="d-flex flex-wrap gap-2">
              <input
                type="date"
                className="form-control form-control-sm form-control-custom"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <select
                className="form-select form-select-sm form-control-custom"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Design">Design</option>
              </select>
              <select
                className="form-select form-select-sm form-control-custom"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half-day">Half-day</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: My Attendance Table */}
        {activeTab === 'my' && (
          <div className="table-responsive">
            <table className="table table-modern">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {myHistory.data?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No attendance logs found.
                    </td>
                  </tr>
                ) : (
                  myHistory.data.map((record) => (
                    <tr key={record._id}>
                      <td className="fw-semibold text-dark">{record.date}</td>
                      <td>
                        {record.checkIn
                          ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                      <td>
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                      <td className="font-monospace fw-semibold">{record.workHours ? `${record.workHours} hrs` : '-'}</td>
                      <td>
                        {record.status === 'Present' ? (
                          <span className="badge-soft-success">Present</span>
                        ) : record.status === 'Late' ? (
                          <span className="badge-soft-warning">Late</span>
                        ) : record.status === 'Half-day' ? (
                          <span className="badge-soft-info">Half-day</span>
                        ) : (
                          <span className="badge-soft-danger">Absent</span>
                        )}
                      </td>
                      <td className="small text-muted">{record.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Organization Attendance Table */}
        {activeTab === 'all' && (
          <div className="table-responsive">
            <table className="table table-modern">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allAttendance.data?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No records matched the filter criteria.
                    </td>
                  </tr>
                ) : (
                  allAttendance.data.map((record) => (
                    <tr key={record._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-initials" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                            {record.userId?.name?.[0] || 'E'}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark small">{record.userId?.name}</div>
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {record.employeeId?.employeeId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="small text-dark fw-semibold">{record.date}</td>
                      <td className="small">{record.employeeId?.department}</td>
                      <td className="small">
                        {record.checkIn
                          ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                      <td className="small">
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                      <td className="small font-monospace">{record.workHours ? `${record.workHours} hrs` : '-'}</td>
                      <td>
                        {record.status === 'Present' ? (
                          <span className="badge-soft-success">Present</span>
                        ) : record.status === 'Late' ? (
                          <span className="badge-soft-warning">Late</span>
                        ) : record.status === 'Half-day' ? (
                          <span className="badge-soft-info">Half-day</span>
                        ) : (
                          <span className="badge-soft-danger">Absent</span>
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

      {/* Manual Entry Modal (HR) */}
      <Modal
        show={showManualModal}
        onClose={() => setShowManualModal(false)}
        title="Record Manual Attendance"
      >
        <form onSubmit={handleSaveManualAttendance}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Select Employee</label>
            <select
              className="form-select form-control-custom"
              required
              value={manualForm.employeeId}
              onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
            >
              <option value="">-- Choose Employee --</option>
              {employeesList.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.userId?.name} ({emp.employeeId} - {emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Date</label>
              <input
                type="date"
                className="form-control form-control-custom"
                required
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Status</label>
              <select
                className="form-select form-control-custom"
                value={manualForm.status}
                onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half-day">Half-day</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Check-In Time</label>
              <input
                type="time"
                className="form-control form-control-custom"
                value={manualForm.checkIn ? manualForm.checkIn.substring(11, 16) : ''}
                onChange={(e) =>
                  setManualForm({
                    ...manualForm,
                    checkIn: `${manualForm.date}T${e.target.value}:00`,
                  })
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Check-Out Time</label>
              <input
                type="time"
                className="form-control form-control-custom"
                value={manualForm.checkOut ? manualForm.checkOut.substring(11, 16) : ''}
                onChange={(e) =>
                  setManualForm({
                    ...manualForm,
                    checkOut: `${manualForm.date}T${e.target.value}:00`,
                  })
                }
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Reason / Note</label>
            <input
              type="text"
              className="form-control form-control-custom"
              value={manualForm.notes}
              onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
              placeholder="e.g. Excused work-from-home or badge issue"
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowManualModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-custom btn-sm"
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : 'Save Attendance Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
