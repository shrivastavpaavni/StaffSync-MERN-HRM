import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staffsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or register failure
      const isAuthPath = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthPath) {
        localStorage.removeItem('staffsync_token');
        localStorage.removeItem('staffsync_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  updateOwnProfile: (data) => api.put('/employees/profile', data),
  create: (data) => api.post('/employees', data),
  updateByHR: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getManagersList: () => api.get('/employees/managers/list'),
};

export const managerService = {
  getTeamMembers: () => api.get('/manager/team'),
  getTeamAttendance: (date) => api.get('/manager/team-attendance', { params: { date } }),
  getTeamLeaves: () => api.get('/manager/team-leaves'),
  getDashboardSummary: () => api.get('/manager/dashboard-summary'),
};

export const attendanceService = {
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  getTodayStatus: () => api.get('/attendance/today'),
  getMyHistory: (params) => api.get('/attendance/my-history', { params }),
  getAll: (params) => api.get('/attendance/all', { params }),
  markManual: (data) => api.post('/attendance/manual', data),
};

export const leaveService = {
  apply: (data) => api.post('/leaves/apply', data),
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  getAll: (params) => api.get('/leaves/all', { params }),
  review: (id, data) => api.put(`/leaves/${id}/review`, data),
  cancel: (id) => api.delete(`/leaves/${id}`),
};

export const announcementService = {
  getAll: () => api.get('/announcements'),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const trainingService = {
  getAll: (params) => api.get('/trainings', { params }),
  getById: (id) => api.get(`/trainings/${id}`),
  create: (data) => api.post('/trainings', data),
  enroll: (id) => api.post(`/trainings/${id}/enroll`),
  updateParticipant: (id, userId, data) => api.put(`/trainings/${id}/participants/${userId}`, data),
  delete: (id) => api.delete(`/trainings/${id}`),
};

export const reportService = {
  getAnalytics: () => api.get('/reports/analytics'),
};

export const notificationService = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
