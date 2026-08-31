import { useContext } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';
import splashImg from '../../assets/images/splash-image.png';
import './OrderPage.css';

const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, deliveryAddress, formatCurrency } = useContext(AppContext);
  const order = location.state?.order;

  const itemTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const grandTotal = order?.total ?? (itemTotal > 0 ? itemTotal + 5 : 0);

  const displayItems = order?.items || cartItems;
  const paymentPaid = ['PAID', 'Paid'].some((value) => order?.paymentStatus?.startsWith(value));

  return (
    <Box className="order-page-wrapper">
      {/* Header Bar matching screenshot */}
      <Box className="order-page-header">
        <Box className="order-header-left">
          <IconButton onClick={() => navigate('/home')} style={{ color: '#ffffff' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography className="order-header-title">
            Order ID: {order?.id || 'Pending'}
          </Typography>
        </Box>
        <Typography className="help-link" onClick={() => navigate('/help-center')}>Help</Typography>
      </Box>

      {/* Main Scroll Content */}
      <Box className="order-page-scroll">
        {location.state?.paymentSuccess && order?.payment && <Box className="payment-due-card" sx={{ borderColor:'#8ac9ad',background:'#f0fdf7' }}><Box><Typography className="due-title">Payment Successful</Typography><Typography className="due-desc">Your Razorpay Test Mode payment was verified securely.</Typography><Typography variant="caption" display="block">Payment ID: {order.payment.razorpayPaymentId}</Typography><Typography variant="caption" display="block">Razorpay Order ID: {order.payment.razorpayOrderId}</Typography><Typography fontWeight={800}>{formatCurrency(order.payment.amount)}</Typography></Box></Box>}
        {/* Card 1: Order status & Illustration */}
        <Box className="order-status-card">
          <Typography className="status-subtitle">Order is being Packed</Typography>
          <Typography className="arriving-text">Arriving in</Typography>

          <Box className="time-pill">
            <Typography className="time-pill-text">29 mins - On time</Typography>
          </Box>

          <Box className="packing-illustration-wrap">
            <img src={splashImg} alt="Packing illustration" className="packing-img" />
          </Box>
        </Box>

        {/* Card 2: Payment Due status */}
        <Box className="payment-due-card">
          <Box className="due-card-left">
            <Box className="wallet-icon-box">{paymentPaid ? 'OK' : 'PAY'}</Box>
            <Box className="due-text-box">
              <Typography className="due-title">{paymentPaid ? 'Payment Successful' : 'Payment Due'}</Typography>
              <Typography className="due-desc">
                {paymentPaid ? `Paid using ${order?.paymentMethod === 'razorpay-demo' ? 'Razorpay Demo' : order?.paymentMethod}` : 'Pay online anytime or pay at the time of delivery'}
              </Typography>
            </Box>
          </Box>
          {!paymentPaid && <Button variant="contained" className="due-pay-btn" onClick={() => navigate('/payment-options')}>
            Pay {formatCurrency(grandTotal)}
          </Button>}
        </Box>

        {/* Card 3: Delivery Address */}
        <Box className="order-address-card">
          <LocationOnIcon className="location-pin-icon" />
          <Typography className="order-address-text">
            {order?.checkout?.method === 'pickup' ? <><strong>Pickup:</strong> {order.checkout.pickupStore}</> : <><strong>Delivery:</strong> {order?.checkout?.deliveryAddress || deliveryAddress}</>}
          </Typography>
        </Box>

        {/* Card 4: Welcome Offer Promo Banner */}
        <Box className="welcome-promo-card">
          <Box className="promo-left-col">
            <Typography className="welcome-offer-tag">âœ¨ Welcome Offer âœ¨</Typography>
            <Typography className="discount-heading">
              Get <span className="highlight-percent">20% OFF</span>
            </Typography>
            <Typography className="promo-badge-btn">ON FIRST 3 ORDERS</Typography>
          </Box>
          <Box className="promo-img-wrap">
            <img src={pickleJarImg} alt="Promo Jar" className="promo-jar-img" />
          </Box>
        </Box>

        {/* Card 5: Your Order Summary */}
        <Box className="order-summary-card">
          <Box className="summary-header">
            <ReceiptLongIcon className="summary-icon" />
            <Typography className="summary-title">Your Order Summary</Typography>
          </Box>

          <Box className="summary-items-list">
            {displayItems.map((item, idx) => (
              <Box key={idx} className="summary-item-row">
                <Box className="summary-thumb-box">
                  <img src={item.image || pickleJarImg} alt={item.title} />
                </Box>

                <Box className="summary-item-details">
                  <Typography className="summary-item-title">{item.title}</Typography>
                  <Typography className="summary-item-weight">{item.weight}</Typography>
                </Box>

                <Typography className="summary-item-price">{formatCurrency(Number(item.price) * Number(item.quantity || 1))}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderPage;
