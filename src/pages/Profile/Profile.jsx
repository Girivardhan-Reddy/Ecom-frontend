import { useRef, useState, useContext } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import Header from '../../components/Header/Header';
import BottomNav from '../../components/BottomNav/BottomNav';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PrivacyTipOutlinedIcon from '@mui/icons-material/PrivacyTipOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { profileStore } from '../../services/localDataService';
import { orderStore } from '../../services/localDataService';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, setUser, addresses, deleteAddress, formatDateTime, formatCurrency } = useContext(AppContext);
  const photoInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(Boolean(location.state?.completeProfile));
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth || '',
  });
  const recentOrders = orderStore.list().slice(0, 1);

  const [feedback, setFeedback] = useState('');
  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) return setFeedback('Name is required.');
    if (!/^\+?[\d\s]{10,15}$/.test(profileData.phone)) return setFeedback('Enter a valid mobile number.');
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) return setFeedback('Enter a valid email address.');
    try {
      const saved = await profileStore.update(profileData);
      setProfileData(saved);
      setUser(saved);
      setIsEditing(false);
      setFeedback(addresses.length ? 'Profile information updated successfully.' : 'Profile saved. Add a delivery address to complete your account.');
    } catch (error) {
      setFeedback(error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/intro');
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setFeedback('Please select a valid image file.');
    if (file.size > 2 * 1024 * 1024) return setFeedback('Profile photo must be smaller than 2 MB.');
    const reader = new FileReader();
    reader.onload = async () => {
      const updatedUser = await profileStore.update({ ...profileData, photo: reader.result });
      setUser(updatedUser);
      setFeedback('Profile photo updated successfully.');
    };
    reader.onerror = () => setFeedback('The selected image could not be read.');
    reader.readAsDataURL(file);
  };

  return (
    <Box className="profile-wrapper">
      <Header />
      
      <Box className="profile-content-scroll">
        <Box className="profile-layout">
          
          {/* LEFT SIDEBAR */}
          <Box className="profile-sidebar">
            <Box className="user-summary-card">
              <Box className="user-avatar-placeholder">{user?.photo ? <img src={user.photo} alt={`${profileData.name} profile`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : 'Avatar'}</Box>
              <Box className="user-summary-info">
                <Typography className="user-name">{profileData.name}</Typography>
                <Typography className="user-phone">{profileData.phone}</Typography>
                <Typography className="user-email">{profileData.email}</Typography>
              </Box>
              <Typography className="edit-link" onClick={() => setIsEditing(!isEditing)} style={{ cursor: 'pointer' }}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Typography>
            </Box>

            <Box className="sidebar-menu">
              {[
                { icon: <ShoppingBagOutlinedIcon />, text: 'Orders', path: '/orders' },
                { icon: <LocationOnOutlinedIcon />, text: 'Address', path: '/saved-addresses' },
                { icon: <PrivacyTipOutlinedIcon />, text: 'Privacy policy', path: '/privacy-policy' },
                { icon: <DescriptionOutlinedIcon />, text: 'Terms & Conditions', path: '/terms-conditions' },
                { icon: <HelpOutlineOutlinedIcon />, text: 'Help & Support', path: '/help-center' },
                { icon: <NotificationsNoneOutlinedIcon />, text: 'Notifications', path: '/notifications' },
                { icon: <DeleteOutlineOutlinedIcon />, text: 'Delete account', path: '/delete-account' },
                { icon: <FavoriteBorderOutlinedIcon />, text: 'Wishlist', path: '/wishlist' },
                { icon: <DescriptionOutlinedIcon />, text: 'Ratings & Reviews', path: '/reviews' },
                { icon: <DescriptionOutlinedIcon />, text: 'Rewards & Offers', path: '/rewards' },
                { icon: <DescriptionOutlinedIcon />, text: 'Language & Currency', path: '/settings/language' },
              ].map((item, index) => (
                <Box
                  key={index}
                  className="sidebar-menu-item"
                  onClick={() => item.path && navigate(item.path)}
                  style={{ cursor: item.path ? 'pointer' : 'default' }}
                >
                  <Box className="menu-item-left">
                    {item.icon}
                    <Typography className="menu-item-text">{item.text}</Typography>
                  </Box>
                  <KeyboardArrowRightIcon className="menu-item-arrow" />
                </Box>
              ))}
            </Box>

            <Box className="logout-button" onClick={handleLogout}>
              <LogoutOutlinedIcon className="logout-icon" />
              <Typography className="logout-text">Logout</Typography>
            </Box>
          </Box>

          {/* RIGHT CONTENT */}
          <Box className="profile-main-content">
            
            {/* Profile Information Section */}
            <Box className="content-section">
              {location.state?.completeProfile && <Box sx={{ mb: 2, p: 1.5, bgcolor: '#eef8f3', border: '1px solid #a7d7c1', borderRadius: 1 }}><Typography sx={{ color: '#075F40', fontWeight: 700 }}>Complete your profile</Typography><Typography sx={{ color: '#52635b', fontSize: 13 }}>Add your personal details and a delivery address. You may browse without them, but they are required before ordering.</Typography></Box>}
              <Box className="section-header-row">
                <Typography className="section-title">Profile Information</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                  style={{ borderColor: '#075F40', color: '#075F40', textTransform: 'none', fontWeight: 700 }}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </Box>
              <Divider className="section-divider" />
              {feedback && <Typography role="status" sx={{ color: '#b45309', mb: 2 }}>{feedback}</Typography>}
              
              <Box className="profile-info-grid">
                <Box className="profile-photo-area">
                  <Box className="large-avatar-placeholder">{user?.photo ? <img src={user.photo} alt={`${profileData.name} profile`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : 'Photo'}</Box>
                  <input ref={photoInputRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} />
                  <Button variant="outlined" startIcon={<CameraAltOutlinedIcon />} className="change-photo-btn" onClick={() => photoInputRef.current?.click()}>
                    Change Photo
                  </Button>
                </Box>
                
                <Box className="profile-details-area">
                  <Box className="detail-row">
                    <Box className="detail-item">
                      <Typography className="detail-label">Full Name</Typography>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      ) : (
                        <Typography className="detail-value">{profileData.name}</Typography>
                      )}
                    </Box>
                    <Box className="detail-item">
                      <Typography className="detail-label">Mobile Number</Typography>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      ) : (
                        <Typography className="detail-value">{profileData.phone}</Typography>
                      )}
                    </Box>
                  </Box>
                  <Box className="detail-row">
                    <Box className="detail-item"><Typography className="detail-label">Gender</Typography>{isEditing ? <select value={profileData.gender} onChange={(e) => setProfileData({ ...profileData, gender:e.target.value })} style={{ padding:'6px 10px',borderRadius:6,border:'1px solid #cbd5e1' }}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select> : <Typography className="detail-value">{profileData.gender || 'Not specified'}</Typography>}</Box>
                    <Box className="detail-item"><Typography className="detail-label">Date of Birth</Typography>{isEditing ? <input type="date" value={profileData.dateOfBirth} onChange={(e) => setProfileData({ ...profileData,dateOfBirth:e.target.value })} style={{ padding:'6px 10px',borderRadius:6,border:'1px solid #cbd5e1' }} /> : <Typography className="detail-value">{profileData.dateOfBirth || 'Not specified'}</Typography>}</Box>
                  </Box>
                  <Box className="detail-row">
                    <Box className="detail-item">
                      <Typography className="detail-label">Email Address</Typography>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      ) : (
                        <Typography className="detail-value">{profileData.email}</Typography>
                      )}
                    </Box>
                  </Box>
                  <Box className="detail-row">
                    <Box className="detail-item">
                      <Typography className="detail-label">Member Since</Typography>
                      <Typography className="detail-value flex-align">
                        <DescriptionOutlinedIcon fontSize="small" sx={{ mr: 1, color: '#666' }} /> 
                        12 May 2024
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Addresses Section */}
            <Box className="content-section">
              <Box className="section-header-row">
                <Typography className="section-title">Addresses</Typography>
                <Button size="small" startIcon={<LocationOnOutlinedIcon />} onClick={() => navigate('/address-form', { state: { returnTo: location.state?.returnTo || '/profile' } })} sx={{ color: '#075F40', textTransform: 'none', fontWeight: 700 }}>Add Address</Button>
              </Box>
              <Divider className="section-divider" />
              
              {addresses.length === 0 ? <Box sx={{ py: 1 }}><Typography sx={{ color: '#64748b', mb: 1 }}>No saved addresses. Add your live location, house number and floor.</Typography><Button variant="outlined" onClick={() => navigate('/address-form', { state: { returnTo: location.state?.returnTo || '/profile' } })} sx={{ borderColor: '#075F40', color: '#075F40', textTransform: 'none' }}>Add delivery address</Button></Box> : addresses.slice(0, 1).map((address) => <Box className="address-card" key={address.id}>
                <Box className="address-type">
                  <HomeOutlinedIcon fontSize="small" />
                  <Typography>{address.type}</Typography>
                </Box>
                <Typography className="address-text">
                  {address.address}
                </Typography>
                <Box className="address-actions">
                  <Button startIcon={<EditOutlinedIcon />} className="action-btn edit-btn" onClick={() => navigate('/address-form', { state: { editAddress: address } })}>Edit</Button>
                  <Button startIcon={<DeleteForeverOutlinedIcon />} className="action-btn remove-btn" onClick={() => deleteAddress(address.id)}>Remove</Button>
                </Box>
              </Box>)}
            </Box>

            {/* Recent Orders Section */}
            <Box className="content-section">
              <Box className="section-header-row">
                <Typography className="section-title">Recent Orders</Typography>
                <Typography className="view-all-link" role="button" tabIndex={0} onClick={() => navigate('/orders')}>View All Orders <KeyboardArrowRightIcon fontSize="small" /></Typography>
              </Box>
              <Divider className="section-divider" />
              
              {recentOrders.length === 0 ? <Typography sx={{ color: '#64748b' }}>No recent orders.</Typography> : recentOrders.map((order) => <Box className="order-card" key={order.id} onClick={() => navigate('/order-details', { state: { order } })} style={{ cursor: 'pointer' }}>
                <Box className="order-product-info">
                  <Box className="order-image-placeholder">Img</Box>
                  <Box className="order-details">
                    <Typography className="order-title">{order.items?.[0]?.title || 'Order'}</Typography>
                    <Typography className="order-id">Order ID: {order.id}</Typography>
                    <Typography className="order-date">{formatDateTime(order.createdAt, { dateStyle: 'medium' })}</Typography>
                  </Box>
                </Box>
                <Box className="order-status-price">
                  <Typography className="status-pill delivered">{order.status}</Typography>
                  <Typography className="order-price">{formatCurrency(order.total)} <KeyboardArrowRightIcon fontSize="small" sx={{ ml: 1, color: '#666' }} /></Typography>
                </Box>
              </Box>)}
            </Box>

          </Box>
        </Box>
      </Box>

      <BottomNav />
    </Box>
  );
};

export default Profile;
