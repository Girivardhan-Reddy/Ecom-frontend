import { useContext, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Collapse, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { buildOrderAddressesPayload, buildOrderItemsPayload, createOrder, getOrder, isOrderServiceUnavailable, normalizeOrder } from '../../services/orderApi';
import { createPayment, getPayment, getPaymentByOrder, getPaymentStatus, isPaymentServiceUnavailable, normalizePayment, processDemoPayment } from '../../services/paymentApi';
import './PaymentOptions.css';

const methods = [
  { id:'upi',label:'UPI',paymentMethod:'DEMO_UPI',icon:<PhoneAndroidIcon/>,caption:'Demo UPI approval' },
  { id:'card',label:'Cards',paymentMethod:'DEMO_CARD',icon:<CreditCardIcon/>,caption:'Demo card approval' },
  { id:'cod',label:'COD',paymentMethod:'DEMO_COD',icon:<PaymentsOutlinedIcon/>,caption:'Demo cash on delivery' },
];

const paymentStatusText = {
  PENDING: 'Payment is pending confirmation.',
  SUCCESS: 'Payment Service confirmed this payment.',
  FAILED: 'Payment Service reported a failed payment.',
  REFUNDED: 'Payment Service reported this payment as refunded.',
};

const PaymentOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCart, addresses, cartItems, clearCart, formatCurrency, user } = useContext(AppContext);
  const checkout = useMemo(() => location.state?.checkout || {}, [location.state]);
  const existingOrderId = location.state?.orderId || location.state?.order?.id || '';
  const existingOrder = useMemo(() => location.state?.order ? normalizeOrder(location.state.order) : null, [location.state]);
  const [method,setMethod] = useState('upi');
  const [status,setStatus] = useState('selecting');
  const [summaryOpen,setSummaryOpen] = useState(true);
  const [error,setError] = useState('');
  const [result,setResult] = useState(null);
  const [payment,setPayment] = useState(null);

  const summary = useMemo(() => {
    const subtotal = cartItems.reduce((sum,item)=>sum+Number(item.price)*Number(item.quantity),0);
    const delivery = Number(checkout.deliveryFee || 0);
    const handling = Number(checkout.handlingFee ?? (cartItems.length ? 5 : 0));
    const discount = Number(checkout.discount || 0);
    const orderTotal = Number(existingOrder?.totalAmount || 0);
    return { subtotal,delivery,handling,discount,total:orderTotal || Number(checkout.total ?? subtotal+delivery+handling-discount) };
  },[cartItems,checkout,existingOrder]);

  const resolveError = (reason) => {
    if (isOrderServiceUnavailable(reason)) return 'Order Service is unavailable. Please try again when backend is online.';
    if (isPaymentServiceUnavailable(reason)) return 'Payment Service is unavailable. Please try again when backend is online.';
    return reason.message || 'Payment could not be completed.';
  };

  const validate = () => {
    if (!user?.id) return 'Log in before placing an order.';
    if (!methods.some((item) => item.id === method)) return 'Select a supported demo payment method.';
    if (existingOrderId) return '';
    if (!cartItems.length) return 'Your cart is empty.';
    if (!activeCart?.id) return 'Cart Service has not returned an active cart yet.';
    if (!activeCart?.storeId) return 'Select a store before placing an order.';
    return '';
  };

  const createOrLoadOrder = async () => {
    if (existingOrderId) return normalizeOrder(existingOrder || await getOrder(existingOrderId));
    const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0] || {};
    return normalizeOrder(await createOrder({
      customerId: user.id,
      cartId: activeCart.id,
      storeId: activeCart.storeId,
      items: buildOrderItemsPayload(cartItems),
      addresses: buildOrderAddressesPayload(defaultAddress, checkout.deliveryAddress),
      notes: checkout.notes || '',
      deliveryMethod: checkout.method || 'standard',
      scheduledDate: checkout.date || null,
      scheduledSlot: checkout.slot || null,
      couponCode: checkout.coupon || '',
    }));
  };

  const pay = async () => {
    const validation = validate();
    if (validation) { setError(validation);setStatus('failed');return; }
    setError('');setStatus('submitting');
    try {
      const order = await createOrLoadOrder();
      if (!order.id) throw new Error('Order Service did not return an order ID.');
      if (!(order.totalAmount > 0)) throw new Error('Order Service did not return a valid order total.');
      const paymentMethod = methods.find((item) => item.id === method).paymentMethod;
      const createdPayment = normalizePayment(await createPayment({
        orderId: order.id,
        customerId: user.id,
        amount: order.totalAmount,
        currency: 'INR',
        paymentMethod,
      }));
      if (!createdPayment.paymentId) throw new Error('Payment Service did not return a payment ID.');
      setPayment(createdPayment);
      setStatus('pending');

      const processedPayment = normalizePayment({ ...createdPayment, ...(await processDemoPayment(createdPayment.paymentId, 'SUCCESS')) });
      setPayment(processedPayment);
      const statusPayload = await getPaymentStatus(createdPayment.paymentId);
      const confirmedStatus = typeof statusPayload === 'string' ? statusPayload : statusPayload?.status;
      const confirmedPayment = normalizePayment({ ...processedPayment, ...(await getPayment(createdPayment.paymentId)) });
      const orderPayment = await getPaymentByOrder(order.id).then(normalizePayment).catch(() => null);
      const latestPayment = orderPayment?.paymentId ? orderPayment : confirmedPayment;
      setPayment(latestPayment);

      if (confirmedStatus === 'SUCCESS' && latestPayment.status === 'SUCCESS') {
        if (!existingOrderId) await clearCart();
        setResult({ order, payment: latestPayment });
        setStatus('succeeded');
        return;
      }
      if (latestPayment.status === 'REFUNDED') { setStatus('refunded');return; }
      if (latestPayment.status === 'FAILED') { setStatus('failed');setError(paymentStatusText.FAILED);return; }
      setStatus('pending');
    } catch (reason) {
      setError(resolveError(reason));
      setStatus('failed');
    }
  };

  const activePaymentStatus = payment?.status || (status === 'pending' ? 'PENDING' : status === 'refunded' ? 'REFUNDED' : status === 'failed' && payment?.paymentId ? 'FAILED' : '');

  if (status === 'succeeded' && result) return <Box className="payment-shell"><Box className="payment-result"><Box className="success-ring"><CheckCircleOutlinedIcon/></Box><Typography variant="h4">Payment Successful</Typography><Typography color="text.secondary">Payment Service confirmed this payment.</Typography><Box className="result-amount"><span>Amount</span><strong>{formatCurrency(result.payment.amount)}</strong></Box><Box className="result-refs"><span>Order ID<strong>{result.order.id}</strong></span><span>Payment ID<strong>{result.payment.paymentId}</strong></span></Box><Box className="result-refs"><span>Payment Status<strong>{result.payment.status}</strong></span><span>Method<strong>{result.payment.paymentMethod}</strong></span></Box><Box className="result-actions"><Button variant="contained" onClick={()=>navigate(`/order/${encodeURIComponent(result.order.id)}`,{state:{orderId:result.order.id,paymentId:result.payment.paymentId}})}>View Order</Button><Button variant="outlined" onClick={()=>navigate('/home')}>Continue Shopping</Button></Box></Box></Box>;

  return <Box className="payment-shell">
    <header className="payment-header"><Button startIcon={<ArrowBackIcon/>} onClick={()=>navigate(-1)}>Secure Checkout</Button><Box><LockOutlinedIcon/><span>Secure Payment</span></Box></header>
    <main className="payment-layout">
      <section className={`order-summary-panel ${summaryOpen?'open':''}`}><button type="button" className="summary-toggle" onClick={()=>setSummaryOpen((value)=>!value)}><span><strong>Order Summary</strong><small>{existingOrder ? 'Backend order total' : `${cartItems.length} ${cartItems.length===1?'item':'items'}`}</small></span><strong>{formatCurrency(summary.total)}</strong><KeyboardArrowDownIcon/></button><Collapse in={summaryOpen}><Box className="summary-content">{cartItems.map((item)=><Box className="summary-product" key={`${item.productId}:${item.variantId}`}><span>{item.title}<small>{item.weight} x {item.quantity}</small></span><strong>{formatCurrency(Number(item.price)*Number(item.quantity))}</strong></Box>)}{existingOrder && cartItems.length === 0 && <Box className="summary-product"><span>Order {existingOrder.id}<small>Payment retry</small></span><strong>{formatCurrency(existingOrder.totalAmount)}</strong></Box>}<Box className="summary-totals"><span>Subtotal<strong>{formatCurrency(summary.subtotal)}</strong></span><span>Delivery<strong>{formatCurrency(summary.delivery)}</strong></span><span>Handling<strong>{formatCurrency(summary.handling)}</strong></span>{summary.discount>0&&<span className="summary-discount">Discount<strong>-{formatCurrency(summary.discount)}</strong></span>}<span className="summary-grand">Total<strong>{formatCurrency(summary.total)}</strong></span></Box>{checkout.deliveryAddress&&<Typography className="summary-address"><strong>Deliver to</strong>{checkout.deliveryAddress}</Typography>}</Box></Collapse></section>
      <section className="payment-method-panel"><Box className="payment-title"><Typography variant="h5">Payment Method</Typography><Typography>Choose a demo payment option</Typography></Box><Box className="method-workspace"><nav className="method-tabs">{methods.map((item)=><button type="button" key={item.id} className={method===item.id?'active':''} onClick={()=>{setMethod(item.id);setStatus('selecting');setError('');}}>{item.icon}<span>{item.label}</span></button>)}</nav><Box className="method-detail">
        <Box className="method-form"><Typography variant="h6">{methods.find((item)=>item.id===method)?.label} Demo Payment</Typography><Typography color="text.secondary">No card number, CVV, UPI PIN, bank login, or wallet credential is collected.</Typography><Box className="option-list">{methods.map((item)=><button type="button" key={item.id} className={method===item.id?'selected':''} onClick={()=>setMethod(item.id)}><span className="option-mark">{item.label.slice(0,2)}</span><span><strong>{item.paymentMethod}</strong><small>{item.caption}</small></span><i>{method===item.id?'●':'○'}</i></button>)}</Box></Box>
        {activePaymentStatus&&<Box className="payment-state-note" role="status"><strong>{activePaymentStatus}</strong><span>{paymentStatusText[activePaymentStatus] || 'Payment status received from Payment Service.'}</span>{payment?.paymentId&&<span>Payment ID: {payment.paymentId}</span>}</Box>}
        {status==='failed'&&<Box className="payment-error" role="alert"><ErrorOutlinedIcon/><Box><strong>Payment Failed</strong><span>{error || 'Please try again in a moment.'}</span></Box><Button onClick={()=>{setStatus('selecting');setError('');}}>Try Again</Button></Box>}
        <Button className="payment-button" variant="contained" disabled={status==='submitting'} onClick={()=>pay()}>{status==='submitting'?<><CircularProgress size={19} color="inherit"/>Processing Payment...</>:`Pay ${formatCurrency(summary.total)}`}</Button><Box className="secure-note"><LockOutlinedIcon/><span><strong>Secure Checkout</strong>Your order is created first, then Payment Service confirms the demo payment.</span></Box>
      </Box></Box></section>
    </main>
  </Box>;
};

export default PaymentOptions;
