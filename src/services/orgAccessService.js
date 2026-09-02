import { apiRequest } from './apiClient';
const ORG_ACCESS_BASE_URL = (import.meta.env.VITE_ORG_ACCESS_URL || '/org-access').replace(/\/$/, '');

const normalizeRole = (role) => {
  if (!role) return null;
  const value = String(role).trim();
  const withoutPrefix = value.startsWith('ROLE_') ? value.slice('ROLE_'.length) : value;
  const normalized = withoutPrefix.toLowerCase().replace(/_/g, '-');
  const map = {
    'super-admin': 'super-admin',
    'global-admin': 'global-admin',
    'location-admin': 'location-admin',
    'store-manager': 'store-manager',
    'delivery-partner': 'delivery-partner',
    'customer': 'customer',
  };
  return map[normalized] || normalized;
};

const buildUser = (username, roles) => {
  const allowedRoles = ['super-admin', 'global-admin', 'location-admin', 'store-manager', 'delivery-partner', 'customer'];
  const primaryRole = (Array.isArray(roles) ? roles : [])
    .map(normalizeRole)
    .find((role) => allowedRoles.includes(role)) || allowedRoles[0];

  return {
    id: username,
    username,
    name: username,
    email: username.includes('@') ? username : `${username}@metaarch.local`,
    role: primaryRole,
  };
};

export const orgAccessService = {
  async login(username, password) {
    const payload = await apiRequest(ORG_ACCESS_BASE_URL, '/api/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ username: String(username).trim(), password: String(password) }),
    });

    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    const user = buildUser(payload.username || String(username).trim(), roles);

    return {
      user,
      token: payload.token || '',
      expiresInMillis: payload.expiresInMillis || 0,
      roles,
    };
  },
  async registerCustomer(customer) {
    return apiRequest(ORG_ACCESS_BASE_URL, '/api/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({
        username: String(customer.username).trim(),
        email: String(customer.email).trim(),
        password: String(customer.password),
        name: String(customer.name).trim(),
        phone: String(customer.phone).trim(),
      }),
    });
  },
  async me() { return apiRequest(ORG_ACCESS_BASE_URL, '/api/auth/me'); },
  async validate() { return apiRequest(ORG_ACCESS_BASE_URL, '/api/auth/validate'); },
  async createUser(user) {
    return apiRequest(ORG_ACCESS_BASE_URL, '/api/users', {
      method: 'POST',
      body: JSON.stringify({ username:user.username || user.email, email:user.email, password:user.password, role:String(user.role || '').toUpperCase().replace(/-/g, '_') }),
    });
  },
};
