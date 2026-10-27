import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeService, authService } from '../services/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Lock,
  CheckCircle,
  AlertCircle,
  Shield,
  Heart,
  Tag,
} from 'lucide-react';

const Profile = () => {
  const { user, employee, refreshUser } = useAuth();

  const [personalForm, setPersonalForm] = useState({
    name: user?.name || '',
    phone: employee?.phone || '',
    bio: employee?.bio || '',
    skills: employee?.skills?.join(', ') || '',
    address: {
      street: employee?.address?.street || '',
      city: employee?.address?.city || '',
      state: employee?.address?.state || '',
      zipCode: employee?.address?.zipCode || '',
    },
    emergencyContact: {
      name: employee?.emergencyContact?.name || '',
      relationship: employee?.emergencyContact?.relationship || '',
      phone: employee?.emergencyContact?.phone || '',
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [personalMsg, setPersonalMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setSavingPersonal(true);
    setPersonalMsg({ type: '', text: '' });

    try {
      await employeeService.updateOwnProfile(personalForm);
      await refreshUser();
      setPersonalMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setPersonalMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setSavingPersonal(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'danger', text: 'New passwords do not match' });
      return;
    }

    setSavingPassword(true);
    try {
      await authService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update password',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const balances = employee?.leaveBalances || {
    annual: { total: 15, used: 0 },
    sick: { total: 10, used: 0 },
    casual: { total: 8, used: 0 },
  };

  return (
    <div>
      {/* Profile Header Card */}
      <div className="card-custom p-4 mb-4">
        <div className="d-flex flex-wrap align-items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="avatar-img shadow-sm"
              style={{ width: '84px', height: '84px', borderRadius: '50%' }}
            />
          ) : (
            <div
              className="avatar-initials shadow-sm"
              style={{ width: '84px', height: '84px', fontSize: '2rem' }}
            >
              {user?.name?.[0] || 'U'}
            </div>
          )}

          <div className="flex-grow-1">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h3 className="fw-bold text-dark mb-0">{user?.name}</h3>
              <span
                className={`badge-soft-${
                  user?.role === 'hr' ? 'danger' : user?.role === 'manager' ? 'primary' : 'info'
                }`}
              >
                {user?.role?.toUpperCase()}
              </span>
            </div>

            <p className="text-secondary small mb-2">
              {employee?.position || 'Associate'} • {employee?.department || 'StaffSync'} •{' '}
              <span className="font-monospace fw-bold">{employee?.employeeId || 'EMP-1000'}</span>
            </p>

            <div className="d-flex flex-wrap gap-3 small text-muted">
              <span className="d-flex align-items-center gap-1">
                <Mail size={14} className="text-primary" /> {user?.email}
              </span>
              {employee?.phone && (
                <span className="d-flex align-items-center gap-1">
                  <Phone size={14} className="text-success" /> {employee.phone}
                </span>
              )}
              <span className="d-flex align-items-center gap-1">
                <Calendar size={14} className="text-warning" /> Joined{' '}
                {new Date(employee?.joiningDate || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Personal Info & Emergency Contact Form */}
        <div className="col-lg-8">
          <div className="card-custom p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">Edit Personal Details</h5>

            {personalMsg.text && (
              <div
                className={`alert alert-${personalMsg.type} py-2 px-3 small d-flex align-items-center gap-2 rounded-3 mb-3`}
              >
                {personalMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{personalMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePersonalSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    value={personalForm.name}
                    onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">
                    Professional Bio
                  </label>
                  <textarea
                    className="form-control form-control-custom"
                    rows="2"
                    value={personalForm.bio}
                    onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                    placeholder="Short bio about your background, expertise, and interests..."
                  ></textarea>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">
                    Key Competencies / Skills (Comma-separated)
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    value={personalForm.skills}
                    onChange={(e) => setPersonalForm({ ...personalForm, skills: e.target.value })}
                    placeholder="e.g. React, Node.js, Project Management, Agile"
                  />
                </div>

                <div className="col-12 pt-3 border-top">
                  <h6 className="fw-bold text-dark mb-2">Residential Address</h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Street</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    value={personalForm.address.street}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        address: { ...personalForm.address, street: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">City</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    value={personalForm.address.city}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        address: { ...personalForm.address, city: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="col-12 pt-3 border-top">
                  <h6 className="fw-bold text-dark mb-2">Emergency Contact</h6>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Contact Name</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    value={personalForm.emergencyContact.name}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        emergencyContact: { ...personalForm.emergencyContact, name: e.target.value },
                      })
                    }
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Relationship</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    value={personalForm.emergencyContact.relationship}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        emergencyContact: {
                          ...personalForm.emergencyContact,
                          relationship: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Spouse / Sister"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Emergency Phone</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    value={personalForm.emergencyContact.phone}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        emergencyContact: { ...personalForm.emergencyContact, phone: e.target.value },
                      })
                    }
                    placeholder="+1 (555) 999-9999"
                  />
                </div>
              </div>

              <div className="text-end mt-4">
                <button
                  type="submit"
                  className="btn btn-primary-custom btn-sm"
                  disabled={savingPersonal}
                >
                  {savingPersonal ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="card-custom p-4">
            <h5 className="fw-bold text-dark mb-3">Security & Password</h5>

            {passwordMsg.text && (
              <div
                className={`alert alert-${passwordMsg.type} py-2 px-3 small d-flex align-items-center gap-2 rounded-3 mb-3`}
              >
                {passwordMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-custom"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">New Password</label>
                  <input
                    type="password"
                    className="form-control form-control-custom"
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-custom"
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="text-end mt-3">
                <button
                  type="submit"
                  className="btn btn-outline-custom btn-sm"
                  disabled={savingPassword}
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Corporate Metadata & Balances */}
        <div className="col-lg-4">
          {/* Corporate Metadata */}
          <div className="card-custom p-4 mb-4">
            <h6 className="fw-bold text-dark mb-3">Corporate Record</h6>

            <div className="d-flex flex-column gap-3 small">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted">Staff ID:</span>
                <span className="fw-bold text-dark font-monospace">{employee?.employeeId}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted">Department:</span>
                <span className="fw-semibold text-dark">{employee?.department}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted">Job Title:</span>
                <span className="fw-semibold text-dark">{employee?.position}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted">Assigned Manager:</span>
                <span className="fw-semibold text-dark">
                  {employee?.managerId?.name || 'Marcus Sterling'}
                </span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-muted">Account Status:</span>
                <span className="badge-soft-success">{employee?.status || 'Active'}</span>
              </div>
            </div>
          </div>

          {/* Current Leave Balances */}
          <div className="card-custom p-4">
            <h6 className="fw-bold text-dark mb-3">Leave Allocations</h6>

            <div className="d-flex flex-column gap-3">
              <div>
                <div className="d-flex justify-content-between small fw-semibold mb-1">
                  <span>Annual Vacation:</span>
                  <span className="text-primary">
                    {balances.annual.total - balances.annual.used} / {balances.annual.total} Days Left
                  </span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(balances.annual.used / balances.annual.total) * 100}%`,
                      background: 'var(--primary-gradient)',
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between small fw-semibold mb-1">
                  <span>Sick / Medical:</span>
                  <span className="text-warning">
                    {balances.sick.total - balances.sick.used} / {balances.sick.total} Days Left
                  </span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${(balances.sick.used / balances.sick.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between small fw-semibold mb-1">
                  <span>Casual / Personal:</span>
                  <span className="text-info">
                    {balances.casual.total - balances.casual.used} / {balances.casual.total} Days Left
                  </span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-info"
                    style={{
                      width: `${(balances.casual.used / balances.casual.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
