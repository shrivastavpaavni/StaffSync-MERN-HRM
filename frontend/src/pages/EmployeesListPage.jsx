import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/api';
import Modal from '../components/Modal';
import {
  Users,
  Search,
  PlusCircle,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Building,
  CheckCircle,
} from 'lucide-react';

const EmployeesListPage = () => {
  const { user, isHR } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit / Add Modal
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Engineer',
    salary: 75000,
    phone: '',
    status: 'Active',
  });

  const loadEmployees = async () => {
    try {
      const res = await employeeService.getAll({
        page,
        limit: 10,
        search,
        department,
        status,
      });
      if (res.data.success) {
        setEmployees(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page, department, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadEmployees();
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setFormData({
      name: emp.userId?.name || '',
      email: emp.userId?.email || '',
      role: emp.userId?.role || 'employee',
      department: emp.department || 'Engineering',
      position: emp.position || '',
      salary: emp.salary || 65000,
      phone: emp.phone || '',
      status: emp.status || 'Active',
    });
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      role: 'employee',
      department: 'Engineering',
      position: 'Software Engineer',
      salary: 75000,
      phone: '',
      status: 'Active',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingEmp) {
        await employeeService.updateByHR(editingEmp._id, formData);
      } else {
        await employeeService.create(formData);
      }
      setShowModal(false);
      await loadEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this employee account?')) return;
    try {
      await employeeService.delete(id);
      await loadEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate employee');
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Workforce Directory...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Employee Directory</h3>
          <p className="text-secondary small mb-0">
            Total of {total} registered personnel across all corporate business units.
          </p>
        </div>

        {isHR && (
          <button className="btn btn-primary-custom btn-sm" onClick={handleOpenAdd}>
            <PlusCircle size={16} /> Onboard New Employee
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-custom p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control form-control-custom border-start-0"
                placeholder="Search by name, email, title, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-lg-3 col-sm-6">
            <select
              className="form-select form-control-custom"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Design">Design</option>
            </select>
          </div>

          <div className="col-lg-2 col-sm-6">
            <select
              className="form-select form-control-custom"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          <div className="col-lg-2">
            <button type="submit" className="btn btn-primary-custom w-100 btn-sm">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Employees Table */}
      <div className="card-custom p-4 mb-4">
        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Position</th>
                <th>Role</th>
                <th>Salary</th>
                <th>Status</th>
                {isHR && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={isHR ? 8 : 7} className="text-center text-muted py-4">
                    No employees found matching criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {emp.userId?.avatar ? (
                          <img
                            src={emp.userId.avatar}
                            alt=""
                            className="avatar-img"
                            style={{ width: '36px', height: '36px' }}
                          />
                        ) : (
                          <div
                            className="avatar-initials"
                            style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}
                          >
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
                      <span className="badge bg-light text-dark border font-monospace">
                        {emp.employeeId}
                      </span>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td>
                      <span
                        className={`badge-soft-${
                          emp.userId?.role === 'hr'
                            ? 'danger'
                            : emp.userId?.role === 'manager'
                            ? 'primary'
                            : 'info'
                        } small`}
                      >
                        {emp.userId?.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="small font-monospace">
                      ${emp.salary ? Number(emp.salary).toLocaleString() : '-'}
                    </td>
                    <td>
                      <span
                        className={`badge-soft-${
                          emp.status === 'Active'
                            ? 'success'
                            : emp.status === 'Terminated'
                            ? 'danger'
                            : 'warning'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    {isHR && (
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-light text-primary p-1"
                            title="Edit Employee"
                            onClick={() => handleOpenEdit(emp)}
                          >
                            <Edit size={16} />
                          </button>
                          {emp.status !== 'Terminated' && (
                            <button
                              className="btn btn-sm btn-light text-danger p-1"
                              title="Deactivate Account"
                              onClick={() => handleDelete(emp._id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex align-items-center justify-content-between pt-3 border-top">
            <span className="small text-muted">
              Page {page} of {totalPages}
            </span>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingEmp ? `Edit Employee - ${editingEmp.employeeId}` : 'Onboard New Employee'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Full Name</label>
              <input
                type="text"
                className="form-control form-control-custom"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Email Address</label>
              <input
                type="email"
                className="form-control form-control-custom"
                required
                disabled={!!editingEmp}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {!editingEmp && (
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Initial Password</label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Role</label>
              <select
                className="form-select form-control-custom"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Annual Salary (USD)</label>
              <input
                type="number"
                className="form-control form-control-custom"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Phone</label>
              <input
                type="text"
                className="form-control form-control-custom"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {editingEmp && (
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Status</label>
                <select
                  className="form-select form-control-custom"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-custom btn-sm"
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : editingEmp ? 'Update Employee' : 'Onboard Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesListPage;
