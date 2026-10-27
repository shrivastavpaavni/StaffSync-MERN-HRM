import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { trainingService } from '../services/api';
import Modal from '../components/Modal';
import {
  GraduationCap,
  PlusCircle,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle,
  Award,
  Trash2,
} from 'lucide-react';

const TrainingsPage = () => {
  const { user, isHR, isManager } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter
  const [filterDept, setFilterDept] = useState('All');

  // Create Training Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    trainer: '',
    department: 'All',
    startDate: '',
    endDate: '',
    durationHours: 10,
    maxParticipants: 30,
  });

  const loadTrainings = async () => {
    try {
      const res = await trainingService.getAll({ department: filterDept });
      if (res.data.success) {
        setTrainings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, [filterDept]);

  const handleEnroll = async (trainingId) => {
    setActionLoading(true);
    try {
      await trainingService.enroll(trainingId);
      await loadTrainings();
      alert('Enrolled in training program successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await trainingService.create(form);
      setShowModal(false);
      setForm({
        title: '',
        description: '',
        trainer: '',
        department: 'All',
        startDate: '',
        endDate: '',
        durationHours: 10,
        maxParticipants: 30,
      });
      await loadTrainings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create training');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training program?')) return;
    try {
      await trainingService.delete(id);
      await loadTrainings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Trainings...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Training & Development Programs</h3>
          <p className="text-secondary small mb-0">
            Professional skill advancement workshops, technical courses, and leadership certifications.
          </p>
        </div>

        {(isHR || isManager) && (
          <button className="btn btn-primary-custom btn-sm" onClick={() => setShowModal(true)}>
            <PlusCircle size={16} /> Create Training Program
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="card-custom p-3 mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="fw-semibold text-dark small">Filter by Department:</div>
          <select
            className="form-select form-select-sm form-control-custom w-auto"
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
        </div>
      </div>

      {/* Training Catalog Cards */}
      <div className="row g-4">
        {trainings.length === 0 ? (
          <div className="col-12">
            <div className="card-custom p-5 text-center text-muted">
              <GraduationCap size={36} className="mb-2 text-secondary d-block mx-auto" />
              <h5>No training programs scheduled</h5>
              <p className="small mb-0">Check back later or change department filter.</p>
            </div>
          </div>
        ) : (
          trainings.map((t) => {
            const isEnrolled = t.participants?.some(
              (p) => p.userId?._id === user?.id || p.userId === user?.id
            );
            const userParticipant = t.participants?.find(
              (p) => p.userId?._id === user?.id || p.userId === user?.id
            );
            const isFull = (t.participants?.length || 0) >= t.maxParticipants;

            return (
              <div key={t._id} className="col-lg-6">
                <div className="card-custom p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                      <span className="badge-soft-primary small">{t.department} Department</span>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`badge-soft-${
                            t.status === 'Completed'
                              ? 'secondary'
                              : t.status === 'Ongoing'
                              ? 'success'
                              : 'info'
                          } small`}
                        >
                          {t.status}
                        </span>
                        {(isHR || (isManager && t.createdBy?._id === user?.id)) && (
                          <button
                            className="btn btn-sm btn-light text-danger p-1"
                            title="Delete Program"
                            onClick={() => handleDelete(t._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{t.title}</h5>
                    <p className="text-secondary small mb-3">{t.description}</p>

                    <div className="row g-2 p-3 bg-light rounded-3 mb-3 small text-muted">
                      <div className="col-6 d-flex align-items-center gap-2">
                        <User size={14} className="text-primary" />
                        <span>
                          Trainer: <strong>{t.trainer}</strong>
                        </span>
                      </div>
                      <div className="col-6 d-flex align-items-center gap-2">
                        <Clock size={14} className="text-info" />
                        <span>
                          Duration: <strong>{t.durationHours} Hours</strong>
                        </span>
                      </div>
                      <div className="col-6 d-flex align-items-center gap-2">
                        <Calendar size={14} className="text-warning" />
                        <span>
                          Starts: {new Date(t.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="col-6 d-flex align-items-center gap-2">
                        <Users size={14} className="text-success" />
                        <span>
                          Participants:{' '}
                          <strong>
                            {t.participants?.length || 0} / {t.maxParticipants}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                    {isEnrolled ? (
                      <div className="d-flex align-items-center gap-2 text-success small fw-semibold">
                        <CheckCircle size={18} />
                        <span>
                          You are enrolled ({userParticipant?.status || 'Active'})
                        </span>
                      </div>
                    ) : isFull ? (
                      <span className="badge-soft-danger small">Course Full</span>
                    ) : (
                      <button
                        className="btn btn-primary-custom btn-sm"
                        onClick={() => handleEnroll(t._id)}
                        disabled={actionLoading}
                      >
                        Enroll in Workshop
                      </button>
                    )}

                    <span className="small text-muted">
                      Created by {t.createdBy?.name || 'StaffSync HR'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Training Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title="Schedule Training Program">
        <form onSubmit={handleCreate}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Program Title</label>
            <input
              type="text"
              className="form-control form-control-custom"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Advanced System Architecture"
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Lead Trainer</label>
              <input
                type="text"
                className="form-control form-control-custom"
                required
                value={form.trainer}
                onChange={(e) => setForm({ ...form, trainer: e.target.value })}
                placeholder="Dr. Gregory Vance"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Department</label>
              <select
                className="form-select form-control-custom"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Design">Design</option>
              </select>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Start Date</label>
              <input
                type="date"
                className="form-control form-control-custom"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">End Date</label>
              <input
                type="date"
                className="form-control form-control-custom"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Duration (Hours)</label>
              <input
                type="number"
                className="form-control form-control-custom"
                value={form.durationHours}
                onChange={(e) => setForm({ ...form, durationHours: Number(e.target.value) })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Max Capacity</label>
              <input
                type="number"
                className="form-control form-control-custom"
                value={form.maxParticipants}
                onChange={(e) => setForm({ ...form, maxParticipants: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Curriculum Description</label>
            <textarea
              className="form-control form-control-custom"
              rows="3"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Outline objectives, deliverables, and prerequisites..."
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-custom btn-sm" disabled={actionLoading}>
              {actionLoading ? 'Scheduling...' : 'Launch Training'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainingsPage;
