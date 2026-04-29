import fetch from 'node-fetch';

const BASE = process.env.VELXO_API_BASE;
let adminCookie = null;

// Authenticate and cache admin session cookie
async function getAdminCookie() {
  if (adminCookie) return adminCookie;
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.VELXO_ADMIN_EMAIL,
      password: process.env.VELXO_ADMIN_PASSWORD,
    }),
  });
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) throw new Error('Admin login failed');
  adminCookie = setCookie.split(';')[0];
  return adminCookie;
}

async function adminFetch(path, options = {}) {
  const cookie = await getAdminCookie();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    adminCookie = null; // reset and retry once
    return adminFetch(path, options);
  }
  return res.json();
}

async function publicFetch(path) {
  const res = await fetch(`${BASE}${path}`);
  return res.json();
}

// ── Public ──────────────────────────────────────────────
export const getProducts = () => publicFetch('/v1/products');
export const getProduct = (id) => publicFetch(`/v1/products/${id}`);
export const getDeals = () => publicFetch('/v1/deals');
export const getStats = () => publicFetch('/v1/stats');
export const trackOrder = (orderId, email) =>
  publicFetch(`/v1/track?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);

// ── Admin ────────────────────────────────────────────────
export const getOrder = (id) => adminFetch(`/admin/orders/${id}`);
export const updateOrder = (id, body) =>
  adminFetch(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const redeliverOrder = (id) =>
  adminFetch(`/admin/orders/${id}/redeliver`, { method: 'POST' });
export const getAnalytics = (period) =>
  adminFetch(`/admin/analytics${period ? `?period=${period}` : ''}`);
export const getPartners = () => adminFetch('/admin/partners');
export const getPayouts = () => adminFetch('/admin/partners/payouts');
export const updatePayout = (id, body) =>
  adminFetch(`/admin/partners/payouts/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const getStaff = () => adminFetch('/admin/staff');
export const getLowStock = () => adminFetch('/admin/products?lowStock=true');
export const getPendingStock = () => adminFetch('/admin/orders?status=PENDING_STOCK');
export const createDiscount = (body) =>
  adminFetch('/admin/discounts', { method: 'POST', body: JSON.stringify(body) });
export const saveSetting = (body) =>
  adminFetch('/admin/settings', { method: 'POST', body: JSON.stringify(body) });
export const sendDiscordPush = (body) =>
  adminFetch('/admin/discord-push', { method: 'POST', body: JSON.stringify(body) });
export const addBalance = (userId, amount) =>
  adminFetch('/admin/users/balance', { method: 'POST', body: JSON.stringify({ userId, amount }) });
export const banUser = (userId, reason) =>
  adminFetch('/admin/users/ban', { method: 'POST', body: JSON.stringify({ userId, reason }) });
