const authToken = () => localStorage.getItem('authToken') || '';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export const apiRequest = async (baseUrl, path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.auth === false || !authToken() ? {} : { Authorization: `Bearer ${authToken()}` }),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) {
    const validation = payload?.fields ? Object.values(payload.fields).join(' ') : '';
    throw new ApiError(validation || payload?.message || payload?.error || `Request failed (${response.status}).`, response.status, payload);
  }
  return payload;
};
