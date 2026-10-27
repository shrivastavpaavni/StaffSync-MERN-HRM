import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Lock, Mail, User, Phone, Building, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    position: 'Associate Software Engineer',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await register(formData);
      if (res?.user?.role === 'hr') {
        navigate('/dashboard/hr');
      } else if (res?.user?.role === 'manager') {
        navigate('/dashboard/manager');
      } else {
        navigate('/dashboard/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card-custom bg-white p-4 p-md-5 w-100 shadow-lg" style={{ maxWidth: '540px' }}>
        <div className="text-center mb-4">
          <div
            className="rounded-3 p-2 d-inline-flex align-items-center justify-content-center text-white mb-2"
            style={{ background: 'var(--primary-gradient)', width: '48px', height: '48px' }}
          >
            <Briefcase size={24} />
          </div>
          <h3 className="fw-bold text-dark mb-1">Create StaffSync Account</h3>
          <p className="text-muted small">Join your organization's digital workplace</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3">
            <AlertCircle size={18} className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <User size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control form-control-custom border-start-0"
                  placeholder="e.g. Jordan Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary">Work Email</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Mail size={18} className="text-muted" />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-custom border-start-0"
                  placeholder="jordan.smith@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Role</label>
              <select
                name="role"
                className="form-select form-control-custom"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Administrator</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Department</label>
              <select
                name="department"
                className="form-select form-control-custom"
                value={formData.department}
                onChange={handleChange}
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
                name="position"
                className="form-control form-control-custom"
                placeholder="e.g. Software Engineer"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Phone Number</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Phone size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  name="phone"
                  className="form-control form-control-custom border-start-0"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Lock size={18} className="text-muted" />
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control form-control-custom border-start-0"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-custom w-100 py-2 mt-4"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Complete Registration'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted small">Already have an account? </span>
          <Link to="/login" className="small fw-semibold text-primary text-decoration-none">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
