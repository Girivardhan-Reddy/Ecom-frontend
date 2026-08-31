import { useState } from 'react';
import { Box, Typography, Button, IconButton, InputBase, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import BottomNav from '../../components/BottomNav/BottomNav';
import { orderStore } from '../../services/localDataService';
import './OrdersListPage.css';

const OrdersListPage = () => {
  const navigate = useNavigate();

  const initialOrders = orderStore.list().map((order) => ({
    ...order,
    title: order.items[0]?.title || 'Order',
    weight: order.items[0]?.weight || `${order.items.length} items`,
    price: order.total,
    date: new Date(order.createdAt).toLocaleString(),
    image: order.items[0]?.image,
  }));

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTime, setSelectedTime] = useState('Anytime');

  // Applied filter state
  const [appliedStatus, setAppliedStatus] = useState('All');
  const [appliedTime, setAppliedTime] = useState('Anytime');

  const handleApplyFilters = () => {
    setAppliedStatus(selectedStatus);
    setAppliedTime(selectedTime);
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedStatus('All');
    setSelectedTime('Anytime');
    setAppliedStatus('All');
    setAppliedTime('Anytime');
    setIsFilterModalOpen(false);
  };

  // Filter computation
  const filteredOrders = initialOrders.filter((order) => {
    // 1. Search Query filter (matches title or order id)
    const matchesSearch =
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Status filter
    const matchesStatus =
      appliedStatus === 'All' ||
      order.status.toLowerCase() === appliedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <Box className="orders-list-wrapper">
      <Header />

      {/* Header bar matching screenshot Orders */}
      <Box className="orders-list-header">
        <IconButton onClick={() => navigate('/profile')} style={{ color: '#ffffff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" className="orders-header-title">
          Orders
        </Typography>
      </Box>

      {/* Search & Filter Bar */}
      <Box className="orders-search-filter-bar">
        <Box className="orders-search-input-box">
          <SearchIcon className="search-icon-gray" />
          <InputBase
            placeholder="Search for orders"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="orders-search-input"
          />
          {searchQuery && (
            <IconButton size="small" onClick={() => setSearchQuery('')}>
              <CloseIcon style={{ fontSize: 16, color: '#94a3b8' }} />
            </IconButton>
          )}
        </Box>
        <IconButton className="filter-tune-btn" onClick={() => setIsFilterModalOpen(true)}>
          <TuneIcon style={{ color: '#075F40' }} />
        </IconButton>
      </Box>

      {/* Active Filter Chips indicator */}
      {(appliedStatus !== 'All' || appliedTime !== 'Anytime') && (
        <Box className="applied-filter-bar">
          <Typography className="filter-chip-text">
            Filter: {appliedStatus !== 'All' ? appliedStatus : ''}{' '}
            {appliedTime !== 'Anytime' ? `â€¢ ${appliedTime}` : ''}
          </Typography>
          <Button size="small" className="reset-chip-btn" onClick={handleClearFilters}>
            Reset
          </Button>
        </Box>
      )}

      {/* Orders List View */}
      <Box className="orders-list-scroll">
        {filteredOrders.length === 0 ? (
          <Box className="no-orders-box">
            <Typography variant="body1" color="textSecondary">
              No orders matching your criteria.
            </Typography>
          </Box>
        ) : (
          filteredOrders.map((order, idx) => (
            <Box
              key={order.id || idx}
              className="order-card-row"
              onClick={() => navigate('/order-details', { state: { order } })}
            >
              <Box className="order-thumb-wrap">
                <img src={order.image} alt={order.title} />
              </Box>

              <Box className="order-info-col">
                <Box className="order-top-line">
                  <Typography className="order-item-name">{order.title}</Typography>
                  <Typography className="order-item-price">â‚¹{order.price}</Typography>
                </Box>
                <Typography className="order-item-weight">{order.weight}</Typography>
                <Typography className="order-date-note">
                  Ordered on : {order.date}
                </Typography>
              </Box>

              <span className={`status-pill-chip ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {order.status}
              </span>
            </Box>
          ))
        )}
      </Box>

      {/* Filter Orders Modal matching screenshot */}
      {isFilterModalOpen && (
        <Box className="filter-modal-backdrop">
          <Box className="filter-modal-card">
            {/* Modal Header */}
            <Box className="filter-modal-header">
              <Typography className="filter-modal-title">Filter Orders</Typography>
              <IconButton onClick={() => setIsFilterModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Modal Scroll Content */}
            <Box className="filter-modal-body">
              <Box className="filter-sections-side-by-side">
                {/* Status Section */}
                <Box className="filter-section">
                  <Typography className="filter-section-label">status</Typography>
                  <RadioGroup
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="filter-radio-group"
                  >
                    {['All', 'On the way', 'Delivered', 'Cancelled', 'Returned'].map((status) => (
                      <FormControlLabel
                        key={status}
                        value={status}
                        control={<Radio className="green-radio" />}
                        label={status}
                        className="filter-radio-label"
                      />
                    ))}
                  </RadioGroup>
                </Box>

                <Box className="filter-vertical-divider" />

                {/* Time Section */}
                <Box className="filter-section">
                  <Typography className="filter-section-label">Time</Typography>
                  <RadioGroup
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="filter-radio-group"
                  >
                    {['Anytime', 'Last 30 days', 'Last 6 Months', 'Last year'].map((time) => (
                      <FormControlLabel
                        key={time}
                        value={time}
                        control={<Radio className="green-radio" />}
                        label={time}
                        className="filter-radio-label"
                      />
                    ))}
                  </RadioGroup>
                </Box>
              </Box>
            </Box>

            {/* Modal Footer Buttons */}
            <Box className="filter-modal-footer">
              <Button variant="outlined" className="clear-filters-btn" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              <Button variant="contained" className="apply-filters-btn" onClick={handleApplyFilters}>
                Apply
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <BottomNav />
    </Box>
  );
};

export default OrdersListPage;
