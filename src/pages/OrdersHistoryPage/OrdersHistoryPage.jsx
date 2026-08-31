import { useState } from 'react';
import { Box, Typography, Button, IconButton, Tabs, Tab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import BottomNav from '../../components/BottomNav/BottomNav';
import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';
import './OrdersHistoryPage.css';

const OrdersHistoryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const completedOrders = [
    {
      id: 'ORD-18765541',
      date: '25 July 2026, 02:15 PM',
      total: 563,
      status: 'Delivered',
      items: [
        { title: 'Gongora Pickle', weight: '250g', price: 159, qty: 1 },
        { title: 'Avakaya Pickle', weight: '500g', price: 199, qty: 2 },
      ],
    },
    {
      id: 'ORD-18751102',
      date: '18 July 2026, 11:30 AM',
      total: 398,
      status: 'Delivered',
      items: [{ title: 'Garlic Spicy Pickle', weight: '250g', price: 179, qty: 2 }],
    },
  ];

  const cancelledOrders = [
    {
      id: 'ORD-18699214',
      date: '10 July 2026, 05:40 PM',
      total: 199,
      status: 'Cancelled',
      reason: 'Cancelled by user',
      items: [{ title: 'Lemon Pickle', weight: '500g', price: 189, qty: 1 }],
    },
  ];

  const displayOrders = activeTab === 0 ? completedOrders : cancelledOrders;

  return (
    <Box className="orders-history-wrapper">
      <Header />

      {/* Header bar */}
      <Box className="orders-history-header">
        <Box className="orders-title-box">
          <IconButton onClick={() => navigate('/home')} style={{ color: '#ffffff' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" className="orders-header-title">
            My Orders History
          </Typography>
        </Box>

        {/* Tabs for Completed & Cancelled */}
        <Box className="orders-tabs-wrap">
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            className="orders-tabs"
            TabIndicatorProps={{ style: { backgroundColor: '#ffffff', height: 3 } }}
          >
            <Tab label="Completed" className="tab-item" />
            <Tab label="Cancelled" className="tab-item" />
          </Tabs>
        </Box>
      </Box>

      {/* Orders List Content */}
      <Box className="orders-history-scroll">
        {displayOrders.length === 0 ? (
          <Box className="empty-orders-view">
            <Typography variant="body1" color="textSecondary">
              No {activeTab === 0 ? 'completed' : 'cancelled'} orders found.
            </Typography>
          </Box>
        ) : (
          displayOrders.map((order, idx) => (
            <Box key={idx} className="order-history-card">
              <Box className="card-top-header">
                <Box className="header-left-info">
                  <Typography className="card-order-id">{order.id}</Typography>
                  <Typography className="card-order-date">{order.date}</Typography>
                </Box>

                <Box className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status === 'Delivered' ? (
                    <CheckCircleIcon className="status-icon" fontSize="small" />
                  ) : (
                    <CancelIcon className="status-icon" fontSize="small" />
                  )}
                  <span>{order.status}</span>
                </Box>
              </Box>

              <Box className="card-items-divider" />

              {/* Order Items */}
              <Box className="order-card-items-list">
                {order.items.map((item, itemIdx) => (
                  <Box key={itemIdx} className="order-card-item-row">
                    <Box className="item-thumb-box">
                      <img src={pickleJarImg} alt={item.title} />
                    </Box>
                    <Box className="item-details-col">
                      <Typography className="item-title">{item.title}</Typography>
                      <Typography className="item-specs">
                        Qty: {item.qty} | {item.weight}
                      </Typography>
                    </Box>
                    <Typography className="item-price">â‚¹{item.price * item.qty}</Typography>
                  </Box>
                ))}
              </Box>

              <Box className="card-bottom-footer">
                <Typography className="order-total-text">
                  Total Paid: <span className="price-bold">â‚¹{order.total}</span>
                </Typography>
                <Button
                  variant="outlined"
                  className="reorder-btn"
                  onClick={() => navigate('/order')}
                >
                  View Details
                </Button>
              </Box>
            </Box>
          ))
        )}
      </Box>

      <BottomNav />
    </Box>
  );
};

export default OrdersHistoryPage;
