import { apiRequest } from './apiClient';

const INVENTORY_BASE_URL = (import.meta.env.VITE_INVENTORY_URL || '/inventory').replace(/\/$/, '');

const buildQueryString = (params = {}) => {
  const search = new URLSearchParams();
  ['productId', 'variantId', 'storeId', 'page', 'size', 'sort'].forEach((key) => {
    const value = params[key];
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

const request = (path, options = {}) => apiRequest(INVENTORY_BASE_URL, path, options);

export const createInventory = async (data) => request('/api/v1/inventories', { method: 'POST', body: JSON.stringify(data) });

export const updateInventory = async (inventoryId, data) => request(`/api/v1/inventories/${encodeURIComponent(inventoryId)}`, { method: 'PUT', body: JSON.stringify(data) });

export const getInventory = async (inventoryId) => request(`/api/v1/inventories/${encodeURIComponent(inventoryId)}`);

export const getInventories = async (params = {}) => {
  const { productId, variantId, storeId } = params;
  return request(`/api/v1/inventories${buildQueryString({ productId, variantId, storeId })}`);
};

const stockOperation = (inventoryId, operation, data) => request(`/api/v1/inventories/${encodeURIComponent(inventoryId)}/stock/${operation}`, { method: 'POST', body: JSON.stringify(data) });

export const increaseStock = async (inventoryId, data) => stockOperation(inventoryId, 'increase', data);

export const decreaseStock = async (inventoryId, data) => stockOperation(inventoryId, 'decrease', data);

export const reserveStock = async (inventoryId, data) => stockOperation(inventoryId, 'reserve', data);

export const releaseStock = async (inventoryId, data) => stockOperation(inventoryId, 'release', data);

export const getStockMovements = async (inventoryId, params = {}) => {
  const { page, size, sort } = params;
  return request(`/api/v1/inventories/${encodeURIComponent(inventoryId)}/movements${buildQueryString({ page, size, sort })}`);
};
