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
import { orderStore } from '../../services/localDataService';
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
  const { cartItems, formatCurrency } = useContext(AppContext);
  const checkout = useMemo(() => location.state?.checkout || {}, [location.state]);
  const [method,setMethod] = useState('upi');
  const [status,setStatus] = useState('METHOD_SELECTED');
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
    if (method === 'upi' && upiOption === 'id' && !/^[\w.-]+@[\w.-]+$/.test(upiId)) return 'Enter a valid demo UPI ID.';
    if (method === 'card' && (!/^\d{16}$/.test(card.number) || !/^\d{2}\/\d{2}$/.test(card.expiry) || !/^\d{3,4}$/.test(card.cvv) || !card.name.trim())) return 'Enter complete demo card details.';
    if (method === 'bank' && !bank) return 'Select a bank.';
    if (method === 'wallet' && !wallet) return 'Select a wallet.';
    return '';
  };

  const pay = (outcome = 'SUCCESS') => {
    const validation = validate();
    if (validation) { setError(validation);setStatus('FAILED');return; }
    setError('');setStatus('PROCESSING');
    window.setTimeout(async() => {
      if (outcome !== 'SUCCESS') { setStatus(outcome);return; }
      const paymentReference=`DEMO_PAY_${Date.now().toString().slice(-8)}`;
      const orderReference=`ORDER_${Date.now().toString().slice(-8)}`;
      const order=await orderStore.create({cartItems,checkout:{...checkout,total:summary.total,demoPayment:true},paymentMethod:'frontend-demo',localOrderId:orderReference,payment:{status:'DEMO_SUCCESS',paymentReference,amount:summary.total,currency:'INR',notice:'No real money was charged.'}});
      setResult({paymentReference,orderReference,order});setStatus('SUCCESS');
    },1400);
  };

  if (status === 'SUCCESS' && result) return <Box className="demo-pay-shell"><Box className="demo-pay-result"><Box className="success-ring"><CheckCircleOutlinedIcon/></Box><Typography variant="h4">Demo Payment Successful</Typography><Typography color="text.secondary">Frontend test payment completed</Typography><Box className="result-amount"><span>Amount</span><strong>{formatCurrency(summary.total)}</strong></Box><Box className="result-refs"><span>Payment Reference<strong>{result.paymentReference}</strong></span><span>Order Reference<strong>{result.orderReference}</strong></span></Box><Typography className="demo-warning">No real money was charged.</Typography><Box className="result-actions"><Button variant="contained" onClick={()=>navigate('/order',{state:{order:result.order,demoPayment:true}})}>View Order</Button><Button variant="outlined" onClick={()=>navigate('/home')}>Continue Shopping</Button></Box></Box></Box>;

  return <Box className="demo-pay-shell">
    <header className="demo-pay-header"><Button startIcon={<ArrowBackIcon/>} onClick={()=>navigate(-1)}>Secure Checkout</Button><Box><LockOutlinedIcon/><span>Secure Payment</span><small>DEMO</small></Box></header>
    <main className="demo-pay-layout">
      <section className={`order-summary-panel ${summaryOpen?'open':''}`}><button type="button" className="summary-toggle" onClick={()=>setSummaryOpen((value)=>!value)}><span><strong>Order Summary</strong><small>{cartItems.length} {cartItems.length===1?'item':'items'}</small></span><strong>{formatCurrency(summary.total)}</strong><KeyboardArrowDownIcon/></button><Collapse in={summaryOpen}><Box className="summary-content">{cartItems.map((item)=><Box className="summary-product" key={`${item.id}-${item.weight}`}><span>{item.title}<small>{item.weight} x {item.quantity}</small></span><strong>{formatCurrency(Number(item.price)*Number(item.quantity))}</strong></Box>)}<Box className="summary-totals"><span>Subtotal<strong>{formatCurrency(summary.subtotal)}</strong></span><span>Delivery<strong>{formatCurrency(summary.delivery)}</strong></span><span>Handling<strong>{formatCurrency(summary.handling)}</strong></span>{summary.discount>0&&<span className="summary-discount">Discount<strong>-{formatCurrency(summary.discount)}</strong></span>}<span className="summary-grand">Total<strong>{formatCurrency(summary.total)}</strong></span></Box>{checkout.deliveryAddress&&<Typography className="summary-address"><strong>Deliver to</strong>{checkout.deliveryAddress}</Typography>}</Box></Collapse></section>
      <section className="payment-method-panel"><Box className="payment-title"><Typography variant="h5">Payment Method</Typography><Typography>Choose a demo payment option</Typography></Box><Box className="method-workspace"><nav className="method-tabs">{methods.map((item)=><button type="button" key={item.id} className={method===item.id?'active':''} onClick={()=>{setMethod(item.id);setStatus('METHOD_SELECTED');setError('');}}>{item.icon}<span>{item.label}</span></button>)}</nav><Box className="method-detail">
        {method==='upi'&&<Box className="method-form"><Typography variant="h6">Pay with UPI</Typography><Typography color="text.secondary">Choose your preferred option</Typography><Box className="option-list">{[['gpay','GPay','Pay using Google Pay'],['phonepe','PhonePe','Pay using PhonePe'],['paytm','Paytm','Pay using Paytm'],['id','UPI ID','Enter your UPI address']].map(([id,name,caption])=><button type="button" key={id} className={upiOption===id?'selected':''} onClick={()=>setUpiOption(id)}><span className="option-mark">{name.slice(0,2)}</span><span><strong>{name}</strong><small>{caption}</small></span><i>{upiOption===id?'●':'○'}</i></button>)}</Box>{upiOption==='id'&&<TextField label="UPI ID" placeholder="yourname@upi" value={upiId} onChange={(event)=>setUpiId(event.target.value)} fullWidth/>}</Box>}
        {method==='card'&&<Box className="method-form"><Typography variant="h6">Credit / Debit Card</Typography><TextField label="Card number" placeholder="1234 5678 9012 3456" value={card.number.replace(/(.{4})/g,'$1 ').trim()} onChange={(event)=>setCard({...card,number:event.target.value.replace(/\D/g,'').slice(0,16)})} fullWidth/><Box className="field-row"><TextField label="Expiry date" placeholder="MM/YY" value={card.expiry} onChange={(event)=>setCard({...card,expiry:event.target.value.slice(0,5)})}/><TextField label="CVV" type="password" placeholder="123" value={card.cvv} onChange={(event)=>setCard({...card,cvv:event.target.value.replace(/\D/g,'').slice(0,4)})}/></Box><TextField label="Cardholder name" value={card.name} onChange={(event)=>setCard({...card,name:event.target.value})} fullWidth/><FormControlLabel control={<Checkbox checked={saveCard} onChange={(event)=>setSaveCard(event.target.checked)}/>} label="Save card for this demo session"/></Box>}
        {method==='bank'&&<Box className="method-form"><Typography variant="h6">Net Banking</Typography><Typography color="text.secondary">Select your bank</Typography><Select displayEmpty value={bank} onChange={(event)=>setBank(event.target.value)} fullWidth><MenuItem value="" disabled>Select bank</MenuItem>{['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra Bank'].map((item)=><MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></Box>}
        {method==='wallet'&&<Box className="method-form"><Typography variant="h6">Wallets</Typography><Typography color="text.secondary">Choose a demo wallet</Typography><Box className="option-list">{['Amazon Pay','Mobikwik','Freecharge'].map((item)=><button type="button" key={item} className={wallet===item?'selected':''} onClick={()=>setWallet(item)}><span className="option-mark">{item.slice(0,2)}</span><span><strong>{item}</strong><small>Demo wallet payment</small></span><i>{wallet===item?'●':'○'}</i></button>)}</Box></Box>}
        {(status==='FAILED'||status==='CANCELLED')&&<Box className="payment-error" role="alert"><ErrorOutlinedIcon/><Box><strong>{status==='CANCELLED'?'Payment Cancelled':'Payment Failed'}</strong><span>{error || (status==='CANCELLED'?'The demo payment was cancelled.':'We could not complete the demo payment.')}</span></Box><Button onClick={()=>{setStatus('METHOD_SELECTED');setError('');}}>Try Again</Button></Box>}
        <Button className="demo-pay-button" variant="contained" disabled={status==='PROCESSING'} onClick={()=>pay()}>{status==='PROCESSING'?<><CircularProgress size={19} color="inherit"/>Processing Payment...</>:`Pay ${formatCurrency(summary.total)}`}</Button><Box className="demo-test-actions"><Button onClick={()=>pay('FAILED')}>Test failure</Button><Button onClick={()=>{setStatus('CANCELLED');setError('');}}>Cancel demo</Button></Box><Box className="secure-note"><LockOutlinedIcon/><span><strong>Secure Checkout</strong>Your details stay in this browser session. Frontend demo only; no real payment will be processed.</span></Box>
      </Box></Box></section>
    </main>
  </Box>;
};

export default PaymentOptions;
