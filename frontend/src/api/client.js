const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const normalizedBaseUrl = configuredBaseUrl.startsWith('http')
  ? configuredBaseUrl
  : `https://${configuredBaseUrl}`;
const BASE_URL = `${normalizedBaseUrl.replace(/\/$/, '')}/api`;

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('dayflow_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // If 401, token expired or invalid
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('dayflow_token');
        localStorage.removeItem('dayflow_user');
        window.location.href = '/login';
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const api = {
  // Generic HTTP
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),

  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  inviteEmployee: (userData) => api.post('/auth/invite', userData),
  acceptInvitation: (data) => api.post('/auth/accept-invitation', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),

  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats'),

  // Attendance
  checkIn: () => api.post('/attendance/check-in', {}),
  checkOut: () => api.post('/attendance/check-out', {}),
  getTodayAttendance: () => api.get('/attendance/today'),
  getMyAttendance: (params = '') => api.get(`/attendance/my${params ? `?${params}` : ''}`),
  getAllAttendance: (params = '') => api.get(`/attendance/all${params ? `?${params}` : ''}`),
  markManualAttendance: (data) => api.post('/attendance/manual', data),

  // Leaves
  applyLeave: (leaveData) => api.post('/leaves', leaveData),
  getMyLeaves: () => api.get('/leaves/my'),
  getAllLeaves: (params = '') => api.get(`/leaves/all${params ? `?${params}` : ''}`),
  updateLeaveStatus: (id, data) => api.put(`/leaves/${id}/status`, data),

  // Employees
  getAllEmployees: (params = '') => api.get(`/employees${params ? `?${params}` : ''}`),
  getEmployeeById: (id) => api.get(`/employees/${id}`),
  updateSelfProfile: (id, data) => api.put(`/employees/${id}/profile`, data),
  updateEmployeeByAdmin: (id, data) => api.put(`/employees/${id}/admin`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),

  // Payroll
  getMyPayroll: () => api.get('/payroll/my'),
  getAllPayroll: (params = '') => api.get(`/payroll/all${params ? `?${params}` : ''}`),
  updateSalaryStructure: (id, data) => api.put(`/payroll/${id}`, data),
};
