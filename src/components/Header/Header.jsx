import { useContext } from 'react';
import { Box, Typography, InputBase, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TranslateIcon from '@mui/icons-material/Translate';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useAnimatedPlaceholder } from '../../hooks/useAnimatedPlaceholder';
import logo from '../../assets/images/logo.png';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const animatedPlaceholder = useAnimatedPlaceholder();
  const { isLoggedIn, user, cartCount, openCart, userCity, homeSearchQuery, setHomeSearchQuery, t, locale } = useContext(AppContext);

  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate('/cart');
    } else {
      openCart();
    }
  };

  return (
    <Box className="header-container">
      <Box className="header-left">
        <img src={logo} alt="Pickles & Spices" className="header-logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }} />
        
        {isLoggedIn && (
          <Box className="header-user-info">
            <Typography className="greeting">Hi, {user?.name || 'Customer'}</Typography>
            <Box className="delivery-location" onClick={() => navigate('/address-map')} style={{ cursor: 'pointer' }}>
              <Typography className="deliver-to">Deliver to: <span className="location">{userCity || 'Jubliee Hills, Hyderabad'}</span></Typography>
              <KeyboardArrowDownIcon className="arrow-down" />
            </Box>
          </Box>
        )}
      </Box>

      <Box className="header-search">
        <Box className="search-box">
          <InputBase
            placeholder={animatedPlaceholder}
            className="search-input"
            value={homeSearchQuery}
            onChange={(e) => setHomeSearchQuery(e.target.value)}
          />
          {homeSearchQuery ? (
            <CloseIcon
              onClick={() => setHomeSearchQuery('')}
              style={{ color: '#64748b', fontSize: 18, cursor: 'pointer', marginLeft: 4 }}
            />
          ) : (
            <SearchIcon className="search-icon" />
          )}
        </Box>
      </Box>

      <Box className="header-right">
        <Box className="action-item" onClick={() => navigate(isLoggedIn ? '/settings/language' : '/login')} title="Language, currency and time zone">
          <TranslateIcon className="action-icon" />
          <Typography className="action-text">{locale.language}</Typography>
        </Box>
        {isLoggedIn ? (
          <>
            <Box className="action-item" onClick={() => navigate('/wishlist')}>
              <FavoriteBorderIcon className="action-icon" />
            <Typography className="action-text">{t('wishlist')}</Typography>
            </Box>
          </>
        ) : (
          <Box className="action-item" onClick={() => navigate('/intro')}>
            <PersonOutlineOutlinedIcon className="action-icon" />
            <Typography className="action-text">Login</Typography>
          </Box>
        )}
        <Box className="action-item" onClick={handleCartClick}>
          <Badge badgeContent={cartCount} color="success" className="cart-badge">
            <ShoppingCartOutlinedIcon className="action-icon" />
          </Badge>
          <Typography className="action-text">{t('cart')}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
