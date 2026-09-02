const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('local-data-change', { detail: { key, value } }));
  return value;
};

const delay = (value, ms = 250) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
const CITY_COORDINATES={Hyderabad:[17.385,78.4867],Visakhapatnam:[17.6868,83.2185],Chennai:[13.0827,80.2707],Bengaluru:[12.9716,77.5946],Mumbai:[19.076,72.8777],Delhi:[28.6139,77.209],Kochi:[9.9312,76.2673],Pune:[18.5204,73.8567],Kolkata:[22.5726,88.3639],Ahmedabad:[23.0225,72.5714]};
const distanceKm=(from,to)=>{if(!from||!to)return Number.MAX_SAFE_INTEGER;const rad=(value)=>value*Math.PI/180;const dLat=rad(to[0]-from[0]);const dLon=rad(to[1]-from[1]);const a=Math.sin(dLat/2)**2+Math.cos(rad(from[0]))*Math.cos(rad(to[0]))*Math.sin(dLon/2)**2;return Math.round(6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));};

export const DEMO_OTP = '123456';

export const authStore = {
  requestOtp(phoneNumber) {
    write('pendingOtp', { phoneNumber, code: DEMO_OTP, expiresAt: Date.now() + 5 * 60 * 1000 });
    return delay({ sent: true });
  },
  async verifyOtp(phoneNumber, otp, registration = {}) {
    const pending = read('pendingOtp', null);
    if (!pending || pending.phoneNumber !== phoneNumber) throw new Error('Request a new OTP for this mobile number.');
    if (pending.expiresAt < Date.now()) throw new Error('OTP expired. Request a new OTP.');
    if (otp !== pending.code) throw new Error('Incorrect OTP. Use the demo OTP shown on this screen.');
    const existing = read('localUsers', []).find((item) => item.phone === phoneNumber);
    const isNewUser = !existing;
    const user = existing || { id: crypto.randomUUID(), name: registration.fullName || 'Customer', phone: phoneNumber, email: registration.email || '', role: 'customer' };
    const users = read('localUsers', []).filter((item) => item.phone !== phoneNumber);
    write('localUsers', [...users, user]);
    write('user', user);
    localStorage.removeItem('pendingOtp');
    return delay({ user, token: `local-${user.id}`, isNewUser });
  },
  async emailLogin(email, password) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
    if (password.length < 6) throw new Error('Password must contain at least 6 characters.');
    const users = read('localUsers', []);
    const existing = users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
    if (existing?.password && existing.password !== password) throw new Error('Incorrect email or password.');
    const user = existing || { id:crypto.randomUUID(),name:email.split('@')[0],email,password,phone:'',role:'customer' };
    write('localUsers', [...users.filter((item) => item.id !== user.id), user]);
    write('user', user);
    return delay({ user, token:`local-${user.id}`, isNewUser: !existing });
  },
  async socialLogin(provider) {
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    const users = read('localUsers', []);
    const existing = users.find((item) => item.id === `local-${provider}`);
    const user = existing || { id:`local-${provider}`,name:`${providerName} User`,email:`${provider}@local.demo`,phone:'',role:'customer',provider };
    write('localUsers', [...users.filter((item) => item.id !== user.id), user]);
    write('user', user);
    return delay({ user, token:`local-${provider}`, isNewUser: !existing });
  },
};

export const profileStore = {
  update(profile) {
    const current = read('user', {});
    const user = { ...current, ...profile };
    write('user', user);
    write('localUsers', read('localUsers', []).map((item) => item.id === user.id ? user : item));
    return delay(user);
  },
  remove() {
    const current = read('user', null);
    if (current) write('localUsers', read('localUsers', []).filter((item) => item.id !== current.id));
    ['user', 'authToken', 'isLoggedIn', 'cartItems', 'wishlistItems', 'addresses'].forEach((key) => localStorage.removeItem(key));
    return delay({ deleted: true });
  },
};

export const orderStore = {
  create({ cartItems, checkout, paymentMethod, localOrderId, payment }) {
    const orders = read('orders', []);
    const currentUser = read('user', {});
    const deliveryOtp = String(Math.floor(100000 + Math.random() * 900000));
    const stores = read('local:stores', []);
    const enrichedItems = cartItems.map((item) => { const store=stores.find((entry)=>entry.id===item.storeId||entry.name===item.store);return {...item,sourceStore:store?.name||item.store||'',sourceLocation:store?.location||item.location||'',sourceState:store?.state||item.state||''}; });
    const customerLocation=checkout?.customerLocation || '';
    const isGlobal=enrichedItems.some((item)=>item.sourceLocation&&!customerLocation.toLowerCase().includes(item.sourceLocation.toLowerCase()));
    const primarySource=enrichedItems[0] || {};
    const order = {
      id: localOrderId || `ORD-${Date.now()}`,
      items: enrichedItems.map((item)=>({...item,...(item.offerType==='Buy X Get Y'?{buyQuantity:Number(item.buyQuantity||1),freeQuantity:Math.floor(Number(item.quantity||1)/Number(item.buyQuantity||1))*Number(item.freeQuantity||1)}:{})})),
      fulfillmentType:isGlobal?'global':'nearby',
      channel:isGlobal?'India-wide Global Store':'Nearby Store',
      sourceStore:primarySource.sourceStore,
      sourceLocation:primarySource.sourceLocation,
      sourceState:primarySource.sourceState,
      store:primarySource.sourceStore,
      location:primarySource.sourceLocation,
      destinationLocation:customerLocation,
      globalApproval:isGlobal?'Pending':'Not Required',
      customer: { id:currentUser.id,name:currentUser.name || 'Customer',phone:currentUser.phone || '',email:currentUser.email || '' },
      checkout: checkout || { method: 'standard', total: cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) + 5 },
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'PAID',
      payment: payment || null,
      status: 'Pending',
      deliveryOtp,
      deliveryOtpVerified: false,
      createdAt: new Date().toISOString(),
      total: checkout?.total ?? cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) + 5,
    };
    write('orders', [order, ...orders]);
    const notifications = read('notifications', []);
    write('notifications', [{ id: crypto.randomUUID(), title: 'Order Placed', message: `${order.id} has been placed successfully.`, type: 'order', read: false, createdAt: new Date().toISOString() }, ...notifications]);
    const loyalty = read('loyalty', { points: 100, referralCode: 'PICKLES100', vouchers: [], referrals: 0 });
    write('loyalty', { ...loyalty, points: loyalty.points + Math.floor(order.total / 10) });
    return delay(order, 500);
  },
  list: () => read('orders', []),
  assignPartner(id, partner) {
    const current = read('orders', []).find((order) => order.id === id);
    if (!current) throw new Error('Order not found.');
    if (current.fulfillmentType === 'global') throw new Error('Global orders use parcel carriers, not local delivery partners.');
    if (!partner?.id) throw new Error('Select an active delivery partner.');
    if (['Delivered', 'Cancelled', 'Returned'].includes(current.status)) throw new Error('Completed or cancelled orders cannot be assigned.');
    const assignedAt = new Date().toISOString();
    const assignment = { id:partner.id, name:partner.name, phone:partner.phone, vehicleNumber:partner.vehicleNumber || partner.vehicle, assignedAt };
    const orders = read('orders', []).map((order) => order.id === id ? { ...order, deliveryPartner:assignment, deliveryPartnerId:partner.id, assignedAt } : order);
    write('orders', orders);
    write('notifications', [{ id:crypto.randomUUID(),title:'Delivery partner assigned',message:`${partner.name} was assigned to ${id}.`,type:'order',orderId:id,read:false,createdAt:assignedAt },...read('notifications', [])]);
    return orders.find((order) => order.id === id);
  },
  approveGlobal(id) {
    const current=read('orders',[]).find((order)=>order.id===id);
    if(!current||current.fulfillmentType!=='global') throw new Error('Global order not found.');
    if(current.globalApproval==='Approved') throw new Error('This global order is already approved and transferred.');
    const stores=read('local:stores',[]);const inventory=read('local:inventory',[]);
    const destination=String(current.destinationLocation||current.checkout?.customerLocation||'').toLowerCase();
    const assignments=(current.items||[]).map((requested)=>{const candidates=stores.map((store)=>{const stockRecord=inventory.find((item)=>item.productId===(requested.productId||requested.id)&&(!item.storeId||item.storeId===store.id));return {product:{id:requested.productId||requested.id,name:requested.title},store,stock:Number(stockRecord?.stock??0)};}).filter((candidate)=>candidate.store&&candidate.store.status!=='Inactive'&&candidate.stock>=Number(requested.quantity||1));const selected=candidates.find((candidate)=>destination.includes(String(candidate.store.location||candidate.store.city).toLowerCase()))||candidates.find((candidate)=>candidate.store.name===requested.sourceStore)||candidates[0];if(!selected)throw new Error(`${requested.title} is unavailable in every active store.`);return {item:requested,selected};});
    const selected=assignments[0]?.selected;
    if(!selected) throw new Error('This order has no fulfilment items.');
    const approvedAt=new Date().toISOString();
    const assignedItems=assignments.map(({item,selected:source})=>({...item,id:source.product.id,sourceStore:source.store.name,sourceLocation:source.store.location,sourceState:source.store.state}));
    const fulfilmentAssignments=[...new Map(assignments.map(({selected:source})=>[source.store.id,{storeId:source.store.id,store:source.store.name,location:source.store.location,state:source.store.state,status:'Assigned',assignedAt:approvedAt}])).values()];
    const orders=read('orders',[]).map((order)=>order.id===id?{...order,items:assignedItems,fulfilmentAssignments,globalApproval:'Approved',globalApprovedAt:approvedAt,status:'Confirmed',transferredToStore:true,assignmentMethod:destination.includes(String(selected.store.location).toLowerCase())?'Nearest stocked store':'Source stocked store',assignedStoreId:selected.store.id,sourceStore:selected.store.name,sourceStoreId:selected.store.id,sourceLocation:selected.store.location,sourceState:selected.store.state,store:selected.store.name,location:selected.store.location}:order);
    write('orders',orders);
    write('notifications',[{id:crypto.randomUUID(),title:'Global order transferred',message:`${id} was assigned to ${selected.store.name}, ${selected.store.location}, based on product availability and customer proximity.`,type:'order',orderId:id,read:false,createdAt:approvedAt},...read('notifications',[])]);
    return orders.find((order)=>order.id===id);
  },
  globalStoreOptions(id) {
    const order=read('orders',[]).find((item)=>item.id===id);
    if(!order||order.fulfillmentType!=='global') return [];
    const stores=read('local:stores',[]);const inventory=read('local:inventory',[]);const destinationName=Object.keys(CITY_COORDINATES).find((city)=>String(order.destinationLocation||order.checkout?.customerLocation||'').toLowerCase().includes(city.toLowerCase()));const origin=CITY_COORDINATES[destinationName];
    return stores.filter((store)=>store.status!=='Inactive').map((store)=>{const matches=(order.items||[]).map((requested)=>{const product={id:requested.productId||requested.id,name:requested.title};const stockRecord=inventory.find((item)=>item.productId===product.id&&(!item.storeId||item.storeId===store.id));const stock=Number(stockRecord?.stock??0);return {requested,product,stock,available:Boolean(product.id)&&stock>=Number(requested.quantity||1)};});const kilometres=distanceKm(origin,CITY_COORDINATES[store.location||store.city]);return {store,matches,kilometres,distanceLabel:kilometres===0?'Same city':kilometres===Number.MAX_SAFE_INTEGER?'Distance unavailable':`${kilometres.toLocaleString('en-IN')} km away`,eligible:matches.length>0&&matches.every((item)=>item.available)};}).filter((option)=>option.eligible).sort((a,b)=>a.kilometres-b.kilometres||a.store.name.localeCompare(b.store.name));
  },
  assignGlobalStore(id, storeId) {
    const current=read('orders',[]).find((order)=>order.id===id);if(!current)throw new Error('Order not found.');if(current.globalApproval==='Approved')throw new Error('This order has already been assigned.');
    const option=this.globalStoreOptions(id).find((item)=>item.store.id===storeId);if(!option)throw new Error('The selected store cannot fulfil every item in this order.');
    const assignedAt=new Date().toISOString();const assignedItems=option.matches.map(({requested,product})=>({...requested,id:product.id,sourceStore:option.store.name,sourceLocation:option.store.location,sourceState:option.store.state}));
    const assignment={storeId:option.store.id,store:option.store.name,location:option.store.location,state:option.store.state,status:'Assigned',assignedAt};
    const orders=read('orders',[]).map((order)=>order.id===id?{...order,items:assignedItems,fulfilmentAssignments:[assignment],globalApproval:'Approved',globalApprovedAt:assignedAt,status:'Confirmed',transferredToStore:true,assignmentMethod:option.nearby?'Global Admin selected nearby stocked store':'Global Admin selected stocked store',assignedStoreId:option.store.id,sourceStore:option.store.name,sourceStoreId:option.store.id,sourceLocation:option.store.location,sourceState:option.store.state,store:option.store.name,location:option.store.location}:order);
    write('orders',orders);write('notifications',[{id:crypto.randomUUID(),title:'Global order assigned',message:`${id} was assigned to ${option.store.name}, ${option.store.location}.`,type:'order',orderId:id,read:false,createdAt:assignedAt},...read('notifications',[])]);return orders.find((order)=>order.id===id);
  },
  dispatchParcel(id, carrier, trackingNumber) {
    const current=read('orders',[]).find((order)=>order.id===id);
    if(!current||current.fulfillmentType!=='global'||current.globalApproval!=='Approved') throw new Error('Approve and transfer the global order before parcel dispatch.');
    if(!['Ready for Pickup','Confirmed','Preparing'].includes(current.status)) throw new Error('The source store must confirm and prepare this order first.');
    if(!carrier||!trackingNumber) throw new Error('Select a parcel carrier and enter its tracking number.');
    const dispatchedAt=new Date().toISOString();
    const orders=read('orders',[]).map((order)=>order.id===id?{...order,status:'Out for Delivery',parcel:{carrier,trackingNumber,status:'In Transit',dispatchedAt}}:order);
    write('orders',orders);return orders.find((order)=>order.id===id);
  },
  updateParcelStatus(id, status) {
    const allowed=['Ready for Dispatch','In Transit','Delivered','Delivery Exception'];
    if(!allowed.includes(status)) throw new Error('Invalid parcel status.');
    const orders=read('orders',[]).map((order)=>order.id===id?{...order,status:status==='Delivered'?'Delivered':order.status,parcel:{...order.parcel,status,updatedAt:new Date().toISOString()},...(status==='Delivered'?{deliveredAt:new Date().toISOString()}: {})}:order);
    write('orders',orders);return orders.find((order)=>order.id===id);
  },
  updateStatus(id, status) {
    const refundableStatuses = ['Cancelled', 'Returned'];
    const transitions = { Pending:['Confirmed','Cancelled'], Confirmed:['Preparing','Cancelled'], Preparing:['Ready for Pickup','Cancelled'], 'Ready for Pickup':['Out for Delivery','Cancelled'], 'Out for Delivery':['Cancelled'], Delivered:['Returned'] };
    const current = read('orders', []).find((order) => order.id === id);
    if (!current) throw new Error('Order not found.');
    if (status === 'Delivered') throw new Error('Delivery can only be confirmed with the customer OTP.');
    if (current.status !== status && !transitions[current.status]?.includes(status)) throw new Error(`Move the order from ${current.status} through the next delivery stage first.`);
    const deliveryOtp = current.deliveryOtp || String(Math.floor(100000 + Math.random() * 900000));
    const orders = read('orders', []).map((order) => {
      if (order.id !== id) return order;
      const shouldRefund = refundableStatuses.includes(status) && order.paymentMethod !== 'cod' && ['PAID', 'Paid'].some((value) => order.paymentStatus?.startsWith(value));
      return {
        ...order,
        deliveryOtp,
        status,
        ...(shouldRefund ? {
          paymentStatus: 'Refunded (local demo)',
          refund: { id: `rfnd_demo_${Date.now()}`, amount: order.total, status: 'Processed', processedAt: new Date().toISOString() },
        } : {}),
      };
    });
    write('orders', orders);
    const notifications = read('notifications', []);
    const otpMessage = status === 'Out for Delivery' ? ` Your delivery OTP is ${deliveryOtp}. Share it only after receiving your order.` : '';
    write('notifications', [{ id: crypto.randomUUID(), title: `Order ${status}`, message: `${id} is now ${status}.${otpMessage}`, type: 'order', orderId:id, read: false, createdAt: new Date().toISOString() }, ...notifications]);
    return orders.find((order) => order.id === id);
  },
  verifyDeliveryOtp(id, otp) {
    const current = read('orders', []).find((order) => order.id === id);
    if (!current) throw new Error('Order not found.');
    if (current.status !== 'Out for Delivery') throw new Error('The order must be out for delivery before OTP verification.');
    if (current.deliveryOtpVerified) throw new Error('This delivery OTP has already been used.');
    if (String(otp).trim() !== current.deliveryOtp) throw new Error('Incorrect delivery OTP. Ask the customer for the latest OTP notification.');
    const deliveredAt = new Date().toISOString();
    const orders = read('orders', []).map((order) => order.id === id ? { ...order, status:'Delivered', deliveryOtpVerified:true, deliveredAt } : order);
    write('orders', orders);
    const notifications = read('notifications', []);
    write('notifications', [{ id:crypto.randomUUID(),title:'Order Delivered',message:`${id} was delivered successfully after OTP verification.`,type:'order',orderId:id,read:false,createdAt:deliveredAt },...notifications]);
    return orders.find((order) => order.id === id);
  },
};

export const deliveryPartnerStore = {
  list: () => read('local:delivery', []),
  authenticate(vehicleNumber, password) {
    const vehicle = String(vehicleNumber).trim().toUpperCase();
    const partner = read('local:delivery', []).find((item) => String(item.vehicleNumber || item.vehicle).trim().toUpperCase() === vehicle && item.status !== 'Inactive');
    if (!partner || partner.password !== password) throw new Error('Incorrect vehicle number or password.');
    return delay({ user:{ id:partner.id,name:partner.name,phone:partner.phone,vehicleNumber:partner.vehicleNumber || partner.vehicle,role:'delivery-partner',mustChangePassword:Boolean(partner.mustChangePassword) }, token:`local-delivery-${partner.id}` });
  },
  changePassword(id, currentPassword, newPassword) {
    const partner = read('local:delivery', []).find((item) => item.id === id);
    if (!partner || partner.password !== currentPassword) throw new Error('Current password is incorrect.');
    if (String(newPassword).length < 6) throw new Error('New password must contain at least 6 characters.');
    collectionStore.update('delivery', id, { password:newPassword,mustChangePassword:false,passwordChangedAt:new Date().toISOString() });
    const currentUser = read('user', null);
    if (currentUser?.id === id) write('user', { ...currentUser,mustChangePassword:false });
    return true;
  },
};

export const staffAuthStore = {
  authenticate(email, password, requestedRole) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const account = read('local:users', []).find((item) => String(item.email).toLowerCase() === normalizedEmail && item.status !== 'Blocked');
    if (!account || account.password !== password || account.role !== requestedRole) throw new Error('Incorrect email, password, or portal selection.');
    const user = { id:account.id,name:account.name,email:account.email,role:account.role,location:account.location || '',store:account.store || '' };
    return delay({ user, token:`local-staff-${account.id}-${Date.now()}` });
  },
};

const applyOwnershipScope=(name,data)=>{
  if(!['banners','coupons'].includes(name)) return data;
  const actor=read('user',null);if(!actor?.role)return data;
  if(actor.role==='global-admin') return {...data,scope:'Global',location:'',store:'',assignedBy:actor.id};
  if(actor.role==='location-admin'){const store=data.targetStore||data.store||'';return {...data,scope:store?'Store':'Location',location:actor.location,store,targetStore:store,assignedBy:actor.id};}
  if(actor.role==='store-manager') return {...data,scope:'Store',location:actor.location,store:actor.store,assignedBy:actor.id};
  return data;
};

export const collectionStore = {
  list: (name) => read(`local:${name}`, []),
  add(name, data) {
    const record = { ...applyOwnershipScope(name,data), id: crypto.randomUUID(), createdAt: new Date().toISOString(), active: true };
    write(`local:${name}`, [record, ...read(`local:${name}`, [])]);
    write('local:audit logs', [{ id:crypto.randomUUID(),name:`Created ${name}`,description:record.name || record.id,createdAt:new Date().toISOString() }, ...read('local:audit logs', [])]);
    return record;
  },
  update(name, id, data) {
    const scopedData=applyOwnershipScope(name,data);
    const records = read(`local:${name}`, []).map((record) => record.id === id ? { ...record, ...scopedData, updatedAt: new Date().toISOString() } : record);
    write(`local:${name}`, records);
    write('local:audit logs', [{ id:crypto.randomUUID(),name:`Updated ${name}`,description:id,createdAt:new Date().toISOString() }, ...read('local:audit logs', [])]);
    return records.find((record) => record.id === id);
  },
  remove(name, id) {
    const records = read(`local:${name}`, []).filter((record) => record.id !== id);
    write(`local:${name}`, records);
    write('local:audit logs', [{ id:crypto.randomUUID(),name:`Deleted ${name}`,description:id,createdAt:new Date().toISOString() }, ...read('local:audit logs', [])]);
    return records;
  },
  replace(name, records) {
    return write(`local:${name}`, records);
  },
};

export const subscribeToLocalData = (listener) => {
  const localHandler = (event) => listener(event.detail);
  const storageHandler = (event) => listener({ key: event.key });
  window.addEventListener('local-data-change', localHandler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener('local-data-change', localHandler);
    window.removeEventListener('storage', storageHandler);
  };
};

export const notificationStore = {
  list: () => read('notifications', []),
  add(notification) {
    const item = { id: crypto.randomUUID(), read: false, createdAt: new Date().toISOString(), ...notification };
    write('notifications', [item, ...read('notifications', [])]);
    return item;
  },
  update(id, notification) {
    return write('notifications', read('notifications', []).map((item) => item.id === id ? { ...item, ...notification, updatedAt:new Date().toISOString() } : item));
  },
  markRead(id) {
    return write('notifications', read('notifications', []).map((item) => item.id === id ? { ...item, read: true } : item));
  },
  remove(id) {
    return write('notifications', read('notifications', []).filter((item) => item.id !== id));
  },
  clear: () => write('notifications', []),
};

export const supportStore = {
  tickets: () => read('supportTickets', []),
  createTicket(ticket) {
    const item = { id: `TKT-${Date.now()}`, status: 'Open', createdAt: new Date().toISOString(), ...ticket };
    write('supportTickets', [item, ...read('supportTickets', [])]);
    return item;
  },
  messages: () => read('chatMessages', []),
  sendMessage(text, sender = 'customer') {
    const item = { id: crypto.randomUUID(), text, sender, createdAt: new Date().toISOString() };
    write('chatMessages', [...read('chatMessages', []), item]);
    return item;
  },
};

export const loyaltyStore = {
  get() {
    return read('loyalty', { points: 100, referralCode: 'PICKLES100', vouchers: [], referrals: 0 });
  },
  redeem(points) {
    const current = this.get();
    if (current.points < points) throw new Error('Not enough reward points.');
    const voucher = { id: crypto.randomUUID(), code: `GIFT${Date.now().toString().slice(-5)}`, value: points / 10 };
    const next = { ...current, points: current.points - points, vouchers: [voucher, ...current.vouchers] };
    write('loyalty', next);
    return next;
  },
};
