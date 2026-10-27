import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportService, employeeService, announcementService, leaveService } from '../services/api';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import {
  Users,
  UserCheck,
  CalendarCheck,
  ShieldCheck,
  PlusCircle,
  Megaphone,
  BarChart3,
  TrendingUp,
  Building,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const HRDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Add Employee Form State
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Engineer',
    salary: 75000,
    phone: '',
  });

  // Post Announcement Form State
  const [newAnnounce, setNewAnnounce] = useState({
    title: '',
    content: '',
    priority: 'Medium',
    targetAudience: 'All',
    isPinned: false,
  });

  const loadData = async () => {
    try {
      const [anRes, empRes] = await Promise.all([
        reportService.getAnalytics(),
        employeeService.getAll({ page: 1, limit: 5 }),
      ]);

      if (anRes.data.success) setAnalytics(anRes.data.data);
      if (empRes.data.success) setRecentEmployees(empRes.data.data);
    } catch (err) {
      console.error('Failed to load HR dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await employeeService.create(newEmp);
      setShowAddModal(false);
      setNewEmp({
        name: '',
        email: '',
        password: 'password123',
        role: 'employee',
        department: 'Engineering',
        position: 'Software Engineer',
        salary: 75000,
        phone: '',
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to onboard employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await announcementService.create(newAnnounce);
      setShowAnnounceModal(false);
      setNewAnnounce({
        title: '',
        content: '',
        priority: 'Medium',
        targetAudience: 'All',
        isPinned: false,
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading HR Hub...</span>
        </div>
      </div>
    );
  }

  const workforce = analytics?.workforce || { totalUsers: 0, totalEmployees: 0, totalManagers: 0, departmentDistribution: [] };
  const att = analytics?.attendance || { present: 0, late: 0, absent: 0, attendanceRate: 100 };
  const leaves = analytics?.leaves || { pending: 0, approved: 0, rejected: 0 };

  return (
    <div>
      {/* Banner */}
      <div className="card-gradient-primary p-4 mb-4 shadow-sm">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <span className="badge bg-white text-danger mb-2 fw-semibold">HR Executive Portal</span>
            <h2 className="fw-bold mb-1">Human Resource Headquarters</h2>
            <p className="mb-0 text-white-50 small">
              Enterprise management by <strong>{user?.name}</strong> • Headcount, compliance, and department operations.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light btn-sm fw-semibold" onClick={() => setShowAnnounceModal(true)}>
              <Megaphone size={16} /> Broadcast Notice
            </button>
            <button className="btn btn-warning btn-sm fw-semibold text-dark" onClick={() => setShowAddModal(true)}>
              <PlusCircle size={16} /> Onboard Employee
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Total Workforce"
            value={workforce.totalEmployees}
            subtitle={`${workforce.totalManagers} Team Leads & Managers`}
            icon={Users}
            color="primary"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Today's Attendance"
            value={`${att.attendanceRate}%`}
            subtitle={`${att.present} Present • ${att.late} Late • ${att.absent} Absent`}
            icon={UserCheck}
            color="success"
            trend="+2.4%"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Pending Leaves"
            value={leaves.pending}
            subtitle={`${leaves.approved} approved this period`}
            icon={CalendarCheck}
            color={leaves.pending > 0 ? 'warning' : 'info'}
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Active Departments"
            value={workforce.departmentDistribution?.length || 0}
            subtitle="Cross-functional units"
            icon={Building}
            color="info"
          />
        </div>
      </div>

      {/* Department Breakdown & Attendance Trend */}
      <div className="row g-4 mb-4">
        {/* Department Distribution */}
        <div className="col-lg-6">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 text-dark">Department Distribution</h5>
              <Link to="/analytics" className="small text-primary text-decoration-none fw-semibold">
                Detailed Analytics →
              </Link>
            </div>

            <p className="text-secondary small mb-4">Staff headcount and average compensation per department.</p>

            <div className="d-flex flex-column gap-3">
              {workforce.departmentDistribution.map((dept) => {
                const percentage = Math.round((dept.count / workforce.totalEmployees) * 100) || 0;
                return (
                  <div key={dept._id}>
                    <div className="d-flex justify-content-between small fw-semibold mb-1">
                      <span className="text-dark">{dept._id}</span>
                      <span className="text-muted">
                        {dept.count} Staff ({percentage}%) • Avg: ${Math.round(dept.avgSalary).toLocaleString()}
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: 'var(--primary)',
                          borderRadius: '4px',
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 7-Day Attendance Trend */}
        <div className="col-lg-6">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 text-dark">7-Day Attendance Health</h5>
              <span className="badge-soft-success small">Target: ≥ 90%</span>
            </div>

            <p className="text-secondary small mb-3">Historical organization presence rates over the past 7 days.</p>

            <div className="d-flex align-items-end justify-content-between gap-2 pt-4" style={{ height: '180px' }}>
              {att.weeklyTrend?.map((item, idx) => (
                <div key={idx} className="d-flex flex-column align-items-center flex-grow-1 h-100 justify-content-end">
                  <span className="small fw-bold text-dark mb-1" style={{ fontSize: '0.75rem' }}>
                    {item.rate}%
                  </span>
                  <div
                    className="w-100 rounded-top"
                    style={{
                      height: `${Math.max(15, item.rate)}%`,
                      background: item.rate >= 85 ? 'var(--primary-gradient)' : 'var(--warning)',
                    }}
                  ></div>
                  <span className="text-muted small mt-2" style={{ fontSize: '0.7rem' }}>
                    {item.dayName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Onboarded Employees Table */}
      <div className="card-custom p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-0 text-dark">Staff Directory Preview</h5>
            <p className="text-muted small mb-0">Recently added employees and status</p>
          </div>
          <Link to="/employees" className="btn btn-sm btn-outline-custom">
            View All Employees ({workforce.totalEmployees})
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Position</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {emp.userId?.avatar ? (
                        <img src={emp.userId.avatar} alt="" className="avatar-img" style={{ width: '32px', height: '32px' }} />
                      ) : (
                        <div className="avatar-initials" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                          {emp.userId?.name?.[0] || 'E'}
                        </div>
                      )}
                      <div>
                        <div className="fw-semibold text-dark">{emp.userId?.name}</div>
                        <small className="text-muted">{emp.userId?.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border font-monospace">{emp.employeeId}</span>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.position}</td>
                  <td>
                    <span className={`badge-soft-${emp.status === 'Active' ? 'success' : 'warning'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="small text-muted">{new Date(emp.joiningDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Employee Modal */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="Onboard New Employee" size="lg">
        <form onSubmit={handleCreateEmployee}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Full Name</label>
              <input
                type="text"
                className="form-control form-control-custom"
                required
                value={newEmp.name}
                onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Work Email</label>
              <input
                type="email"
                className="form-control form-control-custom"
                required
                value={newEmp.email}
                onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                placeholder="jane.doe@staffsync.com"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">System Role</label>
              <select
                className="form-select form-control-custom"
                value={newEmp.role}
                onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Administrator</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Department</label>
              <select
                className="form-select form-control-custom"
                value={newEmp.department}
                onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Design">Design</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Job Title</label>
              <input
                type="text"
                className="form-control form-control-custom"
                required
                value={newEmp.position}
                onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                placeholder="e.g. Frontend Engineer"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Annual Salary (USD)</label>
              <input
                type="number"
                className="form-control form-control-custom"
                value={newEmp.salary}
                onChange={(e) => setNewEmp({ ...newEmp, salary: Number(e.target.value) })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Phone</label>
              <input
                type="text"
                className="form-control form-control-custom"
                value={newEmp.phone}
                onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Initial Password</label>
              <input
                type="text"
                className="form-control form-control-custom"
                value={newEmp.password}
                onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-custom btn-sm" disabled={actionLoading}>
              {actionLoading ? 'Onboarding...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Broadcast Announcement Modal */}
      <Modal
        show={showAnnounceModal}
        onClose={() => setShowAnnounceModal(false)}
        title="Broadcast Organization Announcement"
      >
        <form onSubmit={handleCreateAnnouncement}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Title</label>
            <input
              type="text"
              className="form-control form-control-custom"
              required
              value={newAnnounce.title}
              onChange={(e) => setNewAnnounce({ ...newAnnounce, title: e.target.value })}
              placeholder="e.g. Office Relocation Update"
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Priority</label>
              <select
                className="form-select form-control-custom"
                value={newAnnounce.priority}
                onChange={(e) => setNewAnnounce({ ...newAnnounce, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Target Audience</label>
              <select
                className="form-select form-control-custom"
                value={newAnnounce.targetAudience}
                onChange={(e) => setNewAnnounce({ ...newAnnounce, targetAudience: e.target.value })}
              >
                <option value="All">All Organization</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Managers">Managers Only</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Announcement Content</label>
            <textarea
              className="form-control form-control-custom"
              rows="4"
              required
              value={newAnnounce.content}
              onChange={(e) => setNewAnnounce({ ...newAnnounce, content: e.target.value })}
              placeholder="Details of the announcement..."
            ></textarea>
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="pinAnnouncement"
              checked={newAnnounce.isPinned}
              onChange={(e) => setNewAnnounce({ ...newAnnounce, isPinned: e.target.checked })}
            />
            <label className="form-check-label small text-secondary" htmlFor="pinAnnouncement">
              Pin to top of bulletin board
            </label>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAnnounceModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-custom btn-sm" disabled={actionLoading}>
              {actionLoading ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HRDashboard;
