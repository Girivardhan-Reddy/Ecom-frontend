import { useState, useContext } from 'react';
import { Box, Typography, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Rating } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';
import mangoPickleImg from '../../assets/images/mango_pickle_jar.png';
import lemonPickleImg from '../../assets/images/lemon_pickle_jar.png';
import garlicPickleImg from '../../assets/images/garlic_pickle_jar.png';
import ProductCard from '../../components/ProductCard/ProductCard';
import { collectionStore } from '../../services/localDataService';
import './ProductInfo.css';

const validWebUrl = (value) => { try { const parsed = new URL(value); return ['http:','https:'].includes(parsed.protocol) ? parsed.href : ''; } catch { return ''; } };
const youtubeEmbedUrl = (url) => { const safe=validWebUrl(url);if(!safe)return '';const parsed=new URL(safe);const id=parsed.hostname.includes('youtu.be')?parsed.pathname.slice(1):parsed.searchParams.get('v')||(parsed.pathname.includes('/embed/')?parsed.pathname.split('/embed/')[1]:'');return id?`https://www.youtube.com/embed/${encodeURIComponent(id)}`:safe; };
const parseVariants = (product) => {
  if (Array.isArray(product.variants)) return product.variants.map((item) => typeof item === 'string' ? { label:item,price:Number(product.price),stock:Number(product.stock ?? 1) } : { ...item,label:item.label || item.size || item.weight || item.name });
  if (product.variants) return String(product.variants).split('\n').map((line) => line.trim()).filter(Boolean).map((line) => { const [label,sku,price,stock]=line.split('|').map((value)=>value.trim());return {label,sku,price:Number(price||product.price),stock:stock===undefined||stock===''?Number(product.stock??1):Number(stock)}; });
  return (product.weights || [product.weight || '250g']).map((label) => ({ label,price:Number(product.price),stock:Number(product.stock ?? 1) }));
};

const ProductInfo = () => {
  const navigate = useNavigate();
  const { selectedProduct, addToCart, updateQuantity, openCart, cartCount, cartItems, isLoggedIn, formatCurrency } = useContext(AppContext);
  const [imageIndex, setImageIndex] = useState(0);
  const [activeLink, setActiveLink] = useState(null);

  const product = selectedProduct || {
    title: 'Gongora Pickle',
    subtitle: 'Authentic Andhra Gongura Pickle | Traditional Recipe',
    description:
      'Freshly prepared Gongura Pickle made using handpicked gongura leaves, traditional Andhra spices, and cold-pressed oil. Rich in flavor with the perfect balance of tanginess and spice, bringing the authentic taste of homemade Andhra cuisine to your dining table.',
    highlights: [
      'Made with fresh handpicked gongura leaves',
      'Authentic Andhra-style recipe',
      'Traditional spices and cold-pressed oil',
      'No artificial colors or preservatives',
      'Homemade taste and aroma',
      'Hygienically prepared and packed',
    ],
    aboutSource:
      'Our Gongura Pickle is prepared using carefully selected fresh gongura leaves sourced from trusted local farms in Andhra Pradesh. The leaves are cleaned, processed, and blended with premium spices following traditional homemade methods.\n\nEach batch is prepared under hygienic conditions to preserve its authentic taste, freshness, and nutritional value. We use quality ingredients and traditional recipes to ensure every jar delivers the true essence of Andhra-style Gongura Pickle.',
    price: 159,
    weights: ['250g', '500g', '1kg'],
    image: pickleJarImg,
  };
  const variantOptions = parseVariants(product).filter((variant) => variant.label);
  const [selectedWeight, setSelectedWeight] = useState(variantOptions[0]?.label || product.weight || '250g');
  const selectedVariant = variantOptions.find((variant) => variant.label === selectedWeight) || variantOptions[0];
  const availableStock = Number(selectedVariant?.stock ?? product.stock ?? 0);
  const isOutOfStock = product.outOfStock || availableStock <= 0;

  const bestSellers = [
    { title: 'Avakaya Pickle', weight: '500g', price: '199', image: mangoPickleImg },
    { title: 'Lemon Pickle', weight: '500g', price: '189', image: lemonPickleImg },
    { title: 'Garlic Pickle', weight: '500g', price: '199', image: garlicPickleImg },
  ];
  const productImages = [product.image || pickleJarImg, ...(product.gallery || [])].filter((image, index, values) => image && values.indexOf(image) === index);
  const externalLinks = [
    { label: 'Website', url: product.websiteUrl },
    { label: 'YouTube', url: product.youtubeUrl },
    { label: 'Instagram', url: product.instagramUrl },
    { label: 'Facebook', url: product.facebookUrl },
    { label: 'Telegram', url: product.telegramUrl },
  ].map((link) => ({ ...link,url:validWebUrl(link.url) })).filter((link) => link.url);
  const productVideos = [product.videoUrl, ...String(product.videoUrls || '').split('\n')].map(validWebUrl).filter((url,index,items) => url && items.indexOf(url) === index);
  const specifications = String(product.specifications || 'Pack: Selected variant\nType: Vegetarian\nShelf life: 6 months').split('\n').map((line) => line.trim()).filter(Boolean);
  const tags = (Array.isArray(product.tags) ? product.tags : String(product.tags || 'Homemade, Traditional, No artificial colours').split(',')).map((tag) => String(tag).trim()).filter(Boolean);
  const productKey = product.id || product.sku || product.title;
  const approvedRatings = collectionStore.list('reviews').filter((review) => review.status === 'Approved' && review.active !== false && (!review.productId || review.productId === productKey));
  const averageRating = approvedRatings.length ? approvedRatings.reduce((sum,review) => sum + Number(review.rating || 0),0) / approvedRatings.length : 0;

  const itemTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const cartItem = cartItems.find((item) => item.title === product.title && item.weight === (selectedVariant?.label || selectedWeight));
  const productQuantity = cartItem ? cartItem.quantity : 0;

  const handleViewCart = () => {
    if (isLoggedIn) {
      navigate('/cart');
    } else {
      openCart();
    }
  };

  const handleAddProduct = () => {
    addToCart({
      title: product.title,
      weight: selectedVariant?.label || selectedWeight,
      variantSku: selectedVariant?.sku,
      price: Number(selectedVariant?.price || product.price),
      image: product.image,
    });
  };

  return (
    <Box className="product-info-wrapper">
      {/* Top Header Bar */}
      <Box className="product-info-header">
        <IconButton onClick={() => navigate(-1)} className="header-back-btn">
          <ArrowBackIcon style={{ color: '#ffffff' }} />
        </IconButton>
        <IconButton onClick={() => navigate('/home')} className="header-search-btn">
          <SearchIcon style={{ color: '#ffffff' }} />
        </IconButton>
      </Box>

      {/* Content Scroll View */}
      <Box className="product-info-scroll">
        {/* Main Product Image Banner */}
        <Box className="product-banner-wrap">
          <img src={productImages[imageIndex]} alt={`${product.title} view ${imageIndex + 1}`} className="product-main-img" />
          <Box className="carousel-dots">
            {productImages.map((_, index) => <button type="button" aria-label={`View image ${index + 1}`} key={index} className={`dot ${imageIndex === index ? 'active' : ''}`} onClick={() => setImageIndex(index)} />)}
          </Box>
        </Box>

        {/* Product Details Section */}
        <Box className="product-details-content">
          <Typography className="product-info-title">{product.title}</Typography>
          <Typography className="product-info-subtitle">
            {product.subtitle || 'Authentic Andhra Pickle | Traditional Recipe'}
          </Typography>

          {/* Weight Selectors */}
          <Box className="weight-options-row">
            <ScaleOutlinedIcon style={{ color: '#64748b', fontSize: 20 }} />
            {variantOptions.map((variant, idx) => (
              <Button
                key={idx}
                className={`weight-chip ${selectedWeight === variant.label ? 'selected' : ''}`}
                onClick={() => setSelectedWeight(variant.label)}
                disabled={Number(variant.stock) <= 0}
              >
                {variant.label}{Number(variant.price) !== Number(product.price) ? ` · ${formatCurrency(variant.price)}` : ''}
              </Button>
            ))}
          </Box>

          {/* Description */}
          <Typography className="product-description-text">
            {product.description ||
              'Freshly prepared Pickle made using handpicked ingredients, traditional Andhra spices, and cold-pressed oil.'}
          </Typography>
          <Box className={`stock-status ${isOutOfStock ? 'out' : ''}`}><Inventory2OutlinedIcon fontSize="small" /><Typography>{isOutOfStock ? 'Out of stock' : `In stock · ${availableStock} available`}</Typography></Box>

          <Box className="info-block"><Typography className="info-block-heading">Ingredients</Typography><Typography>{product.ingredients || 'Fresh produce, traditional spices, cold-pressed oil and salt.'}</Typography></Box>
          <Box className="info-block"><Typography className="info-block-heading">Specifications</Typography><Box className="specification-list">{specifications.map((specification) => { const [label,...value]=specification.split(':');return <Box key={specification}><Typography>{label}</Typography><Typography>{value.join(':').trim() || '-'}</Typography></Box>; })}</Box></Box>
          <Box className="info-block"><Typography className="info-block-heading">Tags</Typography><Box className="tag-list">{tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}</Box></Box>
          {(productVideos.length > 0 || externalLinks.length > 0) && <Box className="info-block"><Typography className="info-block-heading">Product Media & Links</Typography><Box className="product-video-grid">{productVideos.map((url) => url.includes('youtu') ? <iframe key={url} title={`${product.title} video`} src={youtubeEmbedUrl(url)} allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video key={url} controls src={url} />)}</Box><Box className="media-link-list">{externalLinks.map((link) => <Box key={link.label} className="media-link-row"><Typography>{link.label}</Typography><Box><Button size="small" startIcon={<VisibilityOutlinedIcon />} onClick={() => setActiveLink(link)}>Open here</Button><Button size="small" startIcon={<LaunchOutlinedIcon />} onClick={() => window.open(link.url,'_blank','noopener,noreferrer')}>External</Button></Box></Box>)}</Box></Box>}
          <Button variant="outlined" onClick={() => navigate('/reviews')} sx={{ justifyContent:'flex-start',gap:1,textTransform:'none' }}><Rating readOnly size="small" precision={0.1} value={averageRating} /> {averageRating ? `${averageRating.toFixed(1)} · ${approvedRatings.length} reviews` : 'No approved reviews yet'}</Button>

          {/* Highlights */}
          <Box className="info-block">
            <Typography className="info-block-heading">Highlights:</Typography>
            <ul className="highlights-list">
              {(
                product.highlights || [
                  'Made with fresh handpicked ingredients',
                  'Authentic Andhra-style recipe',
                  'Traditional spices and cold-pressed oil',
                  'No artificial colors or preservatives',
                  'Homemade taste and aroma',
                  'Hygienically prepared and packed',
                ]
              ).map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </Box>

          {/* About the Source */}
          <Box className="info-block">
            <Typography className="info-block-heading">About the Source</Typography>
            <Typography className="about-source-text">
              {product.aboutSource ||
                'Our pickle is prepared using carefully selected fresh ingredients sourced from trusted local farms. Each batch is prepared under hygienic conditions to preserve its authentic taste and freshness.'}
            </Typography>
          </Box>

          {/* Bestsellers Section */}
          <Box className="info-block bestsellers-block">
            <Typography className="info-block-heading">Bestsellers</Typography>
            <Box className="bestsellers-scroll-row">
              {bestSellers.map((item, idx) => (
                <ProductCard
                  key={idx}
                  title={item.title}
                  weight={item.weight}
                  price={item.price}
                  image={item.image}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Floating Cart Bar if cart has items */}
      {cartCount > 0 && (
        <Box className="floating-cart-bar" onClick={handleViewCart}>
          <Typography className="floating-cart-left">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} | {formatCurrency(itemTotal)}
          </Typography>
          <Box className="floating-cart-right">
            <span>View cart</span>
            <ChevronRightIcon fontSize="small" />
          </Box>
        </Box>
      )}

      {/* Bottom Sticky Action Bar */}
      <Box className="sticky-bottom-bar">
        <Box className="price-info">
          <Typography className="bottom-price">{formatCurrency(selectedVariant?.price || product.price)}</Typography>
          <Typography className="taxes-note">(incl. of all taxes)</Typography>
        </Box>
        {productQuantity > 0 ? (
          <Box className="sticky-qty-selector">
            <button
              className="sticky-qty-btn"
              onClick={() => updateQuantity(product.title, -1, selectedVariant?.label || selectedWeight)}
            >
              -
            </button>
            <span className="sticky-qty-count">{productQuantity}</span>
            <button
              className="sticky-qty-btn"
              onClick={() => updateQuantity(product.title, 1, selectedVariant?.label || selectedWeight)}
            >
              +
            </button>
          </Box>
        ) : (
          <Button className="bottom-add-btn" disabled={isOutOfStock} onClick={handleAddProduct}>
            {isOutOfStock ? 'OUT OF STOCK' : 'ADD +'}
          </Button>
        )}
      </Box>
      <Dialog open={Boolean(activeLink)} onClose={() => setActiveLink(null)} fullWidth maxWidth="md"><DialogTitle>{activeLink?.label}</DialogTitle><DialogContent className="in-app-browser"><iframe title={`${activeLink?.label || 'Product'} in-app viewer`} src={activeLink?.label === 'YouTube' ? youtubeEmbedUrl(activeLink?.url) : activeLink?.url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" /></DialogContent><DialogActions><Button onClick={() => setActiveLink(null)}>Close</Button><Button startIcon={<LaunchOutlinedIcon />} onClick={() => window.open(activeLink?.url,'_blank','noopener,noreferrer')}>Open externally</Button></DialogActions></Dialog>
    </Box>
  );
};

export default ProductInfo;
