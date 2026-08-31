const request = async (path, options = {}) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('authToken');
  if (!user?.id || !token) throw new Error('Log in before starting payment.');
  const response = await fetch(path, { ...options,headers:{ 'content-type':'application/json',authorization:`Bearer ${token}`,'x-user-id':user.id,...options.headers } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Payment request failed.');
  return result;
};
export const loadRazorpay = () => new Promise((resolve,reject) => { if(window.Razorpay)return resolve();const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=resolve;script.onerror=()=>reject(new Error('Razorpay Checkout could not be loaded.'));document.head.appendChild(script); });
export const createRazorpayOrder = (payload) => request('/api/payments/create-order',{method:'POST',body:JSON.stringify(payload)});
export const verifyRazorpayPayment = (payload) => request('/api/payments/verify',{method:'POST',body:JSON.stringify(payload)});
export const cancelRazorpayPayment = (paymentId) => request('/api/payments/cancel',{method:'POST',body:JSON.stringify({paymentId})});
export const failRazorpayPayment = (paymentId, reason) => request('/api/payments/fail',{method:'POST',body:JSON.stringify({paymentId,reason})});
