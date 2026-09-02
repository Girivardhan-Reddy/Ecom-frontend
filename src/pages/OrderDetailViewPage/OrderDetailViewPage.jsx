import { useContext } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header/Header';
import BottomNav from '../../components/BottomNav/BottomNav';
import ProductCard from '../../components/ProductCard/ProductCard';
import { AppContext } from '../../context/AppContext';
import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';
import { orderStore } from '../../services/localDataService';
import './OrderDetailViewPage.css';

const OrderDetailViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useContext(AppContext);

  const storedOrder = location.state?.order || orderStore.list()[0];
  const order = storedOrder ? {
    ...storedOrder,
    title: storedOrder.title || storedOrder.items?.[0]?.title || 'Order',
    weight: storedOrder.weight || storedOrder.items?.[0]?.weight || `${storedOrder.items?.length || 0} items`,
    price: storedOrder.price ?? storedOrder.total,
    date: storedOrder.date || new Date(storedOrder.createdAt).toLocaleString(),
    image: storedOrder.image || storedOrder.items?.[0]?.image || pickleJarImg,
    productId: storedOrder.productId || storedOrder.items?.[0]?.productId,
    variantId: storedOrder.variantId || storedOrder.items?.[0]?.variantId,
  } : null;

  const youMayAlsoLike = [
    { title: 'Mango Pickle', weight: '500g', price: '199' },
    { title: 'Lemon Pickle', weight: '500g', price: '199' },
    { title: 'Garlic Pickle', weight: '500g', price: '199' },
  ];
  const downloadInvoice = () => {
    const invoice = [`Invoice: ${order.id}`, `Date: ${order.date}`, `Item: ${order.title}`, `Amount: ₹${order.price}`, `Status: ${order.status}`].join('\n');
    const url = URL.createObjectURL(new Blob([invoice], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url; link.download = `${order.id}-invoice.txt`; link.click(); URL.revokeObjectURL(url);
  };

  if (!order) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="h6">No order selected</Typography><Button onClick={() => navigate('/orders')}>View Orders</Button></Box>;

  return (
    <Box className="order-detail-wrapper">
      <Header />

      {/* Header bar matching screenshot Order Details */}
      <Box className="order-detail-header">
        <IconButton onClick={() => navigate(-1)} style={{ color: '#ffffff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" className="order-detail-title">
          Order Details
        </Typography>
      </Box>

      {/* Scrollable Content */}
      <Box className="order-detail-scroll">
        {/* Main Purchased Product Card */}
        <Box className="product-summary-card">
          <Box className="card-item-left">
            <img src={order.image} alt={order.title} className="purchased-img" />
          </Box>
          <Box className="card-item-info">
            <Typography className="purchased-title">{order.title}</Typography>
            <Typography className="purchased-weight">{order.weight}</Typography>
            <Typography className="purchased-price">â‚¹{order.price}</Typography>
            <Typography className="purchased-id">Order ID :{order.id}</Typography>

            <Button
              variant="contained"
              className="reorder-primary-btn"
              onClick={() =>
                addToCart({
                  id: order.title,
                  productId: order.productId,
                  variantId: order.variantId,
                  title: order.title,
                  weight: order.weight,
                  price: Number(order.price),
                })
              }
            >
              REORDER
            </Button>
          </Box>
        </Box>

        {/* Item Delivered Badge Card */}
        <Box className="delivery-status-card">
          <Box className="status-card-left">
            <span className="box-icon">ðŸ“¦</span>
            <Box className="status-text-col">
              <Typography className="delivered-bold-title">Item Delivered</Typography>
              <Typography className="delivered-date-sub">
                Ordered on : {order.date}
              </Typography>
            </Box>
          </Box>
          <Box className="delivered-stamp">DELIVERED</Box>
        </Box>

        {/* You May Also Like Section */}
        <Box className="you-may-like-wrap">
          <Typography className="section-heading-bold">You May Also Like</Typography>
          <Box className="like-items-row">
            {youMayAlsoLike.map((prod, i) => (
              <ProductCard key={i} title={prod.title} weight={prod.weight} price={prod.price} />
            ))}
          </Box>
        </Box>

        {/* Receiver & Delivery Information Card */}
        <Box className="receiver-info-card">
          <Box className="info-detail-row">
            <PersonOutlineOutlinedIcon className="info-row-icon" />
            <Box className="info-col">
              <Typography className="info-label-sub">Delivery To</Typography>
              <Typography className="info-value-bold">Kalyan</Typography>
            </Box>
          </Box>

          <Box className="info-detail-row">
            <LocalPhoneOutlinedIcon className="info-row-icon" />
            <Box className="info-col">
              <Typography className="info-label-sub">Contact details</Typography>
              <Typography className="info-value-bold">9876543210</Typography>
            </Box>
          </Box>

          <Box className="info-detail-row">
            <HomeOutlinedIcon className="info-row-icon" />
            <Box className="info-col">
              <Typography className="info-label-sub">Delivery Address</Typography>
              <Typography className="info-value-bold">
                Dno: 401, indira nagar, colony, statue, Gachibowli circle, 530026
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Total Order Price Footer Card */}
        <Box className="total-order-card">
          <Box className="price-top-row">
            <Typography className="total-price-label">Total Order Price</Typography>
            <Box className="total-price-value-wrap">
              <Typography className="total-price-val">â‚¹{order.price}</Typography>
              <KeyboardArrowDownIcon className="arrow-down" />
            </Box>
          </Box>

          <Box className="payment-method-bar">
            <span className="upi-icon">ðŸ’³</span>
            <Typography className="upi-text">Paid by UPI</Typography>
          </Box>

          <Button variant="outlined" fullWidth className="get-invoice-btn" onClick={downloadInvoice}>
            Get Invoice
          </Button>
          {!['Delivered','Cancelled','Returned'].includes(order.status) && <Button color="error" fullWidth onClick={() => { orderStore.updateStatus(order.id,'Cancelled'); navigate('/orders'); }}>Cancel Order</Button>}
          {order.status === 'Delivered' && <Button fullWidth onClick={() => { orderStore.updateStatus(order.id,'Returned'); navigate('/orders'); }}>Request Return</Button>}
        </Box>
      </Box>

      <BottomNav />
    </Box>
  );
};

export default OrderDetailViewPage;
