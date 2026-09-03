import { useContext, useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import BottomNav from '../../components/BottomNav/BottomNav';
import ProductCard from '../../components/ProductCard/ProductCard';
import { AppContext } from '../../context/AppContext';
import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';
import { cancelOrder, getOrder, getOrderItems, isOrderServiceUnavailable, normalizeOrder } from '../../services/orderApi';
import './OrderDetailViewPage.css';

const formatAddress = (address) => address ? [address.addressLine1, address.city, address.state, address.country, address.postalCode].filter(Boolean).join(', ') : '';

const OrderDetailViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: routeOrderId } = useParams();
  const { addToCart, catalogProducts, formatCurrency, user } = useContext(AppContext);
  const [order, setOrder] = useState(location.state?.order ? normalizeOrder(location.state.order) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const [canceling, setCanceling] = useState(false);
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

  const handleCancel = async () => {
    if (!order?.id) return;
    setCanceling(true);
    setError('');
    try {
      const updated = normalizeOrder(await cancelOrder(order.id));
      setOrder(updated);
      navigate('/orders');
    } catch (apiError) {
      setUnavailable(isOrderServiceUnavailable(apiError));
      setError(isOrderServiceUnavailable(apiError) ? 'Order Service is unavailable. Please try again when backend is online.' : apiError.message);
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <Box className="order-detail-wrapper"><Header /><Box className="order-detail-header"><IconButton onClick={() => navigate(-1)} style={{ color: '#ffffff' }}><ArrowBackIcon /></IconButton><Typography variant="h6" className="order-detail-title">Order Details</Typography></Box><Box sx={{ p: 3 }}><Typography role="status">Loading order details...</Typography></Box><BottomNav /></Box>;
  if (error && !order) return <Box className="order-detail-wrapper"><Header /><Box className="order-detail-header"><IconButton onClick={() => navigate('/orders')} style={{ color: '#ffffff' }}><ArrowBackIcon /></IconButton><Typography variant="h6" className="order-detail-title">Order Details</Typography></Box><Box sx={{ p: 3 }}><Typography role="alert" color={unavailable ? 'error' : 'text.secondary'}>{error}</Typography><Button sx={{ mt: 2 }} onClick={() => navigate('/orders')}>View Orders</Button></Box><BottomNav /></Box>;
  if (!order) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="h6">No order selected</Typography><Button onClick={() => navigate('/orders')}>View Orders</Button></Box>;

  const firstItem = order.items[0] || {};
  const title = firstItem.title || 'Order';
  const price = order.totalAmount;
  const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Date unavailable';
  const image = firstItem.image || pickleJarImg;
  const customer = order.customer || user || {};
  const deliveryAddress = formatAddress(order.shippingAddress);
  const suggestions = catalogProducts.filter((product) => product.productId !== firstItem.productId).slice(0, 3);
  const downloadInvoice = () => {
    const invoice = [`Invoice: ${order.id}`, `Date: ${date}`, `Amount: ${formatCurrency(price)}`, `Status: ${order.status}`].join('\n');
    const url = URL.createObjectURL(new Blob([invoice], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.id}-invoice.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box className="order-detail-wrapper">
      <Header />
      <Box className="order-detail-header">
        <IconButton onClick={() => navigate(-1)} style={{ color: '#ffffff' }}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" className="order-detail-title">Order Details</Typography>
      </Box>

      <Box className="order-detail-scroll">
        {error && <Typography role="alert" color={unavailable ? 'error' : 'text.secondary'}>{error}</Typography>}
        <Box className="product-summary-card">
          <Box className="card-item-left"><img src={image} alt={title} className="purchased-img" /></Box>
          <Box className="card-item-info">
            <Typography className="purchased-title">{title}</Typography>
            <Typography className="purchased-weight">{order.items.length} item{order.items.length === 1 ? '' : 's'}</Typography>
            <Typography className="purchased-price">{formatCurrency(price)}</Typography>
            <Typography className="purchased-id">Order ID :{order.id}</Typography>
            <Button variant="contained" className="reorder-primary-btn" disabled={!firstItem.productId} onClick={() => addToCart({ productId: firstItem.productId, variantId: firstItem.variantId ?? null, title: firstItem.title, price: firstItem.unitPrice })}>REORDER</Button>
          </Box>
        </Box>

        <Box className="delivery-status-card">
          <Box className="status-card-left">
            <span className="box-icon">BOX</span>
            <Box className="status-text-col">
              <Typography className="delivered-bold-title">Order {order.status}</Typography>
              <Typography className="delivered-date-sub">Ordered on : {date}</Typography>
            </Box>
          </Box>
          <Box className="delivered-stamp">{order.status}</Box>
        </Box>

        <Box className="you-may-like-wrap">
          <Typography className="section-heading-bold">You May Also Like</Typography>
          <Box className="like-items-row">
            {suggestions.map((product) => <ProductCard key={product.productId || product.id} {...product} />)}
          </Box>
        </Box>

        <Box className="receiver-info-card">
          <Box className="info-detail-row"><PersonOutlineOutlinedIcon className="info-row-icon" /><Box className="info-col"><Typography className="info-label-sub">Delivery To</Typography><Typography className="info-value-bold">{customer.name || 'Customer'}</Typography></Box></Box>
          <Box className="info-detail-row"><LocalPhoneOutlinedIcon className="info-row-icon" /><Box className="info-col"><Typography className="info-label-sub">Contact details</Typography><Typography className="info-value-bold">{customer.phone || 'Unavailable'}</Typography></Box></Box>
          <Box className="info-detail-row"><HomeOutlinedIcon className="info-row-icon" /><Box className="info-col"><Typography className="info-label-sub">Delivery Address</Typography><Typography className="info-value-bold">{deliveryAddress || 'Unavailable'}</Typography></Box></Box>
        </Box>

        <Box className="total-order-card">
          <Box className="price-top-row">
            <Typography className="total-price-label">Total Order Price</Typography>
            <Box className="total-price-value-wrap"><Typography className="total-price-val">{formatCurrency(price)}</Typography><KeyboardArrowDownIcon className="arrow-down" /></Box>
          </Box>
          <Box className="payment-method-bar"><span className="upi-icon">PAY</span><Typography className="upi-text">{order.paymentStatus}</Typography></Box>
          <Button variant="outlined" fullWidth className="get-invoice-btn" onClick={downloadInvoice}>Get Invoice</Button>
          {!['DELIVERED', 'CANCELLED'].includes(order.status) && <Button color="error" fullWidth disabled={canceling} onClick={handleCancel}>{canceling ? 'Cancelling...' : 'Cancel Order'}</Button>}
        </Box>
      </Box>

      <BottomNav />
    </Box>
  );
};

export default OrderDetailViewPage;
