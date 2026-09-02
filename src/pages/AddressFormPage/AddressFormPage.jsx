import { useEffect, useState, useContext } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { reverseGeocodeOpenStreetMap } from '../../services/openStreetMapService';
import './AddressFormPage.css';

const AddressFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editAddress = location.state?.editAddress;
  const selectedLocation = location.state?.location;
  const { setDeliveryAddress, addAddress, updateAddress, user } = useContext(AppContext);
  const [formError, setFormError] = useState('');
  const [locationSummary, setLocationSummary] = useState(selectedLocation || null);
  const [isLocating, setIsLocating] = useState(!location.state?.startManual && !selectedLocation && !editAddress);
  const [manualMode, setManualMode] = useState(Boolean(location.state?.startManual || editAddress?.manualLocation));
  const [manualLocation, setManualLocation] = useState(editAddress?.manualLocation || { street: '', city: '', state: '', pincode: '' });

  const [houseNumber, setHouseNumber] = useState(editAddress?.houseNumber || '');
  const [floor, setFloor] = useState(editAddress?.floor || '');
  const [landmark, setLandmark] = useState(editAddress?.landmark || '');
  const [saveAs, setSaveAs] = useState(editAddress?.type || 'Home');
  const [phone, setPhone] = useState(editAddress?.phone || user?.phone?.replace(/\D/g, '').slice(-10) || '');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (location.state?.startManual || selectedLocation || editAddress) return;
    if (!navigator.geolocation) {
      const timer = setTimeout(() => { setIsLocating(false); setFormError('Location access is not supported. Search the location manually.'); }, 0);
      return () => clearTimeout(timer);
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const coordinates = { lat:position.coords.latitude,lng:position.coords.longitude };
      try {
        const data = await reverseGeocodeOpenStreetMap(coordinates.lat, coordinates.lng);
        setLocationSummary({ title:data?.title || 'Current Location',subtitle:data?.subtitle || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,coordinates });
      } catch {
        setLocationSummary({ title:'Current Location',subtitle:`${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,coordinates });
      } finally { setIsLocating(false); }
    }, (error) => { setIsLocating(false); setFormError(`${error.message}. Search the location manually.`); }, { enableHighAccuracy:true,timeout:10000 });
  }, [editAddress, selectedLocation, location.state?.startManual]);

  const handleSaveAddress = async () => {
    if (!houseNumber.trim() || !floor.trim() || !/^\d{10}$/.test(phone)) {
      setFormError('Complete all required fields and enter a valid 10-digit phone number.');
      return;
    }
    if (manualMode && (!manualLocation.street.trim() || !manualLocation.city.trim() || !manualLocation.state.trim() || !/^\d{5,6}$/.test(manualLocation.pincode))) { setFormError('Enter street, city, state and a valid PIN/postal code.'); return; }
    if (!manualMode && !locationSummary && !editAddress) { setFormError('Wait for the live location or enter the address manually.'); return; }
    const baseLocation = manualMode ? [manualLocation.street,manualLocation.city,manualLocation.state,manualLocation.pincode].join(', ') : locationSummary ? `${locationSummary.title}, ${locationSummary.subtitle}` : editAddress.address;
    const formatted = `${saveAs}, ${houseNumber}, Floor ${floor}${landmark.trim() ? `, ${landmark}` : ''}, ${baseLocation}`;
    setDeliveryAddress(formatted);
    const addressData = { type: saveAs, address: formatted, phone, houseNumber, floor, landmark, coordinates: manualMode ? null : (locationSummary?.coordinates || editAddress?.coordinates || null), manualLocation: manualMode ? manualLocation : null };
    try {
      if (editAddress?.id) await updateAddress(editAddress.id, addressData);
      else await addAddress(addressData);
    } catch (error) {
      setFormError(error.message || 'Could not save the address.');
      return;
    }
    setFormError('');
    setShowSuccessModal(true);

    setTimeout(() => {
      setShowSuccessModal(false);
      navigate(editAddress ? '/saved-addresses' : (location.state?.returnTo || '/cart'));
    }, 1800);
  };

  return (
    <Box className="form-page-wrapper">
      {/* Top Header Bar */}
      <Box className="form-page-header">
        <IconButton onClick={() => navigate(-1)} style={{ color: '#ffffff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" className="form-header-title">
          {editAddress ? 'Edit Address' : 'Address Details'}
        </Typography>
      </Box>

      {/* Main Scroll Content */}
      <Box className="form-page-scroll">
        {/* Top Location Summary Card */}
        <Box className="loc-summary-card">
          <Box className="loc-card-left">
            <Typography className="loc-main-name">{isLocating ? 'Detecting your live location…' : `Location: ${locationSummary?.title || editAddress?.type || 'Select location'}`}</Typography>
            <Typography className="loc-sub-name">{isLocating ? 'Please allow location access in your browser.' : locationSummary?.subtitle || editAddress?.address || 'Use Change to search manually.'}</Typography>
          </Box>
          <Button className="change-loc-btn" onClick={() => manualMode ? setManualMode(false) : navigate('/address-search', { state: { returnTo: location.state?.returnTo } })}>
            {manualMode ? 'Use GPS' : 'Change'}
          </Button>
        </Box>

        <Button variant="outlined" onClick={() => { setManualMode((value) => !value); setFormError(''); }} sx={{ alignSelf:'flex-start',mb:2,borderColor:'#075F40',color:'#075F40',textTransform:'none' }}>{manualMode ? 'Use detected location' : 'Enter address manually'}</Button>

        {/* Input Form Fields */}
        <Box className="address-form-box">
          {manualMode && <><Box className="form-field-group"><Typography className="form-field-label">Street / Road / Area <span className="req">*</span></Typography><input className="custom-form-input" value={manualLocation.street} onChange={(event) => setManualLocation({ ...manualLocation, street:event.target.value })} placeholder="Enter street, road or area" /></Box><Box className="form-field-group"><Typography className="form-field-label">City <span className="req">*</span></Typography><input className="custom-form-input" value={manualLocation.city} onChange={(event) => setManualLocation({ ...manualLocation, city:event.target.value })} placeholder="Enter city" /></Box><Box className="form-field-group"><Typography className="form-field-label">State <span className="req">*</span></Typography><input className="custom-form-input" value={manualLocation.state} onChange={(event) => setManualLocation({ ...manualLocation, state:event.target.value })} placeholder="Enter state" /></Box><Box className="form-field-group"><Typography className="form-field-label">PIN / Postal code <span className="req">*</span></Typography><input className="custom-form-input" inputMode="numeric" value={manualLocation.pincode} onChange={(event) => setManualLocation({ ...manualLocation, pincode:event.target.value.replace(/\D/g,'').slice(0,6) })} placeholder="Enter PIN code" /></Box></>}
          <Box className="form-field-group">
            <Typography className="form-field-label">
              House number /Name /Area <span className="req">*</span>
            </Typography>
            <input
              type="text"
              placeholder="Enter your House number /name/area"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              className="custom-form-input"
            />
          </Box>

          <Box className="form-field-group">
            <Typography className="form-field-label">
              Floor <span className="req">*</span>
            </Typography>
            <input
              type="text"
              placeholder="Enter your floor"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="custom-form-input"
            />
          </Box>

          <Box className="form-field-group">
            <Typography className="form-field-label">
              Landmark <span className="req">*</span>
            </Typography>
            <input
              type="text"
              placeholder="Enter your landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="custom-form-input"
            />
          </Box>

          {/* Save as Chips */}
          <Box className="form-field-group">
            <Typography className="form-field-label">
              Save as <span className="req">*</span>
            </Typography>
            <Box className="save-as-chips-row">
              {[
                { label: 'Home' },
                { label: 'Office' },
                { label: 'Other' },
              ].map((item) => (
                <Button
                  key={item.label}
                  className={`save-chip ${saveAs === item.label ? 'active' : ''}`}
                  onClick={() => setSaveAs(item.label)}
                >
                  <span className="chip-icon" aria-hidden="true">{item.label === 'Home' ? <HomeOutlinedIcon fontSize="small" /> : item.label === 'Office' ? <BusinessOutlinedIcon fontSize="small" /> : <LocationOnOutlinedIcon fontSize="small" />}</span> {item.label}
                </Button>
              ))}
            </Box>
          </Box>

          <Box className="form-field-group">
            <Typography className="form-field-label">
              Receiver's Phone Number <span className="req">*</span>
            </Typography>
            <input
              type="text"
              placeholder="9988890909"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="custom-form-input"
            />
          </Box>
        </Box>
      </Box>

      {/* Bottom Sticky Save Button */}
      <Box className="form-sticky-footer">
        {formError && <Typography role="alert" sx={{ color: '#b91c1c', mb: 1 }}>{formError}</Typography>}
        <Button
          variant="contained"
          fullWidth
          className="save-address-btn"
          onClick={handleSaveAddress}
        >
          Save Address Details
        </Button>
      </Box>

      {/* Success Modal (Matching address successful screenshot) */}
      {showSuccessModal && (
        <Box className="modal-overlay-backdrop">
          <Box className="success-modal-card">
            <Box className="green-circle-icon-wrap">
              <CheckCircleIcon className="success-check-icon" />
            </Box>
            <Typography className="success-modal-text">
              Address updated successfully
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AddressFormPage;
