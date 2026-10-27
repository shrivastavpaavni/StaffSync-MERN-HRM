import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { announcementService } from '../services/api';
import Modal from '../components/Modal';
import {
  Bell,
  PlusCircle,
  Pin,
  Trash2,
  Calendar,
  User,
  Filter,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

const AnnouncementsPage = () => {
  const { user, isHR, isManager } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 'Medium',
    targetAudience: 'All',
    isPinned: false,
  });

  const loadAnnouncements = async () => {
    try {
      const res = await announcementService.getAll();
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await announcementService.create(form);
      setShowModal(false);
      setForm({ title: '', content: '', priority: 'Medium', targetAudience: 'All', isPinned: false });
      await loadAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish announcement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementService.delete(id);
      await loadAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Notice Board...</span>
        </div>
      </div>
    );
  }

  const filtered = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || a.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Company Announcements & Notices</h3>
          <p className="text-secondary small mb-0">
            Official broadcasts, departmental memos, policy updates, and organization notices.
          </p>
        </div>

        {(isHR || isManager) && (
          <button
            className="btn btn-primary-custom btn-sm"
            onClick={() => setShowModal(true)}
          >
            <PlusCircle size={16} /> Post Announcement
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-custom p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control form-control-custom"
              placeholder="Search announcements by keywords or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select form-control-custom"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements Feed */}
      <div className="d-flex flex-column gap-3">
        {filtered.length === 0 ? (
          <div className="card-custom p-5 text-center text-muted">
            <Bell size={32} className="mb-2 text-secondary d-block mx-auto" />
            <h5>No announcements match your search</h5>
            <p className="small mb-0">Check back later or change your filter keywords.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item._id}
              className={`card-custom p-4 ${
                item.isPinned ? 'border-start border-4 border-primary bg-white' : ''
              }`}
            >
              <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {item.isPinned && (
                    <span className="badge-soft-primary d-inline-flex align-items-center gap-1 small">
                      <Pin size={12} /> Pinned
                    </span>
                  )}
                  <span
                    className={`badge-soft-${
                      item.priority === 'Urgent'
                        ? 'danger'
                        : item.priority === 'High'
                        ? 'warning'
                        : item.priority === 'Medium'
                        ? 'primary'
                        : 'secondary'
                    } small`}
                  >
                    {item.priority} Priority
                  </span>
                  <span className="badge bg-light text-muted border small">
                    Audience: {item.targetAudience}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {isHR && (
                    <button
                      className="btn btn-sm btn-light text-danger p-1 rounded"
                      title="Delete Announcement"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
              <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                {item.content}
              </p>

              <div className="d-flex align-items-center gap-2 pt-2 border-top">
                <div className="avatar-initials" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                  {item.authorName?.[0] || 'A'}
                </div>
                <span className="small text-muted">
                  Posted by <strong>{item.authorName}</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Announcement Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title="Broadcast Announcement">
        <form onSubmit={handleCreate}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Title</label>
            <input
              type="text"
              className="form-control form-control-custom"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Q4 Company All-Hands Meeting"
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Priority Level</label>
              <select
                className="form-select form-control-custom"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
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
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
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
            <label className="form-label small fw-semibold text-secondary">Content</label>
            <textarea
              className="form-control form-control-custom"
              rows="4"
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Announcement details..."
            ></textarea>
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="pinAnnouncementCheck"
              checked={form.isPinned}
              onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
            />
            <label className="form-check-label small text-secondary" htmlFor="pinAnnouncementCheck">
              Pin to top of feed
            </label>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(false)}>
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

export default AnnouncementsPage;
