const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
};

const normaliseStatus = (value) => {
  if (!value) return 'ACTIVE';
  const text = String(value).toUpperCase();
  if (['ACTIVE', 'PUBLISHED', 'AVAILABLE'].includes(text)) return 'ACTIVE';
  if (['INACTIVE', 'DRAFT', 'DISABLED'].includes(text)) return 'INACTIVE';
  return text;
};

const pickPrice = (value) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

const firstImageUrl = (images = []) => {
  const primary = images.find((item) => item.primaryImage || item.isPrimary) || images[0];
  return primary?.url || primary?.imageUrl || primary?.path || '';
};

const extractWeight = (variant, fallback) => {
  const candidate = variant?.attributes || variant || {};
  const weight = candidate.weight || candidate.size || candidate.label || candidate.name || candidate.variantName || fallback || '500g';
  return String(weight).trim() || '500g';
};

export const adaptCategory = (category) => ({
  id: category.id || category.categoryId || category.slug || category.name,
  name: category.name || category.title || 'Category',
  title: category.title || category.name || 'Category',
  image: category.image || category.imageUrl || category.thumbnail || '',
  description: category.description || '',
  status: normaliseStatus(category.status),
  active: normaliseStatus(category.status) !== 'INACTIVE',
  sortOrder: Number(category.sortOrder ?? category.displayOrder ?? 0),
  slug: category.slug || category.name,
  parentCategoryId: category.parentCategoryId || category.parentId || null,
});

export const adaptVariant = (variant, fallbackProduct = {}) => {
  const attributes = variant?.attributes || {};
  const price = pickPrice(variant?.price ?? variant?.sellingPrice ?? variant?.mrp ?? 0);
  const compareAt = pickPrice(variant?.compareAtPrice ?? variant?.mrp ?? variant?.price ?? 0);
  const id = variant?.variantId || variant?.id || variant?.sku || `${fallbackProduct.id || fallbackProduct.productId || 'variant'}-default`;
  return {
    id,
    variantId: id,
    productId: variant?.productId || fallbackProduct.productId || fallbackProduct.id || null,
    sku: variant?.sku || fallbackProduct.sku || '',
    name: variant?.name || extractWeight(variant, fallbackProduct.weight || '500g'),
    label: variant?.name || extractWeight(variant, fallbackProduct.weight || '500g'),
    price,
    compareAtPrice: compareAt > price ? compareAt : price,
    attributes,
    active: variant?.active ?? true,
    weight: extractWeight(variant, fallbackProduct.weight || '500g'),
    image: variant?.image || fallbackProduct.image || '',
  };
};

export const adaptImage = (image, productId) => ({
  id: image?.id || image?.imageId || `${productId || 'product'}-image-${Math.random()}`,
  productId: image?.productId || productId || null,
  url: image?.url || image?.imageUrl || image?.path || '',
  altText: image?.altText || image?.caption || '',
  displayOrder: Number(image?.displayOrder ?? 0),
  primaryImage: Boolean(image?.primaryImage ?? image?.isPrimary),
});

export const adaptStoreProduct = (storeProduct) => ({
  id: storeProduct?.id || storeProduct?.mappingId || storeProduct?.storeProductId || null,
  storeId: storeProduct?.storeId || storeProduct?.store?.id || null,
  storeName: storeProduct?.storeName || storeProduct?.store?.name || '',
  productId: storeProduct?.productId || storeProduct?.product?.id || null,
  product: storeProduct?.product ? adaptProduct(storeProduct.product) : null,
  available: storeProduct?.available ?? true,
  priceOverride: pickPrice(storeProduct?.priceOverride ?? storeProduct?.overridePrice),
  status: storeProduct?.status || 'ACTIVE',
});

export const adaptProduct = (product) => {
  const variants = asArray(product?.variants || product?.variantList || product?.items).map((variant) => adaptVariant(variant, product));
  const productId = product?.productId || product?.id || product?.slug || product?.sku || product?.name;
  const images = asArray(product?.images || product?.imageList || product?.gallery || product?.productImages).map((image) => adaptImage(image, productId));
  const primaryImage = firstImageUrl(images) || product?.image || product?.thumbnail || product?.featuredImage || '';
  const categoryName = product?.category?.name || product?.categoryName || product?.category || product?.categoryId || 'General';
  const variant = variants[0] || {
    id: product?.variantId || product?.defaultVariantId || null,
    variantId: product?.variantId || product?.defaultVariantId || null,
    productId,
    sku: product?.sku || product?.productCode || '',
    name: product?.name || product?.title || 'Default',
    label: product?.name || product?.title || 'Default',
    price: pickPrice(product?.price ?? product?.offerPrice ?? 0),
    compareAtPrice: pickPrice(product?.compareAtPrice ?? product?.price ?? 0),
    attributes: product?.attributes || {},
    active: true,
    weight: product?.weight || '500g',
  };

  return {
    id: productId,
    productId,
    name: product?.name || product?.title || 'Product',
    title: product?.title || product?.name || 'Product',
    slug: product?.slug || product?.name,
    category: categoryName,
    categoryId: product?.category?.id || product?.categoryId || null,
    description: product?.description || '',
    brand: product?.brand || '',
    status: normaliseStatus(product?.status),
    active: normaliseStatus(product?.status) !== 'INACTIVE',
    image: primaryImage,
    images: images.map((image) => image.url).filter(Boolean),
    gallery: images.map((image) => image.url).filter(Boolean),
    price: pickPrice(variant?.price ?? 0),
    offerPrice: pickPrice(variant?.price ?? 0),
    compareAtPrice: pickPrice(variant?.compareAtPrice ?? variant?.price ?? 0),
    sku: variant?.sku || product?.sku || product?.productCode || '',
    weight: variant?.weight || extractWeight(variant, product?.weight || '500g'),
    variantId: variant?.variantId || variant?.id || null,
    variants: variants.length ? variants : [variant],
    attributes: product?.attributes || {},
    metadata: product?.metadata || {},
    storeId: product?.storeId || product?.store?.id || null,
    available: product?.available ?? true,
    tags: product?.tags || [],
    rating: product?.rating || 0,
    createdAt: product?.createdAt || null,
  };
};

export const adaptProductList = (payload) => {
  const items = Array.isArray(payload) ? payload : payload?.content || payload?.items || payload?.data || payload?.products || [];
  return items.map((product) => adaptProduct(product));
};

export const adaptCategoryList = (payload) => {
  const items = Array.isArray(payload) ? payload : payload?.content || payload?.items || payload?.data || payload?.categories || [];
  return items.map((category) => adaptCategory(category));
};

export const adaptStoreProductList = (payload) => {
  const items = Array.isArray(payload) ? payload : payload?.content || payload?.items || payload?.data || payload?.storeProducts || [];
  return items.map((storeProduct) => adaptStoreProduct(storeProduct));
};
