// const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Menu item images are stored as relative paths like "/uploads/xyz.jpg".
// Locally, Vite's dev proxy makes that resolve correctly. In production,
// the frontend and backend are on different domains, so we need to prefix
// with the backend's actual origin. Blob URLs (local file previews before
// upload) and already-absolute URLs are left untouched.
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');
export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('blob:') || path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}

async function request(path, { method = 'GET', body, token, isFormData = false } = {}) {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong');
    Object.assign(err, data); // keep extra fields like `unverified`, `email`
    throw err;
  }
  return data;
}

export const api = {
  // auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  verifyEmail: (payload) => request('/auth/verify-email', { method: 'POST', body: payload }),
  resendVerification: (payload) => request('/auth/resend-verification', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  forgotPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: payload }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  updateProfile: (payload, token) => request('/auth/me', { method: 'PUT', body: payload, token }),

  // menu
  getMenu: (categoryId) => request(`/menu${categoryId ? `?category_id=${categoryId}` : ''}`),
  createMenuItem: (payload, token) => request('/menu', { method: 'POST', body: payload, token }),
  updateMenuItem: (id, payload, token) => request(`/menu/${id}`, { method: 'PUT', body: payload, token }),
  deleteMenuItem: (id, token) => request(`/menu/${id}`, { method: 'DELETE', token }),
  uploadMenuImage: (file, token) => {
    const fd = new FormData();
    fd.append('image', file);
    return request('/upload/image', { method: 'POST', body: fd, token, isFormData: true });
  },

  // categories
  getCategories: () => request('/categories'),
  createCategory: (payload, token) => request('/categories', { method: 'POST', body: payload, token }),
  updateCategory: (id, payload, token) => request(`/categories/${id}`, { method: 'PUT', body: payload, token }),
  deleteCategory: (id, token) => request(`/categories/${id}`, { method: 'DELETE', token }),

  // orders
  placeOrder: (payload, token) => request('/orders', { method: 'POST', body: payload, token }),
  myOrders: (token) => request('/orders/mine', { token }),
  allOrders: (token, status) => request(`/orders${status ? `?status=${status}` : ''}`, { token }),
  updateOrderStatus: (id, status, token) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: { status }, token }),

  // reports
  getReportSummary: (token) => request('/reports/summary', { token }),
};
