const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
  const config = {
    method: options.method || 'GET',
    credentials: 'include',
    headers: { ...(options.headers || {}) },
  };

  if (options.body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${path}`, config);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

export const api = {
  me: () => request('/api/me/'),
  login: (body) => request('/api/login/', { method: 'POST', body }),
  register: (body) => request('/api/register/', { method: 'POST', body }),
  logout: () => request('/api/logout/', { method: 'POST' }),
  cars: ({ dealerId, make } = {}) => {
    const params = new URLSearchParams();
    if (dealerId) {
      params.set('dealer_id', dealerId);
    }
    if (make) {
      params.set('make', make);
    }
    const query = params.toString();
    return request(`/api/cars/${query ? `?${query}` : ''}`);
  },
  dealers: (state) => request(`/api/dealers/${state ? `?state=${encodeURIComponent(state)}` : ''}`),
  dealer: (dealerId) => request(`/api/dealers/${dealerId}/`),
  reviewsByDealer: (dealerId) => request(`/api/dealers/${dealerId}/reviews/`),
  createReview: (body) => request('/api/reviews/', { method: 'POST', body }),
};
