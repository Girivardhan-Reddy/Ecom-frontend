const CATALOG_BASE_URL = (import.meta.env.VITE_CATALOG_URL || '/api').replace(/\/$/, '');

const buildQueryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

const request = async (path, options = {}) => {
  const response = await fetch(`${CATALOG_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const payload = await response.text();
  const parsed = payload ? JSON.parse(payload) : null;

  if (!response.ok) {
    const errorMessage = parsed?.message || parsed?.error || parsed?.detail || `Catalog request failed (${response.status}).`;
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  if (parsed && typeof parsed === 'object' && 'data' in parsed && !Array.isArray(parsed.data) && parsed.data !== null && Object.keys(parsed).length === 3 && 'success' in parsed && 'message' in parsed) {
    return parsed.data ?? null;
  }
  if (parsed && typeof parsed === 'object' && 'data' in parsed && 'page' in parsed) {
    return parsed.data ?? parsed;
  }
  return parsed ?? null;
};

export const getCategories = async () => request('/api/v1/categories');
export const getCategory = async (categoryId) => request(`/api/v1/categories/${encodeURIComponent(categoryId)}`);
export const getCategoryProducts = async (categoryId, params = {}) => {
  if (!categoryId) return getProducts(params);
  return request(`/api/v1/categories/${encodeURIComponent(categoryId)}/products${buildQueryString(params)}`);
};

export const getProducts = async (params = {}) => request(`/api/v1/products${buildQueryString(params)}`);
export const searchProducts = async (params = {}) => getProducts(params);
export const getProduct = async (productId) => request(`/api/v1/products/${encodeURIComponent(productId)}`);
export const getProductVariants = async (productId) => request(`/api/v1/products/${encodeURIComponent(productId)}/variants`);
export const getVariant = async (variantId) => request(`/api/v1/variants/${encodeURIComponent(variantId)}`);
export const getProductImages = async (productId) => request(`/api/v1/products/${encodeURIComponent(productId)}/images`);
export const getImage = async (imageId) => request(`/api/v1/images/${encodeURIComponent(imageId)}`);
export const getStoreProducts = async (storeId, params = {}) => {
  const query = new URLSearchParams();
  if (storeId) query.set('storeId', String(storeId));
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  return request(`/api/v1/store-products${query.toString() ? `?${query.toString()}` : ''}`);
};
