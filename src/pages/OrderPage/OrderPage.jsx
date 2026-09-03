import { useContext, useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';
import splashImg from '../../assets/images/splash-image.png';
import { getOrder, getOrderItems, isOrderServiceUnavailable, normalizeOrder } from '../../services/orderApi';
import './OrderPage.css';

const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: routeOrderId } = useParams();
  const { deliveryAddress, formatCurrency } = useContext(AppContext);
  const [order, setOrder] = useState(location.state?.order ? normalizeOrder(location.state.order) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const requestedOrderId = routeOrderId || location.state?.orderId || location.state?.order?.id;

  useEffect(() => {
    if (!requestedOrderId) {
      return undefined;
    }
    let ignore = false;
    const timer = window.setTimeout(() => {
      if (!ignore) {
        setLoading(true);
        setError('');
      }
    }, 0);
    Promise.resolve().then(() => Promise.all([getOrder(requestedOrderId), getOrderItems(requestedOrderId).catch(() => null)]))
      .then(([orderResponse, itemsResponse]) => {
        if (ignore) return;
        const items = Array.isArray(itemsResponse) ? itemsResponse : itemsResponse?.items;
        setOrder(normalizeOrder(items ? { ...orderResponse, items } : orderResponse));
        setUnavailable(false);
      })
      .catch((apiError) => {
        if (ignore) return;
        setOrder(null);
        setUnavailable(isOrderServiceUnavailable(apiError));
        setError(isOrderServiceUnavailable(apiError) ? 'Order Service is unavailable. Please try again when backend is online.' : apiError.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; window.clearTimeout(timer); };
  }, [requestedOrderId]);

  const grandTotal = Number(order?.totalAmount || 0);
  const displayItems = order?.items || [];
  const paymentPaid = order?.paymentStatus === 'PAID';
  const shippingAddress = order?.shippingAddress;
  const addressText = shippingAddress
    ? [shippingAddress.addressLine1, shippingAddress.city, shippingAddress.state, shippingAddress.country, shippingAddress.postalCode].filter(Boolean).join(', ')
    : deliveryAddress;

  if (loading) return <Box className="order-page-wrapper"><Box className="order-page-header"><IconButton onClick={() => navigate('/home')} style={{ color: '#ffffff' }}><ArrowBackIcon /></IconButton><Typography className="order-header-title">Loading order</Typography></Box><Box sx={{ p: 3 }}><Typography role="status">Loading order details...</Typography></Box></Box>;
  if (error) return <Box className="order-page-wrapper"><Box className="order-page-header"><IconButton onClick={() => navigate('/orders')} style={{ color: '#ffffff' }}><ArrowBackIcon /></IconButton><Typography className="order-header-title">Order unavailable</Typography></Box><Box sx={{ p: 3 }}><Typography role="alert" color={unavailable ? 'error' : 'text.secondary'}>{error}</Typography><Button sx={{ mt: 2 }} onClick={() => navigate('/orders')}>View Orders</Button></Box></Box>;
  if (!order) return <Box className="order-page-wrapper"><Box className="order-page-header"><IconButton onClick={() => navigate('/orders')} style={{ color: '#ffffff' }}><ArrowBackIcon /></IconButton><Typography className="order-header-title">Order</Typography></Box><Box sx={{ p: 3 }}><Typography>No order selected.</Typography><Button sx={{ mt: 2 }} onClick={() => navigate('/orders')}>View Orders</Button></Box></Box>;

  return (
    <Box className="order-page-wrapper">
      <Box className="order-page-header">
        <Box className="order-header-left">
          <IconButton onClick={() => navigate('/home')} style={{ color: '#ffffff' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography className="order-header-title">Order ID: {order.id}</Typography>
        </Box>
        <Typography className="help-link" onClick={() => navigate('/help-center')}>Help</Typography>
      </Box>

      <Box className="order-page-scroll">
        <Box className="order-status-card">
          <Typography className="status-subtitle">Order Status: {order.status}</Typography>
          <Typography className="arriving-text">Payment: {order.paymentStatus}</Typography>

          <Box className="time-pill">
            <Typography className="time-pill-text">{order.status}</Typography>
          </Box>

          <Box className="packing-illustration-wrap">
            <img src={splashImg} alt="Packing illustration" className="packing-img" />
          </Box>
        </Box>

        <Box className="payment-due-card">
          <Box className="due-card-left">
            <Box className="wallet-icon-box">{paymentPaid ? 'OK' : 'PAY'}</Box>
            <Box className="due-text-box">
              <Typography className="due-title">{paymentPaid ? 'Payment Successful' : 'Payment Due'}</Typography>
              <Typography className="due-desc">{paymentPaid ? `Paid using ${order.paymentMethod || 'selected method'}` : 'Payment is awaiting confirmation'}</Typography>
            </Box>
          </Box>
          {!paymentPaid && <Button variant="contained" className="due-pay-btn" onClick={() => navigate('/payment-options')}>Pay {formatCurrency(grandTotal)}</Button>}
        </Box>

        <Box className="order-address-card">
          <LocationOnIcon className="location-pin-icon" />
          <Typography className="order-address-text"><strong>Delivery:</strong> {addressText || 'Address unavailable'}</Typography>
        </Box>

        <Box className="welcome-promo-card">
          <Box className="promo-left-col">
            <Typography className="welcome-offer-tag">Welcome Offer</Typography>
            <Typography className="discount-heading">Get <span className="highlight-percent">20% OFF</span></Typography>
            <Typography className="promo-badge-btn">ON FIRST 3 ORDERS</Typography>
          </Box>
          <Box className="promo-img-wrap">
            <img src={pickleJarImg} alt="Promo Jar" className="promo-jar-img" />
          </Box>
        </Box>

        <Box className="order-summary-card">
          <Box className="summary-header">
            <ReceiptLongIcon className="summary-icon" />
            <Typography className="summary-title">Your Order Summary</Typography>
          </Box>

          <Box className="summary-items-list">
            {displayItems.length === 0 ? <Typography color="text.secondary">No order items were returned.</Typography> : displayItems.map((item, idx) => (
              <Box key={`${item.productId || idx}:${item.variantId ?? 'product'}`} className="summary-item-row">
                <Box className="summary-thumb-box">
                  <img src={item.image || pickleJarImg} alt={item.title} />
                </Box>

                <Box className="summary-item-details">
                  <Typography className="summary-item-title">{item.title}</Typography>
                  <Typography className="summary-item-weight">Qty: {item.quantity}</Typography>
                </Box>

                <Typography className="summary-item-price">{formatCurrency(item.totalPrice)}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderPage;
