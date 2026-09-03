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
  return {
    ...order,
    id: order.id || order.orderId || '',
    orderId: order.orderId || order.id || '',
    status: ORDER_STATUSES.includes(order.status) ? order.status : 'CREATED',
    paymentStatus: PAYMENT_STATUSES.includes(order.paymentStatus) ? order.paymentStatus : 'PENDING',
    totalAmount: Number(order.totalAmount ?? order.total ?? 0),
    items,
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

export const buildAddressPayload = (address = {}, fallbackText = '') => ({
  addressLine1: address.addressLine1 || address.street || address.manualLocation?.street || address.address || fallbackText || '',
  city: address.city || address.manualLocation?.city || '',
  state: address.state || address.manualLocation?.state || '',
  country: address.country || 'India',
  postalCode: address.postalCode || address.pincode || address.manualLocation?.pincode || '',
});
