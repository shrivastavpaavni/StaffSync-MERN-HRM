import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res?.user?.role === 'hr') {
        navigate('/dashboard/hr');
      } else if (res?.user?.role === 'manager') {
        navigate('/dashboard/manager');
      } else {
        navigate('/dashboard/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card-custom bg-white p-4 p-md-5 w-100 shadow-lg" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <div
            className="rounded-3 p-2 d-inline-flex align-items-center justify-content-center text-white mb-2"
            style={{ background: 'var(--primary-gradient)', width: '48px', height: '48px' }}
          >
            <Briefcase size={24} />
          </div>
          <h3 className="fw-bold text-dark mb-1">Welcome back</h3>
          <p className="text-muted small">Sign in to your StaffSync HRM workspace</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3">
            <AlertCircle size={18} className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Work Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Mail size={18} className="text-muted" />
              </span>
              <input
                type="email"
                className="form-control form-control-custom border-start-0"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Lock size={18} className="text-muted" />
              </span>
              <input
                type="password"
                className="form-control form-control-custom border-start-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-custom w-100 py-2 mt-2"
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* 1-Click Demo Buttons */}
        <div className="mt-4 pt-3 border-top">
          <p className="text-muted small text-center mb-2 fw-semibold">Quick Demo Logins (Click to autofill):</p>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleFillCredentials('hr@staffsync.com')}
            >
              HR Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleFillCredentials('manager@staffsync.com')}
            >
              Manager
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-info"
              onClick={() => handleFillCredentials('employee@staffsync.com')}
            >
              Employee
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <span className="text-muted small">Don't have an account yet? </span>
          <Link to="/register" className="small fw-semibold text-primary text-decoration-none">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
