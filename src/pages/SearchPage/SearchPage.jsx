import { useState, useContext, useEffect } from 'react';
import { Box, Typography, Button, Chip, IconButton, InputBase, MenuItem, Rating, Select } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';
import { collectionStore, orderStore, subscribeToLocalData } from '../../services/localDataService';
import { customerProduct } from '../../services/sharedCatalog';
import './SearchPage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const { addToCart, setSelectedProduct, formatCurrency } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState(['Mango pickle']);
  const [sortBy, setSortBy] = useState('popularity');
  const [maxPrice, setMaxPrice] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [, refreshSharedData] = useState(0);
  useEffect(() => subscribeToLocalData(({ key }) => {
    if (!key || ['local:products','local:inventory','local:reviews','orders','local:stores'].includes(key)) refreshSharedData((value) => value + 1);
  }), []);

  const legacyProducts = [
    {
      title: 'Mango Avakaya Pickle â€“ Spicy Delight',
      weight: '500 g',
      price: 279,
      delivery: 'Instant Delivery Available',
      image: pickleJarImg,
    },
    {
      title: 'Sweet Mango Pickle â€“ Family Favorite',
      weight: '500 g',
      price: 279,
      delivery: 'Instant Delivery Available',
      image: pickleJarImg,
    },
    {
      title: 'Mango Avakaya Pickle â€“ Spicy Delight',
      weight: '250 g',
      price: 99,
      delivery: 'Instant Delivery Available',
      image: pickleJarImg,
    },
    {
      title: 'Mango Avakaya Pickle â€“ Spicy Delight',
      weight: '1kg',
      price: 300,
      delivery: 'Instant Delivery Available',
      image: pickleJarImg,
    },
    {
      title: 'Sweet Mango Pickle â€“ Family Favorite',
      weight: '250 g',
      price: 279,
      delivery: 'Instant Delivery Available',
      image: pickleJarImg,
    },
    {
      title: 'Sweet Mango Pickle â€“ Family Favorite',
      weight: '500 g',
      price: 279,
      delivery: 'Instant Delivery Available',
      image: pickleJarImg,
    },
    {
      title: 'Gongora Pickle',
      weight: '250 g',
      price: 159,
      delivery: 'Instant Delivery Available',
      image: pickleJarImg,
    },
    {
      title: 'Lemon Pickle',
      weight: '500 g',
      price: 189,
      delivery: 'Instant Delivery Available',
      image: pickleJarImg,
    },
  ];

  void legacyProducts;
  const inventory = collectionStore.list('inventory');
  const reviews = collectionStore.list('reviews').filter((review) => review.status === 'Approved' && review.active !== false);
  const stores = collectionStore.list('stores');
  const orderCounts = orderStore.list().flatMap((order) => order.items || []).reduce((counts,item) => ({ ...counts,[item.id || item.title]:(counts[item.id || item.title] || 0)+Number(item.quantity || 1) }),{});
  const categories = [...new Set(collectionStore.list('products').map((item) => item.category).filter(Boolean))];
  const allProducts = collectionStore.list('products')
    .filter((item) => item.status !== 'Inactive' && item.active !== false)
    .map((item) => ({ ...customerProduct(item, inventory), basePrice: Number(item.price || item.offerPrice || 0) }));
  const searchableProducts = allProducts.map((product) => {
    const productReviews=reviews.filter((review) => review.productId === (product.id || product.sku || product.title) || review.product === product.title);
    const rating=productReviews.length ? productReviews.reduce((sum,review)=>sum+Number(review.rating || 0),0)/productReviews.length : 0;
    const store=stores.find((item)=>item.name===product.store);
    const pickup=product.pickup === true || product.pickup === 'Yes' || store?.pickup === 'Yes';
    const deliveryMinutes=Number(product.deliveryMinutes || 0);
    return { ...product,rating,ratingCount:productReviews.length,pickup,deliveryMinutes,under30:deliveryMinutes>0&&deliveryMinutes<=30,offer:Number(product.discount || 0)>0 || (Number(product.offerPrice)>0&&Number(product.offerPrice)<product.basePrice),popularity:Number(orderCounts[product.id] || orderCounts[product.title] || 0)+(product.bestSeller==='Yes'?100:0),newest:new Date(product.createdAt || 0).getTime() };
  });
  const filteredProducts = (searchTerm.trim()
    ? searchableProducts.filter((p) =>
        [p.title,p.description,p.category,p.subcategory,p.ingredients,p.tags].filter(Boolean).join(' ').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []).filter((product) => categoryFilter === 'all' || product.category === categoryFilter).filter((product) => maxPrice === 'all' || Number(product.price) <= Number(maxPrice)).filter((product) => ratingFilter === 'all' || (ratingFilter === '5' ? product.rating === 5 : product.rating >= 4)).filter((product) => availabilityFilter === 'all' || (availabilityFilter === 'in-stock' ? !product.outOfStock : availabilityFilter === 'out-of-stock' ? product.outOfStock : availabilityFilter === 'pickup' ? product.pickup : product.under30)).sort((a,b) => sortBy === 'price-low' ? Number(a.price)-Number(b.price) : sortBy === 'price-high' ? Number(b.price)-Number(a.price) : sortBy === 'newest' ? b.newest-a.newest : sortBy === 'pickup' ? Number(b.pickup)-Number(a.pickup) || b.popularity-a.popularity : sortBy === 'offers' ? Number(b.offer)-Number(a.offer) || b.popularity-a.popularity : sortBy === 'under30' ? Number(b.under30)-Number(a.under30) || (a.deliveryMinutes || Infinity)-(b.deliveryMinutes || Infinity) : b.popularity-a.popularity);

  const hasActiveFilters = categoryFilter !== 'all' || maxPrice !== 'all' || ratingFilter !== 'all' || availabilityFilter !== 'all' || sortBy !== 'popularity';
  const clearFilters = () => {
    setCategoryFilter('all');
    setMaxPrice('all');
    setRatingFilter('all');
    setAvailabilityFilter('all');
    setSortBy('popularity');
  };

  const handleRecentClick = (term) => {
    setSearchTerm(term);
  };

  const rememberSearch = () => {
    const term = searchTerm.trim();
    if (term) setRecentSearches((items) => [term, ...items.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 5));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleItemClick = (product) => {
    setSelectedProduct(product);
    navigate('/product-info');
  };

  return (
    <Box className="search-page-wrapper">
      {/* Header bar matching screenshot */}
      {!searchTerm ? (
        <Box className="search-header-default">
          <IconButton onClick={() => navigate(-1)} style={{ color: '#1e293b' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography className="search-header-title">Search</Typography>
        </Box>
      ) : null}

      {/* Search Input Box */}
      <Box className="search-box-wrap">
        <Box className="search-input-container">
          {searchTerm ? (
            <IconButton onClick={() => navigate(-1)} className="search-back-icon">
              <ArrowBackIcon style={{ color: '#64748b' }} />
            </IconButton>
          ) : null}

          <InputBase
            placeholder='Search for "Mango Pickle"'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') rememberSearch(); }}
            className="search-input-field"
            autoFocus
          />

          {searchTerm ? (
            <IconButton onClick={handleClearSearch} className="clear-icon">
              <CloseIcon style={{ color: '#64748b' }} />
            </IconButton>
          ) : (
            <SearchIcon className="search-magnify-icon" />
          )}
        </Box>
      </Box>

      {/* View 1: Default Search Screen (Recent Searches) */}
      {!searchTerm && (
        <Box className="recent-searches-view">
          <Typography className="recent-searches-heading">Recent Searches</Typography>

          <Box className="recent-pills-row">
            {recentSearches.map((term, idx) => (
              <Box key={idx} className="recent-pill" onClick={() => handleRecentClick(term)}>
                <AccessTimeIcon className="recent-clock-icon" fontSize="small" />
                <span>{term}</span>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* View 2: Search Results List (Matching search history screenshot) */}
      {searchTerm && (
        <Box className="search-results-scroll">
          <Box className="search-tools" aria-label="Search filters">
            <Select size="small" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
            </Select>
            <Select size="small" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}>
              <MenuItem value="all">All Prices</MenuItem>
              <MenuItem value="150">Under {formatCurrency(150)}</MenuItem>
              <MenuItem value="200">Under {formatCurrency(200)}</MenuItem>
              <MenuItem value="300">Under {formatCurrency(300)}</MenuItem>
            </Select>
            <Select size="small" value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
              <MenuItem value="all">All Ratings</MenuItem>
              <MenuItem value="4">4 stars & above</MenuItem>
              <MenuItem value="5">5 stars only</MenuItem>
            </Select>
            <Select size="small" value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)}>
              <MenuItem value="all">All Availability</MenuItem>
              <MenuItem value="in-stock">In Stock</MenuItem>
              <MenuItem value="out-of-stock">Out of Stock</MenuItem>
              <MenuItem value="pickup">Pickup Available</MenuItem>
              <MenuItem value="under30">Under 30 min</MenuItem>
            </Select>
            <Select size="small" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <MenuItem value="popularity">Popularity</MenuItem>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-low">Price Low to High</MenuItem>
              <MenuItem value="price-high">Price High to Low</MenuItem>
              <MenuItem value="pickup">Pickup</MenuItem>
              <MenuItem value="offers">Offers</MenuItem>
              <MenuItem value="under30">Under 30 min delivery</MenuItem>
            </Select>
            {hasActiveFilters && <Button className="clear-filters-btn" onClick={clearFilters}>Clear filters</Button>}
          </Box>
          <Box className="search-results-summary">
            <Typography>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found</Typography>
            <Typography>Sorted by {sortBy === 'price-low' ? 'Price: Low to High' : sortBy === 'price-high' ? 'Price: High to Low' : sortBy === 'under30' ? 'Under 30 min delivery' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</Typography>
          </Box>
          {filteredProducts.length === 0 ? (
            <Box className="no-results-box">
              <Typography variant="body1" color="textSecondary">
                No products match “{searchTerm}” with the selected filters.
              </Typography>
            </Box>
          ) : (
            filteredProducts.map((prod) => (
              <Box key={prod.id} className="search-result-card" onClick={() => handleItemClick(prod)}>
                <Box className="search-card-left">
                  <Typography className="search-prod-title">{prod.title}</Typography>
                  <Typography className="search-prod-specs">
                    {prod.weight} | <span className="price-bold">{formatCurrency(prod.price)}</span>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                    <Rating value={prod.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="caption">
                      {prod.ratingCount ? `${prod.rating.toFixed(1)} (${prod.ratingCount})` : 'No ratings'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>
                    {prod.offer && <Chip size="small" label="Offer" color="success" variant="outlined" />}
                    {prod.pickup && <Chip size="small" label="Pickup" variant="outlined" />}
                    {prod.under30 && <Chip size="small" label="Under 30 min" variant="outlined" />}
                    <Chip size="small" label={prod.outOfStock ? 'Out of Stock' : 'In Stock'} color={prod.outOfStock ? 'error' : 'success'} variant={prod.outOfStock ? 'outlined' : 'filled'} />
                  </Box>
                  <Typography className="search-prod-delivery">
                    {prod.outOfStock
                      ? 'Currently unavailable'
                      : prod.deliveryMinutes
                        ? `${prod.deliveryMinutes} min delivery`
                        : 'Standard delivery'}
                  </Typography>
                </Box>

                <Box className="search-card-right" onClick={(e) => e.stopPropagation()}>
                  <Box className="search-img-box">
                    <img src={prod.image} alt={prod.title} />
                  </Box>
                  <Button
                    variant="contained"
                    className="search-add-btn"
                    onClick={() =>
                      addToCart({
                        id: prod.id,
                        title: prod.title,
                        weight: prod.weight,
                        price: prod.price,
                        image: prod.image,
                      })
                    }
                    disabled={prod.outOfStock}
                  >
                    {prod.outOfStock ? 'Out of stock' : 'Add +'}
                  </Button>
                </Box>
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchPage;
