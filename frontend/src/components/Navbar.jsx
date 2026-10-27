import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import {
  Bell,
  LogOut,
  User as UserIcon,
  CheckCircle,
  Clock,
  Calendar,
  AlertTriangle,
  Info,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, employee, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000); // Polling every 20s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id, link) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
      if (link) {
        navigate(link);
        setShowNotifications(false);
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'hr':
        return <span className="badge-soft-danger">HR Admin</span>;
      case 'manager':
        return <span className="badge-soft-primary">Manager</span>;
      default:
        return <span className="badge-soft-info">Employee</span>;
    }
  };

  return (
    <nav className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <h5 className="mb-0 fw-bold text-dark d-none d-md-block">
          Staff<span className="text-primary">Sync</span>
        </h5>
        <span className="badge bg-light text-muted border d-none d-lg-inline-block">
          {employee?.department || 'Workspace'}
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="position-relative">
          <button
            className="btn btn-light position-relative p-2 rounded-circle border"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} className="text-secondary" />
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="position-absolute end-0 mt-2 card-custom bg-white shadow-lg p-0"
              style={{ width: '340px', zIndex: 1050, maxHeight: '420px', overflowY: 'auto' }}
            >
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
                <span className="fw-bold">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-sm btn-link text-decoration-none p-0 text-primary"
                    onClick={handleMarkAllRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="list-group list-group-flush">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <CheckCircle size={24} className="mb-2 text-success d-block mx-auto" />
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkAsRead(n._id, n.link)}
                      className={`list-group-item list-group-item-action p-3 border-bottom ${
                        !n.isRead ? 'bg-light' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-start gap-2">
                        <div className="mt-1">
                          {n.type === 'leave' ? (
                            <Calendar size={16} className="text-warning" />
                          ) : n.type === 'attendance' ? (
                            <Clock size={16} className="text-info" />
                          ) : (
                            <Info size={16} className="text-primary" />
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 fw-semibold small text-dark">{n.title}</p>
                          <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                            {n.message}
                          </p>
                          <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {new Date(n.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Avatar */}
        <div className="d-flex align-items-center gap-2 ps-2 border-start">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="avatar-img" />
          ) : (
            <div className="avatar-initials">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase() || 'U'}
            </div>
          )}
          <div className="d-none d-sm-block text-start">
            <div className="fw-semibold text-dark small mb-0">{user?.name}</div>
            <div>{getRoleBadge(user?.role)}</div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="btn btn-light btn-sm text-danger ms-2 p-2 rounded-circle"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
