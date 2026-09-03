import { useContext, useMemo, useState } from 'react';
import { Box, Button, Checkbox, CircularProgress, Collapse, FormControlLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { buildOrderAddressesPayload, buildOrderItemsPayload, createOrder, isOrderServiceUnavailable, normalizeOrder } from '../../services/orderApi';
import './PaymentOptions.css';

const methods = [
  { id:'upi',label:'UPI',icon:<PhoneAndroidIcon/> },
  { id:'card',label:'Cards',icon:<CreditCardIcon/> },
  { id:'bank',label:'Net Banking',icon:<AccountBalanceIcon/> },
  { id:'wallet',label:'Wallets',icon:<PhoneAndroidIcon/> },
];

const PaymentOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCart, addresses, cartItems, clearCart, formatCurrency, user } = useContext(AppContext);
  const checkout = useMemo(() => location.state?.checkout || {}, [location.state]);
  const [method,setMethod] = useState('upi');
  const [status,setStatus] = useState('selecting');
  const [summaryOpen,setSummaryOpen] = useState(true);
  const [error,setError] = useState('');
  const [upiOption,setUpiOption] = useState('gpay');
  const [upiId,setUpiId] = useState('');
  const [card,setCard] = useState({number:'',expiry:'',cvv:'',name:''});
  const [saveCard,setSaveCard] = useState(false);
  const [bank,setBank] = useState('');
  const [wallet,setWallet] = useState('');
  const [result,setResult] = useState(null);

  const summary = useMemo(() => {
    const subtotal = cartItems.reduce((sum,item)=>sum+Number(item.price)*Number(item.quantity),0);
    const delivery = Number(checkout.deliveryFee || 0);
    const handling = Number(checkout.handlingFee ?? (cartItems.length ? 5 : 0));
    const discount = Number(checkout.discount || 0);
    return { subtotal,delivery,handling,discount,total:Number(checkout.total ?? subtotal+delivery+handling-discount) };
  },[cartItems,checkout]);

  const validate = () => {
    if (!cartItems.length) return 'Your cart is empty.';
    if (!user?.id) return 'Log in before placing an order.';
    if (!activeCart?.id) return 'Cart Service has not returned an active cart yet.';
    if (!activeCart?.storeId) return 'Select a store before placing an order.';
    if (method === 'upi' && upiOption === 'id' && !/^[\w.-]+@[\w.-]+$/.test(upiId)) return 'Enter a valid UPI ID.';
    if (method === 'card' && (!/^\d{16}$/.test(card.number) || !/^\d{2}\/\d{2}$/.test(card.expiry) || !/^\d{3,4}$/.test(card.cvv) || !card.name.trim())) return 'Enter complete card details.';
    if (method === 'bank' && !bank) return 'Select a bank.';
    if (method === 'wallet' && !wallet) return 'Select a wallet.';
    return '';
  };

  const pay = () => {
    const validation = validate();
    if (validation) { setError(validation);setStatus('failed');return; }
    setError('');setStatus('submitting');
    window.setTimeout(async() => {
      try {
        const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0] || {};
        const addressesPayload = buildOrderAddressesPayload(defaultAddress, checkout.deliveryAddress);
        const order = normalizeOrder(await createOrder({
          customerId: user.id,
          cartId: activeCart.id,
          storeId: activeCart.storeId,
          items: buildOrderItemsPayload(cartItems),
          addresses: addressesPayload,
          paymentStatus: 'PAID',
        }));
        clearCart().catch((error) => console.warn('Order created, but cart cleanup failed:', error));
        setResult({ order });
        setStatus('succeeded');
      } catch (error) {
        console.warn('Order creation failed:', error);
        setError(isOrderServiceUnavailable(error) ? 'Order Service is unavailable. Please try again when backend is online.' : 'We could not place your order. Please check the delivery address and try again.');
        setStatus('failed');
      }
    },1400);
  };

  if (status === 'succeeded' && result) return <Box className="payment-shell"><Box className="payment-result"><Box className="success-ring"><CheckCircleOutlinedIcon/></Box><Typography variant="h4">Payment Successful</Typography><Typography color="text.secondary">Your order was created by the Order Service.</Typography><Box className="result-amount"><span>Amount</span><strong>{formatCurrency(result.order.totalAmount)}</strong></Box><Box className="result-refs"><span>Order ID<strong>{result.order.id}</strong></span><span>Status<strong>{result.order.status}</strong></span></Box><Box className="result-actions"><Button variant="contained" onClick={()=>navigate(`/order/${encodeURIComponent(result.order.id)}`,{state:{orderId:result.order.id}})}>View Order</Button><Button variant="outlined" onClick={()=>navigate('/home')}>Continue Shopping</Button></Box></Box></Box>;

  return <Box className="payment-shell">
    <header className="payment-header"><Button startIcon={<ArrowBackIcon/>} onClick={()=>navigate(-1)}>Secure Checkout</Button><Box><LockOutlinedIcon/><span>Secure Payment</span></Box></header>
    <main className="payment-layout">
      <section className={`order-summary-panel ${summaryOpen?'open':''}`}><button type="button" className="summary-toggle" onClick={()=>setSummaryOpen((value)=>!value)}><span><strong>Order Summary</strong><small>{cartItems.length} {cartItems.length===1?'item':'items'}</small></span><strong>{formatCurrency(summary.total)}</strong><KeyboardArrowDownIcon/></button><Collapse in={summaryOpen}><Box className="summary-content">{cartItems.map((item)=><Box className="summary-product" key={`${item.productId}:${item.variantId}`}><span>{item.title}<small>{item.weight} x {item.quantity}</small></span><strong>{formatCurrency(Number(item.price)*Number(item.quantity))}</strong></Box>)}<Box className="summary-totals"><span>Subtotal<strong>{formatCurrency(summary.subtotal)}</strong></span><span>Delivery<strong>{formatCurrency(summary.delivery)}</strong></span><span>Handling<strong>{formatCurrency(summary.handling)}</strong></span>{summary.discount>0&&<span className="summary-discount">Discount<strong>-{formatCurrency(summary.discount)}</strong></span>}<span className="summary-grand">Total<strong>{formatCurrency(summary.total)}</strong></span></Box>{checkout.deliveryAddress&&<Typography className="summary-address"><strong>Deliver to</strong>{checkout.deliveryAddress}</Typography>}</Box></Collapse></section>
      <section className="payment-method-panel"><Box className="payment-title"><Typography variant="h5">Payment Method</Typography><Typography>Choose a payment option</Typography></Box><Box className="method-workspace"><nav className="method-tabs">{methods.map((item)=><button type="button" key={item.id} className={method===item.id?'active':''} onClick={()=>{setMethod(item.id);setStatus('selecting');setError('');}}>{item.icon}<span>{item.label}</span></button>)}</nav><Box className="method-detail">
        {method==='upi'&&<Box className="method-form"><Typography variant="h6">Pay with UPI</Typography><Typography color="text.secondary">Choose your preferred option</Typography><Box className="option-list">{[['gpay','GPay','Pay using Google Pay'],['phonepe','PhonePe','Pay using PhonePe'],['paytm','Paytm','Pay using Paytm'],['id','UPI ID','Enter your UPI address']].map(([id,name,caption])=><button type="button" key={id} className={upiOption===id?'selected':''} onClick={()=>setUpiOption(id)}><span className="option-mark">{name.slice(0,2)}</span><span><strong>{name}</strong><small>{caption}</small></span><i>{upiOption===id?'●':'○'}</i></button>)}</Box>{upiOption==='id'&&<TextField label="UPI ID" placeholder="yourname@upi" value={upiId} onChange={(event)=>setUpiId(event.target.value)} fullWidth/>}</Box>}
        {method==='card'&&<Box className="method-form"><Typography variant="h6">Credit / Debit Card</Typography><TextField label="Card number" placeholder="1234 5678 9012 3456" value={card.number.replace(/(.{4})/g,'$1 ').trim()} onChange={(event)=>setCard({...card,number:event.target.value.replace(/\D/g,'').slice(0,16)})} fullWidth/><Box className="field-row"><TextField label="Expiry date" placeholder="MM/YY" value={card.expiry} onChange={(event)=>setCard({...card,expiry:event.target.value.slice(0,5)})}/><TextField label="CVV" type="password" placeholder="123" value={card.cvv} onChange={(event)=>setCard({...card,cvv:event.target.value.replace(/\D/g,'').slice(0,4)})}/></Box><TextField label="Cardholder name" value={card.name} onChange={(event)=>setCard({...card,name:event.target.value})} fullWidth/><FormControlLabel control={<Checkbox checked={saveCard} onChange={(event)=>setSaveCard(event.target.checked)}/>} label="Save card for this session"/></Box>}
        {method==='bank'&&<Box className="method-form"><Typography variant="h6">Net Banking</Typography><Typography color="text.secondary">Select your bank</Typography><Select displayEmpty value={bank} onChange={(event)=>setBank(event.target.value)} fullWidth><MenuItem value="" disabled>Select bank</MenuItem>{['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra Bank'].map((item)=><MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></Box>}
        {method==='wallet'&&<Box className="method-form"><Typography variant="h6">Wallets</Typography><Typography color="text.secondary">Choose a wallet</Typography><Box className="option-list">{['Amazon Pay','Mobikwik','Freecharge'].map((item)=><button type="button" key={item} className={wallet===item?'selected':''} onClick={()=>setWallet(item)}><span className="option-mark">{item.slice(0,2)}</span><span><strong>{item}</strong><small>Wallet payment</small></span><i>{wallet===item?'●':'○'}</i></button>)}</Box></Box>}
        {status==='failed'&&<Box className="payment-error" role="alert"><ErrorOutlinedIcon/><Box><strong>Could not place order</strong><span>{error || 'Please try again in a moment.'}</span></Box><Button onClick={()=>{setStatus('selecting');setError('');}}>Try Again</Button></Box>}
        <Button className="payment-button" variant="contained" disabled={status==='submitting'} onClick={()=>pay()}>{status==='submitting'?<><CircularProgress size={19} color="inherit"/>Processing Payment...</>:`Pay ${formatCurrency(summary.total)}`}</Button><Box className="secure-note"><LockOutlinedIcon/><span><strong>Secure Checkout</strong>Your order will be created by the Order Service after payment confirmation.</span></Box>
      </Box></Box></section>
    </main>
  </Box>;
};

export default PaymentOptions;
