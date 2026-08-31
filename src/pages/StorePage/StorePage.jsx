import { useContext, useEffect, useState } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import BottomNav from '../../components/BottomNav/BottomNav';
import ProductCard from '../../components/ProductCard/ProductCard';
import CampaignCarousel from '../../components/CampaignCarousel/CampaignCarousel';
import { AppContext } from '../../context/AppContext';
import { collectionStore, subscribeToLocalData } from '../../services/localDataService';
import { customerProduct } from '../../services/sharedCatalog';
import { promotionApplies } from '../../services/promotionScope';
import './StorePage.css';

const StorePage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { userCity } = useContext(AppContext);
  const [, refresh] = useState(0);

  useEffect(() => subscribeToLocalData(({ key }) => {
    if (!key || ['local:stores', 'local:products', 'local:inventory'].includes(key)) refresh((value) => value + 1);
  }), []);

  const store = collectionStore.list('stores').find((item) => item.id === storeId);
  const inventory = collectionStore.list('inventory');
  const banners = store ? collectionStore.list('banners').filter((item)=>item.status==='Active'&&item.image&&promotionApplies(item,{location:store.location,store:store.name})) : [];
  const coupons = store ? collectionStore.list('coupons').filter((item)=>item.status==='Active'&&promotionApplies(item,{location:store.location,store:store.name})) : [];
  const products = store ? collectionStore.list('products')
    .filter((item) => item.status !== 'Inactive' && item.active !== false)
    .filter((item) => item.store === store.id || item.store === store.name)
    .map((item) => customerProduct(item, inventory)) : [];

  if (!store) return <Box className="store-page"><Header /><Box className="store-empty"><Typography variant="h6">Store not found</Typography><Button onClick={() => navigate('/home')}>Return home</Button></Box><BottomNav /></Box>;

  return <Box className="store-page">
    <Header />
    <Box className="store-banner">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
      <Box className="store-heading"><StorefrontOutlinedIcon /><Box><Typography variant="h5">{store.name}</Typography><Typography>{store.address || store.location || userCity}</Typography></Box></Box>
      <Box className="store-badges">{store.delivery !== 'No' && <Chip label="Delivery available" />}{store.pickup === 'Yes' && <Chip label="Pickup available" />}</Box>
    </Box>
    <CampaignCarousel banners={banners} onNavigate={navigate}/>
    {coupons.length>0&&<Box sx={{mx:{xs:2,md:5},my:2,p:2,bgcolor:'#eef8f3',borderRadius:2}}><Typography fontWeight={800}>Offers available at this store</Typography><Box sx={{display:'flex',gap:1,flexWrap:'wrap',mt:1}}>{coupons.map((coupon)=><Chip key={coupon.id} color="success" variant="outlined" label={`${coupon.name} · ${coupon.discountType==='Percentage'?`${coupon.discount}% off`:`₹${coupon.discount} off`}`}/>)}</Box></Box>}
    <Box className="store-products">
      <Typography variant="h6">Products in this store ({products.length})</Typography>
      {products.length ? <Box className="store-product-grid">{products.map((product) => <ProductCard key={product.id} {...product} />)}</Box> : <Box className="store-empty"><Typography>No products are currently assigned to this store.</Typography></Box>}
    </Box>
    <BottomNav />
  </Box>;
};

export default StorePage;
