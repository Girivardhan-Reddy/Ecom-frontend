import { useContext, useEffect, useState } from 'react';
import { Box, Typography, Button, MenuItem, Select } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import SortOutlinedIcon from '@mui/icons-material/SortOutlined';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import CategoryNav from '../../components/CategoryNav/CategoryNav';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import ProductSection from '../../components/ProductSection/ProductSection';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryCircle from '../../components/CategoryCircle/CategoryCircle';
import CampaignCarousel from '../../components/CampaignCarousel/CampaignCarousel';
import BottomNav from '../../components/BottomNav/BottomNav';
import { AppContext } from '../../context/AppContext';
import { collectionStore, orderStore, subscribeToLocalData } from '../../services/localDataService';
import { customerProduct } from '../../services/sharedCatalog';
import { promotionApplies } from '../../services/promotionScope';
import './Home.css';

import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';
import mangoPickleImg from '../../assets/images/mango_pickle_jar.png';
import lemonPickleImg from '../../assets/images/lemon_pickle_jar.png';
import garlicPickleImg from '../../assets/images/garlic_pickle_jar.png';
import redChilliImg from '../../assets/images/red_chilli_powder.png';
import homeSpicesBanner from '../../assets/images/home_spices.png';
import wholeSpicesImg from '../../assets/images/whole_spices.png';
import dryFruitsImg from '../../assets/images/dry_fruits.png';
import bestSellersBanner from '../../assets/images/best_sellers.png';
import traditionalPicklesBanner from '../../assets/images/traditional_pickles.png';

const Home = () => {
  const [, refreshSharedData] = useState(0);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [showSearchSort, setShowSearchSort] = useState(false);
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchPrice, setSearchPrice] = useState('all');
  const [searchRating, setSearchRating] = useState('all');
  const [searchAvailability, setSearchAvailability] = useState('all');
  const [searchSort, setSearchSort] = useState('popularity');
  useEffect(() => subscribeToLocalData(({ key }) => {
    if (!key || ['local:products','local:categories','local:stores','local:inventory','local:banners'].includes(key)) refreshSharedData((value) => value + 1);
  }), []);
  const navigate = useNavigate();
  const {
    selectedCategory,
    setSelectedCategory,
    homeSearchQuery,
    showLocationModal,
    setShowLocationModal,
    detectUserLocation,
    t,
    userCity,
  } = useContext(AppContext);

  const dummyProducts = [
    { title: 'Avakaya Pickle', weight: '500g', price: '199', image: mangoPickleImg },
    { title: 'Lemon Pickle', weight: '500g', price: '189', image: lemonPickleImg },
    { title: 'Gongura Pickle', weight: '500g', price: '199', image: pickleJarImg },
    { title: 'Garlic Pickle', weight: '500g', price: '209', image: garlicPickleImg },
    { title: 'Carrot Pickle', weight: '500g', price: '189', image: lemonPickleImg },
    { title: 'Chicken Pickle', weight: '500g', price: '249', image: traditionalPicklesBanner },
    { title: 'Prawns Pickle', weight: '250g', price: '299', image: traditionalPicklesBanner },
    { title: 'Mutton Pickle', weight: '250g', price: '349', image: traditionalPicklesBanner },
    { title: 'Tomato Pickle', weight: '500g', price: '179', image: pickleJarImg },
    { title: 'Ginger Pickle', weight: '250g', price: '169', image: garlicPickleImg },
    { title: 'Mixed Pickle', weight: '500g', price: '199', image: bestSellersBanner },
    { title: 'Red Chilli Pickle', weight: '500g', price: '199', image: redChilliImg },
  ];

  const spiceProducts = [
    { title: 'Turmeric Powder', weight: '250g', price: '89', image: homeSpicesBanner },
    { title: 'Red Chilli Powder', weight: '250g', price: '120', image: redChilliImg },
    { title: 'Coriander Powder', weight: '250g', price: '95', image: homeSpicesBanner },
    { title: 'Garam Masala', weight: '100g', price: '110', image: wholeSpicesImg },
    { title: 'Sambar Powder', weight: '200g', price: '105', image: homeSpicesBanner },
    { title: 'Biryani Masala', weight: '100g', price: '130', image: wholeSpicesImg },
    { title: 'Reshampatti Chilli Powder', weight: '500g', price: '219', image: redChilliImg },
    { title: 'Dhania Powder', weight: '500g', price: '179', image: homeSpicesBanner },
    { title: 'Special Garam Masala', weight: '250g', price: '199', image: wholeSpicesImg },
    { title: 'Rasam Powder', weight: '250g', price: '149', image: homeSpicesBanner },
    { title: 'Kashmiri Red Chilli Powder', weight: '250g', price: '189', image: redChilliImg },
    { title: 'Cumin (Jeera) Powder', weight: '250g', price: '159', image: wholeSpicesImg },
    { title: 'Black Pepper Powder', weight: '100g', price: '129', image: wholeSpicesImg },
  ];

  const wholeMasalaItems = [
    { title: 'Whole Clove (Laung)', weight: '100g', price: '149', image: wholeSpicesImg },
    { title: 'Cardamom (Elaichi)', weight: '100g', price: '299', image: wholeSpicesImg },
    { title: 'Cinnamon Sticks', weight: '100g', price: '129', image: wholeSpicesImg },
    { title: 'Star Anise (Chakra Phool)', weight: '100g', price: '159', image: wholeSpicesImg },
    { title: 'Black Pepper', weight: '100g', price: '119', image: wholeSpicesImg },
    { title: 'Nutmeg (Jaiphal)', weight: '50g', price: '99', image: wholeSpicesImg },
  ];

  const masalasItems = [
    { title: 'Garam Masala Powder', weight: '200g', price: '139', image: wholeSpicesImg },
    { title: 'Sambar Masala', weight: '250g', price: '119', image: wholeSpicesImg },
    { title: 'Chicken Biryani Masala', weight: '100g', price: '89', image: wholeSpicesImg },
    { title: 'Rasam Powder', weight: '200g', price: '99', image: wholeSpicesImg },
    { title: 'Meat Masala Powder', weight: '150g', price: '125', image: wholeSpicesImg },
    { title: 'Chana Masala Powder', weight: '100g', price: '79', image: wholeSpicesImg },
  ];

  const dryFruitsItems = [
    { title: 'Premium Jumbo Cashews', weight: '250g', price: '349', image: dryFruitsImg },
    { title: 'California Almonds (Badam)', weight: '500g', price: '450', image: dryFruitsImg },
    { title: 'Afghani Raisins (Kishmish)', weight: '250g', price: '179', image: dryFruitsImg },
    { title: 'Walnut Kernels (Akhrot)', weight: '250g', price: '399', image: dryFruitsImg },
    { title: 'Pistachios (Pista)', weight: '200g', price: '320', image: dryFruitsImg },
  ];

  const dummyCategories = [
    { title: 'Pickles', categoryKey: 'Pickles', image: mangoPickleImg },
    { title: 'Whole Masala', categoryKey: 'Whole Masala', image: wholeSpicesImg },
    { title: 'Masalas', categoryKey: 'Masalas', image: wholeSpicesImg },
    { title: 'Spice powder', categoryKey: 'Spice powder', image: homeSpicesBanner },
    { title: 'Dry Fruits', categoryKey: 'Dry Fruits', image: dryFruitsImg },
  ];
  // Kept only as a migration reference for the original customer catalogue.
  void [dummyProducts, spiceProducts, wholeMasalaItems, masalasItems, dryFruitsItems, dummyCategories];

  const inventory = collectionStore.list('inventory');
  const inferSubcategory = (item) => {
    if (item.subcategory) return item.subcategory;
    if (item.category === 'Pickles') return /chicken|mutton|prawn|fish/i.test(item.name || item.title) ? 'Non-Veg Pickles' : 'Veg Pickles';
    if (item.category === 'Spice powder') return 'Powdered Spices';
    if (item.category === 'Whole Masala') return 'Whole Spices';
    if (item.category === 'Masalas') return 'Blended Masalas';
    if (item.category === 'Dry Fruits') return /raisin|date/i.test(item.name || item.title) ? 'Dried Fruits' : 'Nuts';
    return 'Other';
  };
  const reviews = collectionStore.list('reviews').filter((review) => review.status === 'Approved' && review.active !== false);
  const stores = collectionStore.list('stores');
  const orderCounts = orderStore.list().flatMap((order) => order.items || []).reduce((counts,item) => ({ ...counts,[item.id || item.title]:(counts[item.id || item.title] || 0)+Number(item.quantity || 1) }),{});
  const allMasterProducts = collectionStore.list('products')
    .filter((item) => item.status !== 'Inactive' && item.active !== false)
    .map((item) => {
      const product = customerProduct(item, inventory);
      const productReviews = reviews.filter((review) => review.productId === (product.id || product.sku || product.title) || review.product === product.title);
      const rating = productReviews.length ? productReviews.reduce((sum,review) => sum + Number(review.rating || 0), 0) / productReviews.length : 0;
      const store = stores.find((entry) => entry.name === product.store);
      const pickup = product.pickup === true || product.pickup === 'Yes' || store?.pickup === 'Yes';
      const deliveryMinutes = Number(product.deliveryMinutes || 0);
      const basePrice = Number(item.price || item.offerPrice || 0);
      return { ...product, subcategory:inferSubcategory(item), rating, pickup, deliveryMinutes, under30:deliveryMinutes > 0 && deliveryMinutes <= 30, offer:Number(item.discount || 0) > 0 || (Number(item.offerPrice) > 0 && Number(item.offerPrice) < basePrice), popularity:Number(orderCounts[product.id] || orderCounts[product.title] || 0) + (product.bestSeller === 'Yes' ? 100 : 0), newest:new Date(product.createdAt || 0).getTime() };
    });
  const sharedCategories = collectionStore.list('categories')
    .filter((item) => item.status !== 'Inactive' && item.active !== false)
    .sort((a,b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  const cityName = collectionStore.list('locations').map((item)=>item.name).find((name)=>userCity.toLowerCase().includes(String(name).toLowerCase()))?.toLowerCase() || (userCity || '').split(',')[0]?.trim().toLowerCase();
  const availableStores = collectionStore.list('stores').filter((item) => item.status !== 'Inactive' && item.active !== false && item.availability !== 'Unavailable');
  const nearbyStores = availableStores.filter((item) => !cityName || !item.location || item.location.toLowerCase().includes(cityName) || userCity.toLowerCase().includes(item.location.toLowerCase()));
  const sharedStores = nearbyStores.length ? nearbyStores : availableStores;
  const nearbyProducts=allMasterProducts.filter((item)=>String(item.location||'').toLowerCase()===cityName);
  const globalProducts=allMasterProducts.filter((item)=>String(item.location||'').toLowerCase()!==cityName);
  const now = new Date();
  const activeBanners = collectionStore.list('banners').filter((item) => {
    if (item.status !== 'Active' || item.active === false || !item.image) return false;
    const startsAt = item.startDate ? new Date(`${item.startDate}T00:00:00`) : null;
    const endsAt = item.endDate ? new Date(`${item.endDate}T23:59:59.999`) : null;
    return (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now) && promotionApplies(item,{location:collectionStore.list('locations').find((entry)=>userCity.toLowerCase().includes(entry.name.toLowerCase()))?.name||''});
  });
  const subcategories = selectedCategory === 'All' ? [] : [...new Set(allMasterProducts.filter((item) => item.category === selectedCategory).map((item) => item.subcategory))];
  const effectiveSubcategory = subcategories.includes(selectedSubcategory) ? selectedSubcategory : 'All';

  const getCategoryItems = () => {
    const baseCategoryPool = selectedCategory && selectedCategory !== 'All'
      ? allMasterProducts.filter((item) => (item.category === selectedCategory || (selectedCategory === 'Spice Powders' && item.category === 'Spice powder')) && (effectiveSubcategory === 'All' || item.subcategory === effectiveSubcategory))
      : null;

    if (homeSearchQuery && homeSearchQuery.trim()) {
      const searchPool = baseCategoryPool || allMasterProducts;
      return searchPool.filter((p) => p.title.toLowerCase().includes(homeSearchQuery.trim().toLowerCase()))
        .filter((product) => searchCategory === 'all' || product.category === searchCategory)
        .filter((product) => searchPrice === 'all' || Number(product.price) <= Number(searchPrice))
        .filter((product) => searchRating === 'all' || (searchRating === '5' ? product.rating === 5 : product.rating >= 4))
        .filter((product) => searchAvailability === 'all' || (searchAvailability === 'in-stock' ? !product.outOfStock : searchAvailability === 'out-of-stock' ? product.outOfStock : searchAvailability === 'pickup' ? product.pickup : product.under30))
        .sort((a,b) => searchSort === 'price-low' ? Number(a.price)-Number(b.price) : searchSort === 'price-high' ? Number(b.price)-Number(a.price) : searchSort === 'newest' ? b.newest-a.newest : searchSort === 'pickup' ? Number(b.pickup)-Number(a.pickup) || b.popularity-a.popularity : searchSort === 'offers' ? Number(b.offer)-Number(a.offer) || b.popularity-a.popularity : searchSort === 'under30' ? Number(b.under30)-Number(a.under30) || (a.deliveryMinutes || Infinity)-(b.deliveryMinutes || Infinity) : b.popularity-a.popularity);
    }

    return baseCategoryPool;
  };

  const activeCategoryProducts = getCategoryItems();
  const searchFilterCount = [searchCategory,searchPrice,searchRating,searchAvailability].filter((value) => value !== 'all').length;
  const resetSearchFilters = () => { setSearchCategory('all'); setSearchPrice('all'); setSearchRating('all'); setSearchAvailability('all'); };

  return (
    <Box className="home-wrapper">
      <Header />
      <CategoryNav />
      {subcategories.length > 0 && <Box className="subcategory-nav"><Button className={effectiveSubcategory === 'All' ? 'active' : ''} onClick={() => setSelectedSubcategory('All')}>All</Button>{subcategories.map((name) => <Button key={name} className={effectiveSubcategory === name ? 'active' : ''} onClick={() => setSelectedSubcategory(name)}>{name}</Button>)}</Box>}

      <Box className="home-content-scroll">
        {activeCategoryProducts ? (
          activeCategoryProducts.length > 0 ? (
            <Box style={{ padding: '16px 4vw' }}>
              <Typography variant="h6" style={{ fontWeight: 700, marginBottom: '16px', color: '#1e293b' }}>
                {homeSearchQuery ? `Search Results for "${homeSearchQuery}"` : `${selectedCategory} Products`} ({activeCategoryProducts.length})
              </Typography>
              {homeSearchQuery && <Box className="home-search-controls">
                <Box className="home-search-actions">
                  <Button variant={showSearchFilters || searchFilterCount ? 'contained' : 'outlined'} startIcon={<FilterListOutlinedIcon />} onClick={() => { setShowSearchFilters((value) => !value); setShowSearchSort(false); }}>Filter{searchFilterCount ? ` (${searchFilterCount})` : ''}</Button>
                  <Button variant={showSearchSort || searchSort !== 'popularity' ? 'contained' : 'outlined'} startIcon={<SortOutlinedIcon />} onClick={() => { setShowSearchSort((value) => !value); setShowSearchFilters(false); }}>Sort</Button>
                  {(searchFilterCount > 0 || searchSort !== 'popularity') && <Button className="home-search-clear" onClick={() => { resetSearchFilters(); setSearchSort('popularity'); }}>Clear all</Button>}
                </Box>
                {showSearchFilters && <Box className="home-search-panel">
                  <Select size="small" value={searchCategory} onChange={(event) => setSearchCategory(event.target.value)}><MenuItem value="all">All Categories</MenuItem>{sharedCategories.map((category) => <MenuItem key={category.id} value={category.name}>{category.name}</MenuItem>)}</Select>
                  <Select size="small" value={searchPrice} onChange={(event) => setSearchPrice(event.target.value)}><MenuItem value="all">All Prices</MenuItem><MenuItem value="150">Under ₹150</MenuItem><MenuItem value="200">Under ₹200</MenuItem><MenuItem value="300">Under ₹300</MenuItem></Select>
                  <Select size="small" value={searchRating} onChange={(event) => setSearchRating(event.target.value)}><MenuItem value="all">All Ratings</MenuItem><MenuItem value="4">4 stars & above</MenuItem><MenuItem value="5">5 stars only</MenuItem></Select>
                  <Select size="small" value={searchAvailability} onChange={(event) => setSearchAvailability(event.target.value)}><MenuItem value="all">All Availability</MenuItem><MenuItem value="in-stock">In Stock</MenuItem><MenuItem value="out-of-stock">Out of Stock</MenuItem><MenuItem value="pickup">Pickup Available</MenuItem><MenuItem value="under30">Under 30 min</MenuItem></Select>
                  {searchFilterCount > 0 && <Button onClick={resetSearchFilters}>Reset filters</Button>}
                </Box>}
                {showSearchSort && <Box className="home-search-panel home-sort-panel"><Select size="small" value={searchSort} onChange={(event) => setSearchSort(event.target.value)}><MenuItem value="popularity">Popularity</MenuItem><MenuItem value="newest">Newest</MenuItem><MenuItem value="price-low">Price Low to High</MenuItem><MenuItem value="price-high">Price High to Low</MenuItem><MenuItem value="pickup">Pickup</MenuItem><MenuItem value="offers">Offers</MenuItem><MenuItem value="under30">Under 30 min delivery</MenuItem></Select></Box>}
              </Box>}
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {activeCategoryProducts.map((item, idx) => (
                  <ProductCard key={item.id || idx} {...item} />
                ))}
              </Box>
            </Box>
          ) : (
            <Box className="no-products-found">
              <Box className="no-products-content">
                <SearchOffOutlinedIcon style={{ fontSize: 64, color: '#94a3b8', marginBottom: 12 }} />
                <Typography className="no-products-title">
                  {t('noProducts')}
                </Typography>
                <Typography className="no-products-subtitle">
                  We couldn't find any products matching "{homeSearchQuery || selectedCategory}".
                </Typography>
                {homeSearchQuery && (searchFilterCount > 0 || searchSort !== 'popularity') && <Button sx={{ mt:2 }} variant="outlined" onClick={() => { resetSearchFilters(); setSearchSort('popularity'); }}>Clear filters and sorting</Button>}
              </Box>
            </Box>
          )
        ) : (
          <>
            {activeBanners.length > 0 ? <CampaignCarousel banners={activeBanners} onNavigate={navigate}/> : <HeroBanner />}

            <ProductSection title={t('shopCategories')} hasViewAll={false}>
              {sharedCategories.map((cat) => <CategoryCircle key={cat.id} title={cat.name} image={cat.image} onClick={() => setSelectedCategory(cat.name)} />)}
            </ProductSection>

            <ProductSection title={t('featured')} onViewAll={() => navigate('/search')}>
              {allMasterProducts.filter((item) => item.featured === 'Yes').slice(0,6).map((prod) => <ProductCard key={prod.id} {...prod} />)}
            </ProductSection>

            <ProductSection title={t('special')} onViewAll={() => navigate('/search')}>
              {allMasterProducts.filter((item) => item.special === 'Yes').slice(0,6).map((prod) => <ProductCard key={prod.id} {...prod} />)}
            </ProductSection>

            <ProductSection title={t('newArrivals')} onViewAll={() => navigate('/search')}>
              {allMasterProducts.filter((item) => item.newArrival === 'Yes').slice(0,6).map((prod) => <ProductCard key={prod.id} {...prod} />)}
            </ProductSection>

            <ProductSection title={t('recommended')} onViewAll={() => navigate('/search')}>
              {allMasterProducts.slice(4,10).map((prod) => <ProductCard key={prod.id} {...prod} />)}
            </ProductSection>

            <ProductSection title="Available Near You" onViewAll={() => navigate('/search')}>
              {nearbyProducts.slice(0,12).map((prod) => <ProductCard key={prod.id} {...prod} />)}
            </ProductSection>

            <ProductSection title="India-wide Global Store" onViewAll={() => navigate('/search')}>
              {globalProducts.slice(0,12).map((prod) => <ProductCard key={prod.id} {...prod} />)}
            </ProductSection>

            <Box sx={{ px:'4vw',py:2 }}><Typography className="section-title">Nearby Stores</Typography><Box sx={{ display:'flex',gap:2,flexWrap:'wrap',mt:1 }}>{sharedStores.map((store) => <Button key={store.id} variant="outlined" startIcon={<StorefrontOutlinedIcon />} onClick={() => { localStorage.setItem('selectedStore',store.name); navigate(`/stores/${store.id}`); }}>{store.name} - Available</Button>)}{sharedStores.length === 0 && <Typography color="text.secondary">No stores are currently available in your area.</Typography>}</Box></Box>

            <Box className="categories-and-promo-section">
              <Box className="shop-by-categories">
                <ProductSection title={t('bestSellers')} subtitle="Here's what everyone's loving!" onViewAll={() => navigate('/search')}>
                  {allMasterProducts.filter((item) => item.bestSeller === 'Yes').concat(allMasterProducts).slice(0,12).map((prod) => <ProductCard key={prod.id} {...prod} />)}
                </ProductSection>
              </Box>
              <Box className="promo-banner-container">
                <Box className="promo-banner-left">
                  <Box className="promo-welcome-tag">
                    <LocalOfferOutlinedIcon fontSize="small" /> Welcome Offer
                  </Box>
                  <Typography className="promo-title-text">
                    Get <span className="highlight-off">20% OFF</span>
                  </Typography>
                  <Box className="promo-pill-button">
                    ON FIRST 3 ORDERS
                  </Box>
                </Box>
              </Box>
            </Box>

            <ProductSection title={t('traditionalPickles')} onViewAll={() => navigate('/search')}>
              {allMasterProducts.filter((item) => item.category === 'Pickles').map((prod) => (
                <ProductCard key={prod.id} title={prod.title} weight={prod.weight} price={prod.price} image={prod.image} />
              ))}
            </ProductSection>

            <ProductSection title={t('homeSpices')} onViewAll={() => navigate('/search')}>
              {allMasterProducts.filter((item) => item.category === 'Spice powder').map((prod) => (
                <ProductCard key={prod.id} title={prod.title} weight={prod.weight} price={prod.price} image={prod.image} />
              ))}
            </ProductSection>

            <Box className="why-us-section">
              <Typography className="section-title">{t('whyUs')}</Typography>
              <Box className="why-us-grid">
                {[
                  { title: '100% Homemade', subtitle: 'No preservatives', icon: <CottageOutlinedIcon /> },
                  { title: 'Authentic Taste', subtitle: 'Traditional recipes', icon: <RestaurantOutlinedIcon /> },
                  { title: 'Premium Quality', subtitle: 'Finest ingredients', icon: <WorkspacePremiumOutlinedIcon /> },
                  { title: 'Hygienically Packed', subtitle: 'Safe & pure', icon: <VerifiedUserOutlinedIcon /> }
                ].map((item, idx) => (
                  <Box key={idx} className="why-us-item">
                    <Box className="why-us-icon-placeholder">{item.icon}</Box>
                    <Typography className="why-us-item-title">{item.title}</Typography>
                    <Typography className="why-us-item-subtitle">{item.subtitle}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}
      </Box>

      <BottomNav />

      {/* Location Modal matching screenshot design */}
      {showLocationModal && (
        <Box className="location-modal-overlay">
          <Box className="location-modal-card">
            <Box className="location-modal-content-row">
              <Box className="location-modal-text-col">
                <Typography className="location-modal-title">
                  Where should we deliver<br />your order?
                </Typography>
                <Typography className="location-modal-subtitle">
                  Enable location access to show<br />available products for your area.
                </Typography>
              </Box>
              <Box className="location-pin-graphic">
                <LocationOnIcon style={{ fontSize: 72, color: '#10b981' }} />
              </Box>
            </Box>

            <Box className="location-modal-actions">
              <Button
                variant="contained"
                className="use-current-location-btn"
                fullWidth
                onClick={() => {
                  detectUserLocation(() => {
                    setShowLocationModal(false);
                  });
                }}
              >
                Use Current Location
              </Button>
              <Button
                variant="outlined"
                className="search-location-btn"
                fullWidth
                onClick={() => {
                  setShowLocationModal(false);
                  navigate('/address-search');
                }}
              >
                Search Your Location
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Home;
