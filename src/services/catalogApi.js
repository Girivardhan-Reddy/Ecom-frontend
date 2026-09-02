import { apiRequest } from './apiClient';
const CATALOG_BASE_URL = (import.meta.env.VITE_CATALOG_URL || '/catalog').replace(/\/$/, '');

const buildQueryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

const request = (path, options = {}) => apiRequest(CATALOG_BASE_URL, path, options);

export const getCategories = async () => request('/api/v1/categories');
export const getCategory = async (categoryId) => request(`/api/v1/categories/${encodeURIComponent(categoryId)}`);
export const createCategory = async (data) => request('/api/v1/categories', { method:'POST', body:JSON.stringify(data) });
export const updateCategory = async (id, data) => request(`/api/v1/categories/${encodeURIComponent(id)}`, { method:'PUT', body:JSON.stringify(data) });
export const deleteCategory = async (id) => request(`/api/v1/categories/${encodeURIComponent(id)}`, { method:'DELETE' });
export const getCategoryProducts = async (categoryId, params = {}) => {
  if (!categoryId) return getProducts(params);
  return request(`/api/v1/categories/${encodeURIComponent(categoryId)}/products${buildQueryString(params)}`);
};

export const getProducts = async (params = {}) => request(`/api/v1/products${buildQueryString(params)}`);
export const searchProducts = async (params = {}) => getProducts(params);
export const getProduct = async (productId) => request(`/api/v1/products/${encodeURIComponent(productId)}`);
export const createProduct = async (data) => request('/api/v1/products', { method:'POST', body:JSON.stringify(data) });
export const updateProduct = async (id, data) => request(`/api/v1/products/${encodeURIComponent(id)}`, { method:'PUT', body:JSON.stringify(data) });
export const deleteProduct = async (id) => request(`/api/v1/products/${encodeURIComponent(id)}`, { method:'DELETE' });
export const getProductVariants = async (productId) => request(`/api/v1/products/${encodeURIComponent(productId)}/variants`);
export const getVariant = async (variantId) => request(`/api/v1/variants/${encodeURIComponent(variantId)}`);
export const createVariant = async (productId, data) => request(`/api/v1/products/${encodeURIComponent(productId)}/variants`, { method:'POST', body:JSON.stringify(data) });
export const updateVariant = async (id, data) => request(`/api/v1/variants/${encodeURIComponent(id)}`, { method:'PUT', body:JSON.stringify(data) });
export const deleteVariant = async (id) => request(`/api/v1/variants/${encodeURIComponent(id)}`, { method:'DELETE' });
export const getProductImages = async (productId) => request(`/api/v1/products/${encodeURIComponent(productId)}/images`);
export const getImage = async (imageId) => request(`/api/v1/images/${encodeURIComponent(imageId)}`);
export const createImage = async (productId, data) => request(`/api/v1/products/${encodeURIComponent(productId)}/images`, { method:'POST', body:JSON.stringify(data) });
export const updateImage = async (id, data) => request(`/api/v1/images/${encodeURIComponent(id)}`, { method:'PUT', body:JSON.stringify(data) });
export const deleteImage = async (id) => request(`/api/v1/images/${encodeURIComponent(id)}`, { method:'DELETE' });
export const getStoreProducts = async (storeId, params = {}) => {
  const query = new URLSearchParams();
  if (storeId) query.set('storeId', String(storeId));
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  return request(`/api/v1/store-products${query.toString() ? `?${query.toString()}` : ''}`);
};
export const createStoreProduct = async (data) => request('/api/v1/store-products', { method:'POST', body:JSON.stringify(data) });
export const updateStoreProduct = async (id, data) => request(`/api/v1/store-products/${encodeURIComponent(id)}`, { method:'PUT', body:JSON.stringify(data) });
export const deleteStoreProduct = async (id) => request(`/api/v1/store-products/${encodeURIComponent(id)}`, { method:'DELETE' });
