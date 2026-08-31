import { useState } from 'react';
import { Box, Typography, IconButton, InputBase } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddressSearchPage.css';

const AddressSearchPage = () => {
  const navigate = useNavigate();
  const route = useLocation();
  const [query, setQuery] = useState('');

  const searchResults = [
    { title: 'Gachibowli', subtitle: 'Hyderabad, Telangana, India' },
    { title: 'Gachibowli Circle', subtitle: 'Telecom Nagar, Hyderabad, Telangana, India' },
    { title: 'Gachibowli ORR entry', subtitle: 'Weaker section Colony, Khajaguda, Hyderabad, Telangana, India' },
    { title: 'Gachibowli Stadium', subtitle: 'Hyderabad, Telangana, India' },
    { title: 'Gachibowli Flyover', subtitle: 'Hyderabad, Telangana, India' },
  ];
  const filteredResults = searchResults.filter((location) => `${location.title} ${location.subtitle}`.toLowerCase().includes(query.toLowerCase()));

  const handleSelectLocation = (loc) => {
    navigate('/address-form', { state: { location: loc, returnTo: route.state?.returnTo } });
  };

  return (
    <Box className="search-loc-wrapper">
      {/* Top Header Bar */}
      <Box className="search-loc-header">
        <IconButton onClick={() => navigate(-1)} style={{ color: '#ffffff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" className="search-loc-title">
          Select a delivery Location
        </Typography>
      </Box>

      {/* Input Field Wrap */}
      <Box className="search-loc-input-box">
        <InputBase
          placeholder="Enter your apartment / area"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-loc-input"
        />
        <SearchIcon className="search-loc-icon" />
      </Box>

      {/* Use Current Location Action */}
      <Box className="use-current-row" onClick={() => navigate('/address-map', { state: { returnTo: route.state?.returnTo } })}>
        <NearMeOutlinedIcon className="near-me-icon" />
        <Typography className="use-current-text">Use Current Location</Typography>
      </Box>

      {/* Search Results */}
      <Box className="search-loc-results">
        <Typography className="results-heading">Search Results</Typography>

        <Box className="results-list">
          {filteredResults.map((loc, idx) => (
            <Box key={idx} className="result-loc-item" onClick={() => handleSelectLocation(loc)}>
              <LocationOnOutlinedIcon className="loc-pin-icon" />
              <Box className="loc-text-wrap">
                <Typography className="loc-title">{loc.title}</Typography>
                <Typography className="loc-sub">{loc.subtitle}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AddressSearchPage;
