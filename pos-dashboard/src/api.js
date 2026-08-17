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
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

export const api = {
  // auth
  loginStaff: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  registerStaff: (payload) => request('/auth/register-staff', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  updateProfile: (payload, token) => request('/auth/me', { method: 'PUT', body: payload, token }),

  // menu
  getMenu: () => request('/menu'),
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
  placeWalkinOrder: (payload, token) => request('/orders/walkin', { method: 'POST', body: payload, token }),
  allOrders: (token, params) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request(`/orders${qs}`, { token });
  },
  updateOrderStatus: (id, status, token) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: { status }, token }),

  // reports
  getSalesSummary: (token) => request('/reports/summary', { token }),
  getAccountAnalytics: (token) => request('/reports/accounts', { token }),
};
