import pickleJarImg from '../assets/images/pickel-removebg-preview.png';
import mangoPickleImg from '../assets/images/mango_pickle_jar.png';
import lemonPickleImg from '../assets/images/lemon_pickle_jar.png';
import garlicPickleImg from '../assets/images/garlic_pickle_jar.png';
import redChilliImg from '../assets/images/red_chilli_powder.png';
import homeSpicesImg from '../assets/images/home_spices.png';
import wholeSpicesImg from '../assets/images/whole_spices.png';
import dryFruitsImg from '../assets/images/dry_fruits.png';

export const dummyCategories = [
  { id: 'cat-pickles', name: 'Pickles', image: mangoPickleImg, description: 'Traditional homemade pickles', status: 'ACTIVE', sortOrder: 1 },
  { id: 'cat-spice-powder', name: 'Spice powder', image: homeSpicesImg, description: 'Freshly ground spice powders', status: 'ACTIVE', sortOrder: 2 },
  { id: 'cat-masalas', name: 'Masalas', image: wholeSpicesImg, description: 'Blended cooking masalas', status: 'ACTIVE', sortOrder: 3 },
  { id: 'cat-whole-masala', name: 'Whole Masala', image: wholeSpicesImg, description: 'Whole spices and aromatics', status: 'ACTIVE', sortOrder: 4 },
  { id: 'cat-dry-fruits', name: 'Dry Fruits', image: dryFruitsImg, description: 'Premium nuts and dry fruits', status: 'ACTIVE', sortOrder: 5 },
];

const image = (productId, url, primaryImage = true) => ({
  id: `${productId}-image-${primaryImage ? 'primary' : 'gallery'}`,
  productId,
  url,
  altText: productId,
  displayOrder: primaryImage ? 0 : 1,
  primaryImage,
});

const variant = (productId, id, label, price, sku) => ({
  id,
  variantId: id,
  productId,
  name: label,
  label,
  sku,
  price,
  compareAtPrice: price + 30,
  attributes: { weight: label },
  active: true,
});

const product = (id, name, categoryId, categoryName, imageUrl, variants, flags = {}) => ({
  id,
  productId: id,
  name,
  title: name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  categoryId,
  category: { id: categoryId, name: categoryName },
  description: `Authentic ${name.toLowerCase()} prepared with traditional recipes and premium ingredients.`,
  brand: 'Thejo',
  status: 'ACTIVE',
  active: true,
  variants,
  images: [image(id, imageUrl)],
  productImages: [image(id, imageUrl)],
  tags: [categoryName, 'Homemade'],
  rating: 4.5,
  createdAt: new Date().toISOString(),
  ...flags,
});

export const dummyProducts = [
  product('prod-avakaya-pickle', 'Avakaya Pickle', 'cat-pickles', 'Pickles', mangoPickleImg, [
    variant('prod-avakaya-pickle', 'var-avakaya-250g', '250g', 119, 'THEJO-AVA-250'),
    variant('prod-avakaya-pickle', 'var-avakaya-500g', '500g', 199, 'THEJO-AVA-500'),
  ], { bestSeller: 'Yes', featured: 'Yes' }),
  product('prod-lemon-pickle', 'Lemon Pickle', 'cat-pickles', 'Pickles', lemonPickleImg, [
    variant('prod-lemon-pickle', 'var-lemon-250g', '250g', 109, 'THEJO-LEM-250'),
    variant('prod-lemon-pickle', 'var-lemon-500g', '500g', 189, 'THEJO-LEM-500'),
  ], { bestSeller: 'Yes' }),
  product('prod-gongura-pickle', 'Gongura Pickle', 'cat-pickles', 'Pickles', pickleJarImg, [
    variant('prod-gongura-pickle', 'var-gongura-250g', '250g', 129, 'THEJO-GON-250'),
    variant('prod-gongura-pickle', 'var-gongura-500g', '500g', 209, 'THEJO-GON-500'),
  ], { special: 'Yes' }),
  product('prod-garlic-pickle', 'Garlic Pickle', 'cat-pickles', 'Pickles', garlicPickleImg, [
    variant('prod-garlic-pickle', 'var-garlic-250g', '250g', 129, 'THEJO-GAR-250'),
    variant('prod-garlic-pickle', 'var-garlic-500g', '500g', 219, 'THEJO-GAR-500'),
  ]),
  product('prod-red-chilli-powder', 'Red Chilli Powder', 'cat-spice-powder', 'Spice powder', redChilliImg, [
    variant('prod-red-chilli-powder', 'var-red-chilli-250g', '250g', 120, 'THEJO-RCP-250'),
    variant('prod-red-chilli-powder', 'var-red-chilli-500g', '500g', 219, 'THEJO-RCP-500'),
  ], { featured: 'Yes' }),
  product('prod-turmeric-powder', 'Turmeric Powder', 'cat-spice-powder', 'Spice powder', homeSpicesImg, [
    variant('prod-turmeric-powder', 'var-turmeric-250g', '250g', 89, 'THEJO-TUR-250'),
    variant('prod-turmeric-powder', 'var-turmeric-500g', '500g', 159, 'THEJO-TUR-500'),
  ]),
  product('prod-garam-masala', 'Garam Masala', 'cat-masalas', 'Masalas', wholeSpicesImg, [
    variant('prod-garam-masala', 'var-garam-100g', '100g', 110, 'THEJO-GRM-100'),
    variant('prod-garam-masala', 'var-garam-250g', '250g', 199, 'THEJO-GRM-250'),
  ], { special: 'Yes' }),
  product('prod-whole-clove', 'Whole Clove', 'cat-whole-masala', 'Whole Masala', wholeSpicesImg, [
    variant('prod-whole-clove', 'var-clove-100g', '100g', 149, 'THEJO-CLV-100'),
  ]),
  product('prod-jumbo-cashews', 'Premium Jumbo Cashews', 'cat-dry-fruits', 'Dry Fruits', dryFruitsImg, [
    variant('prod-jumbo-cashews', 'var-cashew-250g', '250g', 349, 'THEJO-CAS-250'),
    variant('prod-jumbo-cashews', 'var-cashew-500g', '500g', 649, 'THEJO-CAS-500'),
  ], { newArrival: 'Yes' }),
  product('prod-california-almonds', 'California Almonds', 'cat-dry-fruits', 'Dry Fruits', dryFruitsImg, [
    variant('prod-california-almonds', 'var-almond-250g', '250g', 249, 'THEJO-ALM-250'),
    variant('prod-california-almonds', 'var-almond-500g', '500g', 450, 'THEJO-ALM-500'),
  ], { newArrival: 'Yes' }),
];

export const dummyStoreProducts = [
  'prod-avakaya-pickle',
  'prod-lemon-pickle',
  'prod-gongura-pickle',
  'prod-red-chilli-powder',
  'prod-turmeric-powder',
  'prod-jumbo-cashews',
].map((productId) => ({
  id: `store-gachibowli-${productId}`,
  storeId: 'store-gachibowli',
  productId,
  available: true,
  status: 'ACTIVE',
  product: dummyProducts.find((item) => item.productId === productId),
}));

export const dummyCatalogEnabled = () => import.meta.env.VITE_ENABLE_DUMMY_CATALOG === 'true';

export const filterDummyProducts = (params = {}) => {
  const term = String(params.search || params.q || '').trim().toLowerCase();
  const category = String(params.category || params.categoryId || '').trim();
  return dummyProducts.filter((item) => {
    const matchesText = !term || [item.name, item.description, item.category?.name, ...(item.tags || [])].join(' ').toLowerCase().includes(term);
    const matchesCategory = !category || item.categoryId === category || item.category?.name === category;
    return matchesText && matchesCategory && item.active !== false;
  });
};

export const getDummyProduct = (productId) =>
  dummyProducts.find((item) => item.productId === productId || item.id === productId);

export const getDummyProductVariants = (productId) => getDummyProduct(productId)?.variants || [];

export const getDummyProductImages = (productId) => getDummyProduct(productId)?.productImages || [];

export const getDummyStoreProducts = (storeId) =>
  dummyStoreProducts.filter((item) => !storeId || item.storeId === storeId);
