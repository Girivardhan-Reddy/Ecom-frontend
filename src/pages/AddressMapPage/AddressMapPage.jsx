import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { useLocation, useNavigate } from 'react-router-dom';
import { openStreetMapEmbedUrl, reverseGeocodeOpenStreetMap } from '../../services/openStreetMapService';
import './AddressMapPage.css';

// Default center: Gachibowli, Hyderabad (17.4401, 78.3489)
const DEFAULT_CENTER = {
  lat: 17.4401,
  lng: 78.3489,
};

const AddressMapPage = () => {
  const navigate = useNavigate();
  const route = useLocation();

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [locationName, setLocationName] = useState('Gachibowli');
  const [subLocation, setSubLocation] = useState('Hyderabad, Telangana 500032');
  const [isLocating, setIsLocating] = useState(false);

  // Browser Geolocation & Dynamic Reverse Geocoding
  const handleFindUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(userPos);

          try {
            const data = await reverseGeocodeOpenStreetMap(userPos.lat, userPos.lng);
            if (data) {
              setLocationName(data.title);
              setSubLocation(data.subtitle);
            } else {
              setLocationName('Current location');
              setSubLocation(`${userPos.lat.toFixed(6)}, ${userPos.lng.toFixed(6)}`);
            }
          } catch (err) {
            console.warn('Geocoding error:', err);
            setLocationName('Current location');
            setSubLocation(`${userPos.lat.toFixed(6)}, ${userPos.lng.toFixed(6)}`);
          }
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation failed or permission denied:', error.message);
          setIsLocating(false);
          setLocationName('Indira Nagar');
          setSubLocation('Gachibowli, Hyderabad, Telangana 500032');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(handleFindUserLocation, 0);
    return () => clearTimeout(timer);
  }, [handleFindUserLocation]);

  const handleConfirmLocation = () => {
    navigate('/address-form', { state: { location: { title:locationName,subtitle:subLocation,coordinates:mapCenter }, returnTo: route.state?.returnTo } });
  };
  const embeddedMapUrl = openStreetMapEmbedUrl(mapCenter);

  return (
    <Box className="map-page-wrapper">
      {/* Top Header Bar */}
      <Box className="map-page-header">
        <IconButton onClick={() => navigate(-1)} style={{ color: '#ffffff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" className="map-header-title">
          Add New Address
        </Typography>
      </Box>

      {/* Map Graphic Area */}
      <Box className="map-visual-area">
        <iframe title="OpenStreetMap address location" src={embeddedMapUrl} style={{ width:'100%',height:'100%',border:0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <Box className="map-provider-badge">OpenStreetMap</Box>

        {/* Locate Me Floating Button */}
        <Button
          className="locate-me-btn"
          onClick={handleFindUserLocation}
          disabled={isLocating}
        >
          <MyLocationIcon fontSize="small" />
          <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
        </Button>
      </Box>

      {/* Bottom Sheet */}
      <Box className="map-bottom-sheet">
        <Typography className="sheet-location-title">{locationName}</Typography>
        <Typography className="sheet-location-sub">{subLocation}</Typography>

        <Button
          variant="contained"
          fullWidth
          className="confirm-location-btn"
          onClick={handleConfirmLocation}
        >
          Confirm location
        </Button>
      </Box>
    </Box>
  );
};

export default AddressMapPage;
