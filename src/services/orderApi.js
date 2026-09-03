import { apiRequest } from './apiClient';

export const ORDER_STATUSES = ['CREATED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const ORDER_BASE_URL = (import.meta.env.VITE_ORDER_URL || '/order').replace(/\/$/, '');

const request = (path, options = {}) => apiRequest(ORDER_BASE_URL, path, options);

export const isOrderServiceUnavailable = (error) => error?.name === 'TypeError' || Number(error?.status) >= 500;

export const createOrder = async (data) => request('/api/v1/orders', { method: 'POST', body: JSON.stringify(data) });

export const getOrder = async (orderId) => request(`/api/v1/orders/${encodeURIComponent(orderId)}`);

export const getCustomerOrders = async (customerId) => request(`/api/v1/orders/customer/${encodeURIComponent(customerId)}`);

export const updateOrderStatus = async (orderId, status) =>
  request(`/api/v1/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const cancelOrder = async (orderId) => request(`/api/v1/orders/${encodeURIComponent(orderId)}/cancel`, { method: 'POST' });

export const getOrderItems = async (orderId) => request(`/api/v1/orders/${encodeURIComponent(orderId)}/items`);

export const getCustomerOrderHistory = async (customerId) =>
  request(`/api/v1/orders/customer/${encodeURIComponent(customerId)}/history`);

export const normalizeOrderItem = (item = {}) => ({
  ...item,
  id: item.id || item.orderItemId || item.productId || item.productName || '',
  productId: item.productId || null,
  variantId: item.variantId ?? null,
  productName: item.productName || item.title || item.name || 'Product',
  title: item.productName || item.title || item.name || 'Product',
  quantity: Number(item.quantity ?? item.qty ?? 1),
  unitPrice: Number(item.unitPrice ?? item.price ?? 0),
  price: Number(item.unitPrice ?? item.price ?? 0),
  totalPrice: Number(item.totalPrice ?? item.lineTotal ?? Number(item.unitPrice ?? item.price ?? 0) * Number(item.quantity ?? item.qty ?? 1)),
  weight: item.weight || (item.variantId == null ? 'Product-level item' : String(item.variantId)),
});

export const normalizeOrder = (order = {}) => {
  const items = (Array.isArray(order.items) ? order.items : Array.isArray(order.orderItems) ? order.orderItems : []).map(normalizeOrderItem);
  const addresses = Array.isArray(order.addresses) ? order.addresses : [];
  const shippingAddress = order.shippingAddress || addresses.find((address) => address.addressType === 'SHIPPING') || addresses[0] || null;
  const billingAddress = order.billingAddress || addresses.find((address) => address.addressType === 'BILLING') || shippingAddress;
  return {
    ...order,
    id: order.id || order.orderId || '',
    orderId: order.orderId || order.id || '',
    status: ORDER_STATUSES.includes(order.status) ? order.status : 'CREATED',
    paymentStatus: PAYMENT_STATUSES.includes(order.paymentStatus) ? order.paymentStatus : 'PENDING',
    totalAmount: Number(order.totalAmount ?? order.total ?? 0),
    items,
    addresses,
    shippingAddress,
    billingAddress,
  };
};

export const buildOrderItemsPayload = (cartItems = []) =>
  cartItems.map((item) => ({
    productId: item.productId,
    variantId: item.variantId ?? null,
    productName: item.productName || item.title || 'Product',
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice ?? item.price ?? 0),
  }));

const parseAddressText = (text = '') => {
  const raw = String(text || '').trim();
  const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
  const postalMatch = raw.match(/\b\d{5,6}\b/);
  const state = parts.find((part) => part.toLowerCase().includes('telangana')) || '';
  const city = parts.find((part) => part.toLowerCase().includes('hyderabad')) || '';
  return {
    addressLine1: parts.slice(0, 4).join(', ') || raw || 'Customer address',
    city,
    state,
    country: parts.find((part) => part.toLowerCase() === 'india') || 'India',
    postalCode: postalMatch?.[0] || '',
  };
};

export const buildAddressPayload = (address = {}, fallbackText = '') => {
  const parsed = parseAddressText(address.address || fallbackText);
  return {
    addressLine1: address.addressLine1 || address.street || address.manualLocation?.street || parsed.addressLine1,
    addressLine2: address.addressLine2 || [address.houseNumber, address.floor, address.landmark].filter(Boolean).join(', ') || null,
    city: address.city || address.manualLocation?.city || parsed.city || 'Hyderabad',
    state: address.state || address.manualLocation?.state || parsed.state || 'Telangana',
    country: address.country || parsed.country || 'India',
    postalCode: address.postalCode || address.pincode || address.manualLocation?.pincode || parsed.postalCode || '500001',
  };
};

export const buildOrderAddressesPayload = (address = {}, fallbackText = '') => {
  const payload = buildAddressPayload(address, fallbackText);
  return [
    { ...payload, addressType: 'SHIPPING' },
    { ...payload, addressType: 'BILLING' },
  ];
};
