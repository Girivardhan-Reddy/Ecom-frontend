import { useContext } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ProductCard from '../../components/ProductCard/ProductCard';
import { AppContext } from '../../context/AppContext';
import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import { hasCompleteProfile } from '../../utils/profileCompletion';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, deliveryAddress, saveItemForLater, savedForLater, restoreSavedItem, formatCurrency, user, addresses } = useContext(AppContext);
  const goToCheckout = () => navigate(hasCompleteProfile(user, addresses) ? '/checkout' : '/profile', { state: { completeProfile: true, returnTo: '/checkout' } });

  const itemTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const handlingFee = cartItems.length > 0 ? 5 : 0;
  const grandTotal = itemTotal + handlingFee;

  const youMayAlsoLike = [
    { title: 'Mango Pickle', weight: '500g', price: '199' },
    { title: 'Lemon Pickle', weight: '500g', price: '199' },
    { title: 'Garlic Pickle', weight: '500g', price: '199' },
  ];

  return (
    <Box className="cart-page-wrapper">
      {/* Header Bar matching screenshot */}
      <Box className="cart-page-header">
        <Box className="cart-header-left">
          <IconButton onClick={() => navigate(-1)} style={{ color: '#ffffff' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" className="cart-page-title">
            Cart
          </Typography>
        </Box>
        <IconButton style={{ color: '#ffffff' }} onClick={() => navigate('/search')} aria-label="Search products">
          <SearchIcon />
        </IconButton>
      </Box>

      {/* Main Scroll Content */}
      <Box className="cart-page-scroll">
        {cartItems.length === 0 ? (
          <Box className="empty-cart-page">
            <Typography variant="h6" color="textSecondary">
              Your cart is empty
            </Typography>
            <Button
              variant="contained"
              className="shop-now-btn"
              onClick={() => navigate('/home')}
            >
              Shop Now
            </Button>
          </Box>
        ) : (
          <Box className="cart-items-container">
            {cartItems.map((item, idx) => (
              <Box key={idx} className="cart-slot-card">
                <Box className="slot-banner">
                  <span className="slot-text">
                    {idx === 0 ? 'Instant delivery available' : 'Tomorrow delivery available'}
                  </span>
                  <Button className="change-slot-btn" endIcon={<EditOutlinedIcon fontSize="small" />} onClick={goToCheckout}>
                    Change Slot
                  </Button>
                </Box>

                <Box className="slot-item-body">
                  <Box className="slot-item-img">
                    <img src={item.image || pickleJarImg} alt={item.title} />
                  </Box>
                  <Box className="slot-item-info">
                    <Typography className="slot-item-title">{item.title}</Typography>
                    <Typography className="slot-item-weight">{item.weight}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}><Button size="small" onClick={() => saveItemForLater(item)} sx={{ p: 0, minWidth: 0, textTransform: 'none' }}>Save for later</Button><Button size="small" color="error" onClick={() => removeFromCart(item.title, item.weight)} sx={{ p: 0, minWidth: 0, textTransform: 'none' }}>Remove</Button></Box>
                    <Typography className="slot-item-price">{formatCurrency(item.price)}</Typography>
                  </Box>

                  <Box className="slot-qty-selector">
                    <button
                      className="slot-qty-btn"
                      onClick={() => updateQuantity(item.title, -1, item.weight)}
                    >
                      -
                    </button>
                    <span className="slot-qty-count">{item.quantity}</span>
                    <button
                      className="slot-qty-btn"
                      onClick={() => updateQuantity(item.title, 1, item.weight)}
                    >
                      +
                    </button>
                  </Box>
                </Box>
              </Box>
            ))}

            {savedForLater.length > 0 && <Box className="you-may-like-section"><Typography className="section-title-bold">Saved for Later</Typography>{savedForLater.map((item) => <Box key={item.title} sx={{ display:'flex',justifyContent:'space-between',alignItems:'center',py:1 }}><Typography>{item.title} · {item.weight}</Typography><Button onClick={() => restoreSavedItem(item)}>Move to Cart</Button></Box>)}</Box>}

            {/* You May Also Like Section */}
            <Box className="you-may-like-section">
              <Typography className="section-title-bold">You May Also Like</Typography>
              <Box className="like-items-row">
                {youMayAlsoLike.map((prod, i) => (
                  <ProductCard key={i} title={prod.title} weight={prod.weight} price={prod.price} />
                ))}
              </Box>
            </Box>

            {/* Bill Summary Section */}
            <Box className="cart-bill-summary-card">
              <Box className="bill-divider-header">
                <Typography className="bill-section-title">Bill Summary</Typography>
                <Box className="bill-title-line" />
              </Box>

              <Box className="bill-data-row">
                <Typography className="bill-item-label">Item total</Typography>
                <Typography className="bill-item-value">{formatCurrency(itemTotal)}</Typography>
              </Box>

              <Box className="bill-data-row">
                <Typography className="bill-item-label">Delivery Fee</Typography>
                <Typography className="bill-item-free">Free</Typography>
              </Box>

              <Box className="bill-data-row">
                <Typography className="bill-item-label">Handling Fee</Typography>
                <Typography className="bill-item-value">{formatCurrency(handlingFee)}</Typography>
              </Box>

              <Box className="grand-total-row">
                <Typography className="grand-total-label">Amount to be paid</Typography>
                <Typography className="grand-total-value">{formatCurrency(grandTotal)}</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Sticky Bottom Delivery Address & Action Footer */}
      {cartItems.length > 0 && (
        <Box className="cart-sticky-footer">
          {/* Top Address Bar */}
          <Box className="delivery-address-row">
            <Box className="address-info-col">
              <Box className="address-header-line">
                <HomeOutlinedIcon className="address-home-icon" />
                <Typography className="delivering-to-label">Delivering to <span className="address-tag">Home</span></Typography>
              </Box>
              <Typography className="address-full-text">
                {deliveryAddress}
              </Typography>
            </Box>
            <Button
              className="change-address-btn"
              onClick={() => navigate('/address-map')}
              startIcon={<EditOutlinedIcon fontSize="small" />}
            >
              Change
            </Button>
          </Box>

          {/* Bottom Action Row */}
          <Box className="checkout-action-row">
            <Box className="total-pay-col">
              <Typography className="total-pay-amount">{formatCurrency(grandTotal)}</Typography>
              <Typography className="view-bill-text">TOTAL AMOUNT</Typography>
            </Box>

            <Button
              variant="contained"
              className="proceed-pay-btn"
              onClick={goToCheckout}
            >
              Proceed to Pay
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CartPage;
