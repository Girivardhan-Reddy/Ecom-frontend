const ORG_ACCESS_BASE_URL = (import.meta.env.VITE_ORG_ACCESS_URL || 'http://localhost:30082/org-access').replace(/\/$/, '');

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
    const response = await fetch(`${ORG_ACCESS_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: String(username).trim(), password: String(password) }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || 'Invalid org-access credentials.');
    }

    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    const user = buildUser(payload.username || String(username).trim(), roles);

    return {
      user,
      token: payload.token || '',
      expiresInMillis: payload.expiresInMillis || 0,
      roles,
    };
  },
};
