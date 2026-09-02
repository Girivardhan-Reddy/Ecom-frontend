import { useContext, useEffect, useMemo, useState } from 'react';
import { Box, Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { hasCompleteProfile } from '../../utils/profileCompletion';
import { collectionStore } from '../../services/localDataService';
import { promotionApplies,resolvedPromotionScope } from '../../services/promotionScope';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, deliveryAddress, user, addresses, formatCurrency, userCity, catalogProducts } = useContext(AppContext);
  useEffect(() => { if (!hasCompleteProfile(user, addresses)) navigate('/profile', { replace: true, state: { completeProfile: true, returnTo: '/checkout' } }); }, [user, addresses, navigate]);
  const [method, setMethod] = useState('standard');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const pickupStores = collectionStore.list('stores').filter((store) => store.status !== 'Inactive' && store.active !== false && store.pickup !== 'No');
  const [pickupStore, setPickupStore] = useState(() => {
    const selected = localStorage.getItem('selectedStore');
    return pickupStores.some((store) => store.name === selected) ? selected : '';
  });
  const [notes, setNotes] = useState('');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [error, setError] = useState('');
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [cartItems]);
  const deliveryFee = method === 'express' ? 49 : method === 'instant' ? 29 : 0;
  const localCoupons = JSON.parse(localStorage.getItem('local:coupons') || '[]');
  const discountValue = Number(appliedCoupon?.discount || 0);
  const calculatedDiscount = appliedCoupon?.discountType === 'Fixed' ? discountValue : Math.round(subtotal * discountValue / 100);
  const discount = appliedCoupon ? Math.min(calculatedDiscount, Number(appliedCoupon.maximumDiscount || calculatedDiscount), subtotal) : 0;
  const total = subtotal + deliveryFee + (cartItems.length ? 5 : 0) - discount;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    const fallback = code === 'SAVE10' ? { name: 'SAVE10', discount: 10, discountType: 'Percentage', status: 'Active' } : null;
    const match = localCoupons.find((item) => item.name?.trim().toUpperCase() === code) || fallback;
    const today = new Date().toISOString().slice(0, 10);
    if (!code || !match || match.active === false || match.status === 'Inactive') {
      setAppliedCoupon(null);
      return setCouponMessage('Coupon not found or inactive.');
    }
    const sources=cartItems.map((item)=>catalogProducts.find((product)=>product.productId===item.productId)).filter(Boolean);
    const scoped=resolvedPromotionScope(match);const customerLocation=collectionStore.list('locations').find((item)=>userCity.toLowerCase().includes(item.name.toLowerCase()))?.name||'';const sourceStore=sources.length&&sources.every((item)=>item.store===sources[0].store)?sources[0].store:'';
    const applies=promotionApplies(scoped,{location:customerLocation,store:sourceStore});
    if(!applies){setAppliedCoupon(null);return setCouponMessage(`This coupon is only valid for ${scoped.scope==='Store'?scoped.store:scoped.location||'all India'}.`);}
    if ((match.startDate && today < match.startDate) || (match.expiry && today > match.expiry)) {
      setAppliedCoupon(null);
      return setCouponMessage('This coupon is not valid today.');
    }
    if (subtotal < Number(match.minimumOrder || 0)) {
      setAppliedCoupon(null);
      return setCouponMessage(`Minimum order is ${formatCurrency(match.minimumOrder)}.`);
    }
    setAppliedCoupon(match);
    setCouponMessage(`${code} applied successfully.`);
  };

  const proceed = () => {
    if (!cartItems.length) return setError('Your cart is empty.');
    if (method !== 'pickup' && !deliveryAddress) return setError('Select a delivery address.');
    if ((method === 'scheduled' || method === 'pickup') && (!date || !slot)) return setError('Select a date and time slot.');
    if (method === 'pickup' && !pickupStore) return setError('Select a pickup store.');
    navigate('/payment-options', { state: { checkout: { method, date, slot, pickupStore, notes: notes.trim(), coupon: appliedCoupon?.name || '', discount, subtotal, deliveryFee, handlingFee: cartItems.length ? 5 : 0, total, deliveryAddress: method === 'pickup' ? '' : deliveryAddress,customerLocation:userCity } } });
  };

  return <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
    <Box sx={{ bgcolor: '#075F40', color: 'white', p: 2, display: 'flex', gap: 2, alignItems: 'center' }}><Button sx={{ color: 'white' }} onClick={() => navigate(-1)}>Back</Button><Typography variant="h6">Checkout</Typography></Box>
    <Box sx={{ maxWidth: 760, mx: 'auto', p: 3, display: 'grid', gap: 2 }}>
      {method !== 'pickup' && <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2 }}><Typography fontWeight={700}>Delivery Address</Typography><Typography color="text.secondary">{deliveryAddress || 'No address selected'}</Typography><Button onClick={() => navigate('/saved-addresses')}>Change Address</Button></Box>}
      <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, display: 'grid', gap: 2 }}>
        <Typography fontWeight={700}>Delivery Method</Typography>
        <Select value={method} onChange={(event) => { setMethod(event.target.value); setError(''); }}><MenuItem value="standard">Standard Delivery (1-10 days)</MenuItem><MenuItem value="instant">Instant / Same Day Delivery</MenuItem><MenuItem value="express">Express Delivery</MenuItem><MenuItem value="scheduled">Scheduled Delivery</MenuItem><MenuItem value="pickup">Store Pickup / Takeaway</MenuItem></Select>
        {(method === 'scheduled' || method === 'pickup') && <><TextField label={method === 'pickup' ? 'Pickup date' : 'Delivery date'} type="date" value={date} onChange={(event) => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: new Date().toISOString().slice(0, 10) } }} /><Select displayEmpty value={slot} onChange={(event) => setSlot(event.target.value)}><MenuItem value="" disabled>Select time slot</MenuItem><MenuItem value="09:00-12:00">9 AM - 12 PM</MenuItem><MenuItem value="14:00-17:00">2 PM - 5 PM</MenuItem><MenuItem value="18:00-20:00">6 PM - 8 PM</MenuItem></Select></>}
        {method === 'pickup' && <Select displayEmpty value={pickupStore} onChange={(event) => setPickupStore(event.target.value)}><MenuItem value="" disabled>Select pickup store</MenuItem>{pickupStores.map((store) => <MenuItem key={store.id} value={store.name}>{store.name}{store.location ? ` - ${store.location}` : ''}</MenuItem>)}</Select>}
        <TextField label="Order notes" multiline minRows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}><TextField fullWidth label="Coupon code" value={coupon} onChange={(event) => { setCoupon(event.target.value.toUpperCase()); setAppliedCoupon(null); setCouponMessage(''); }} helperText={couponMessage || 'Use SAVE10 or an admin-created coupon.'} error={Boolean(couponMessage && !appliedCoupon)} color={appliedCoupon ? 'success' : 'primary'} /><Button variant="outlined" onClick={applyCoupon} sx={{ minHeight: 56 }}>{appliedCoupon ? 'Applied' : 'Apply'}</Button></Box>
      </Box>
      <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2 }}><Typography fontWeight={700}>Invoice Summary</Typography><Typography>Subtotal: {formatCurrency(subtotal)}</Typography><Typography>Discount: -{formatCurrency(discount)}</Typography><Typography>Delivery: {formatCurrency(deliveryFee)}</Typography><Typography>Handling: {formatCurrency(cartItems.length ? 5 : 0)}</Typography><Typography variant="h6">Total: {formatCurrency(total)}</Typography></Box>
      {error && <Typography role="alert" color="error">{error}</Typography>}
      <Button variant="contained" onClick={proceed}>Choose Payment Method</Button>
    </Box>
  </Box>;
};

export default CheckoutPage;
