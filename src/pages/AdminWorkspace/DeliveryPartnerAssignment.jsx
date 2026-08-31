import { useContext,useState } from 'react';
import { Alert,Box,Button,MenuItem,Select,Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { collectionStore,orderStore } from '../../services/localDataService';

const DeliveryPartnerAssignment=({orderId})=>{
  const navigate=useNavigate();const {user}=useContext(AppContext);const order=orderStore.list().find((item)=>item.id===orderId);const [partnerId,setPartnerId]=useState('');const [error,setError]=useState('');
  const partners=collectionStore.list('delivery').filter((item)=>item.status==='Active').filter((item)=>user?.role==='store-manager'?item.store===user.store:order?.sourceStore?item.store===order.sourceStore:item.location===user?.location).sort((a,b)=>a.name.localeCompare(b.name));
  if(!order)return <Box p={4}>Order not found</Box>;
  const assign=()=>{try{orderStore.assignPartner(orderId,partners.find((item)=>item.id===partnerId));navigate('/admin/orders',{replace:true});}catch(reason){setError(reason.message);}};
  return <Box sx={{position:'fixed',inset:0,zIndex:1400,bgcolor:'rgba(15,23,42,.6)',p:3,overflowY:'auto'}}><Box sx={{maxWidth:620,mx:'auto',mt:{md:10},bgcolor:'white',p:3,borderRadius:3,boxShadow:24}}><Button onClick={()=>navigate('/admin/orders')}>Close</Button><Typography variant="h5" fontWeight={800} mt={2}>Assign delivery partner</Typography><Typography color="text.secondary" mb={2}>Only active partners created for {order.sourceStore||user?.store||user?.location} are listed. Vehicle codes are not displayed.</Typography>{!partners.length?<Alert severity="warning">No active delivery partner has been created for this store.</Alert>:<><Select fullWidth displayEmpty value={partnerId} onChange={(event)=>setPartnerId(event.target.value)}><MenuItem value="" disabled>Select delivery partner by name</MenuItem>{partners.map((partner)=><MenuItem key={partner.id} value={partner.id}>{partner.name}</MenuItem>)}</Select><Button variant="contained" sx={{mt:3}} disabled={!partnerId} onClick={assign}>Assign order</Button></>}{error&&<Alert severity="error" sx={{mt:2}}>{error}</Alert>}</Box></Box>;
};
export default DeliveryPartnerAssignment;
