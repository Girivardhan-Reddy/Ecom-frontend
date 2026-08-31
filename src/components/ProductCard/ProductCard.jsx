import { useContext } from 'react';
import { Box, Typography, Button, Chip, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';
import './ProductCard.css';

const ProductCard = ({ title, weight, price, image, ...details }) => {
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity, setSelectedProduct, wishlistItems, toggleWishlist, formatCurrency } = useContext(AppContext);
  const cardImage = image || pickleJarImg;

  const cartItem = cartItems.find((item) => item.title === title && item.weight === weight);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlistItems.some((item) => item.title === title);
  const product = { ...details, title, name:details.name || title, weight, price: Number(price), image: cardImage };

  const handleCardClick = () => {
    setSelectedProduct({
      ...details,
      title: title || 'Gongora Pickle',
      subtitle: `Authentic Andhra ${title || 'Gongura Pickle'} | Traditional Recipe`,
      description: details.description || `Freshly prepared ${title || 'Gongura Pickle'} made using handpicked ingredients, traditional Andhra spices, and cold-pressed oil. Rich in flavor with the perfect balance of tanginess and spice, bringing the authentic taste of homemade Andhra cuisine to your dining table.`,
      highlights: [
        `Made with fresh handpicked ingredients for ${title || 'Pickle'}`,
        'Authentic Andhra-style recipe',
        'Traditional spices and cold-pressed oil',
        'No artificial colors or preservatives',
        'Homemade taste and aroma',
        'Hygienically prepared and packed',
      ],
      aboutSource: `Our ${title || 'Pickle'} is prepared using carefully selected fresh ingredients sourced from trusted local farms in Andhra Pradesh. The ingredients are cleaned, processed, and blended with premium spices following traditional homemade methods.\n\nEach batch is prepared under hygienic conditions to preserve its authentic taste, freshness, and nutritional value.`,
      price: price || 159,
      weights: details.weights || [weight || '250g'],
      image: cardImage,
      gallery: details.gallery || [],
    });
    navigate('/product-info');
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart({ id:details.id, title, weight, price, image: cardImage });
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    addToCart({ id:details.id, title, weight, price, image: cardImage });
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(title, -1, weight);
  };

  return (
    <Box className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <Box className="product-image-container">
        <img src={cardImage} alt={title} className="product-card-img" />
        <IconButton
          aria-label={isWishlisted ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
          onClick={(event) => { event.stopPropagation(); toggleWishlist(product); }}
          sx={{ position: 'absolute', top: 4, right: 4, color: isWishlisted ? '#ef4444' : '#64748b' }}
        >
          {isWishlisted ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Box className="product-info">
        <Typography className="product-title">{title}</Typography>
        {details.offerType==='Buy X Get Y'&&<Chip size="small" color="success" label={`Buy ${details.buyQuantity||1}, get ${details.freeQuantity||1} free`} sx={{my:.5}}/>}
        <Box className="product-actions">
          <Box className="product-details">
            <Typography className="product-weight">{weight}</Typography>
            <Typography className="product-price">{formatCurrency(price)}</Typography>
          </Box>
          {quantity === 0 ? (
            <Button variant="contained" className="add-btn" disabled={details.outOfStock} onClick={handleAdd}>
              {details.outOfStock ? 'OUT' : 'ADD'}
            </Button>
          ) : (
            <Box className="qty-control-box">
              <button type="button" className="qty-action-btn" onClick={handleDecrement}>
                -
              </button>
              <Typography className="qty-count-text">{quantity}</Typography>
              <button type="button" className="qty-action-btn" onClick={handleIncrement}>
                +
              </button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProductCard;
