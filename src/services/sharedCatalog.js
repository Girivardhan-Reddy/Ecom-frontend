import { collectionStore } from './localDataService';
import pickleJarImg from '../assets/images/pickel-removebg-preview.png';
import mangoPickleImg from '../assets/images/mango_pickle_jar.png';
import lemonPickleImg from '../assets/images/lemon_pickle_jar.png';
import garlicPickleImg from '../assets/images/garlic_pickle_jar.png';
import redChilliImg from '../assets/images/red_chilli_powder.png';
import homeSpicesImg from '../assets/images/home_spices.png';
import wholeSpicesImg from '../assets/images/whole_spices.png';
import dryFruitsImg from '../assets/images/dry_fruits.png';

const product = (name, category, price, image, weight = '500g', flags = {}) => ({
  id: `seed-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name, title: name, category, price, offerPrice: price, image, weight,
  sku: `SP-${name.replace(/[^A-Z]/gi, '').slice(0, 6).toUpperCase()}`,
  stock: 25, lowStockAt: 5, status: 'Active', active: true,
  pickup: 'Yes', deliveryMinutes: 25,
  description: `Authentic ${name.toLowerCase()} prepared with premium ingredients.`,
  ...flags,
});

export const seedSharedCatalog = () => {
  if (!localStorage.getItem('local:products')) {
    collectionStore.replace('products', [
      product('Avakaya Pickle','Pickles',199,mangoPickleImg,'500g',{bestSeller:'Yes',featured:'Yes'}),
      product('Lemon Pickle','Pickles',189,lemonPickleImg),
      product('Gongura Pickle','Pickles',199,pickleJarImg),
      product('Garlic Pickle','Pickles',209,garlicPickleImg,'500g',{special:'Yes'}),
      product('Red Chilli Powder','Spice powder',120,redChilliImg,'250g',{featured:'Yes'}),
      product('Turmeric Powder','Spice powder',89,homeSpicesImg,'250g'),
      product('Garam Masala','Masalas',110,wholeSpicesImg,'100g',{special:'Yes'}),
      product('Whole Clove (Laung)','Whole Masala',149,wholeSpicesImg,'100g'),
      product('Premium Jumbo Cashews','Dry Fruits',349,dryFruitsImg,'250g',{newArrival:'Yes'}),
      product('California Almonds (Badam)','Dry Fruits',450,dryFruitsImg,'500g',{newArrival:'Yes'}),
    ]);
  }
  const storedProducts = collectionStore.list('products');
  const seedStores = ['Gachibowli Store', 'Jubilee Hills Store', 'Madhapur Store'];
  if (storedProducts.some((item) => item.pickup == null || item.deliveryMinutes == null || !item.store)) {
    collectionStore.replace('products', storedProducts.map((item, index) => ({
      ...item,
      pickup: item.pickup ?? 'Yes',
      deliveryMinutes: item.deliveryMinutes ?? 25,
      store: item.store || seedStores[index % seedStores.length],
    })));
  }
  if (!localStorage.getItem('local:categories')) collectionStore.replace('categories', [
    {id:'cat-pickles',name:'Pickles',image:mangoPickleImg,status:'Active',sortOrder:1},
    {id:'cat-whole',name:'Whole Masala',image:wholeSpicesImg,status:'Active',sortOrder:2},
    {id:'cat-masalas',name:'Masalas',image:wholeSpicesImg,status:'Active',sortOrder:3},
    {id:'cat-powder',name:'Spice powder',image:homeSpicesImg,status:'Active',sortOrder:4},
    {id:'cat-dry',name:'Dry Fruits',image:dryFruitsImg,status:'Active',sortOrder:5},
  ]);
  if (!localStorage.getItem('local:stores')) collectionStore.replace('stores', [
    {id:'store-gachibowli',name:'Gachibowli Store',location:'Hyderabad',status:'Active'},
    {id:'store-jubilee',name:'Jubilee Hills Store',location:'Hyderabad',status:'Active'},
    {id:'store-madhapur',name:'Madhapur Store',location:'Hyderabad',status:'Active'},
  ]);
  const seededStaff = [
    {id:'staff-super',name:'Platform Owner',email:'super@thejo.app',password:'Super@123',role:'super-admin',status:'Active'},
    {id:'staff-global',name:'Global Operations',email:'global@thejo.app',password:'Global@123',role:'global-admin',status:'Active'},
    {id:'staff-location',name:'Hyderabad Admin',email:'location@thejo.app',password:'Location@123',role:'location-admin',location:'Hyderabad',status:'Active'},
    {id:'staff-store',name:'Gachibowli Manager',email:'manager@thejo.app',password:'Manager@123',role:'store-manager',location:'Hyderabad',store:'Gachibowli Store',status:'Active'},
  ];
  const existingStaff = collectionStore.list('users');
  if (seededStaff.some((seed) => !existingStaff.some((item) => item.id === seed.id))) collectionStore.replace('users', [...existingStaff,...seededStaff.filter((seed) => !existingStaff.some((item) => item.id === seed.id))]);
  if (!localStorage.getItem('local:inventory')) {
    collectionStore.replace('inventory', collectionStore.list('products').map((item) => ({
      id:item.id,name:item.name,productId:item.id,sku:item.sku,stock:Number(item.stock || 0),lowStockAt:Number(item.lowStockAt || 5),availability:'Available',status:'Active'
    })));
  }
  seedDemoWorkspace();
};

const locations = ['Gachibowli','Jubilee Hills','Madhapur','Kondapur','Banjara Hills','Kukatpally','Hitech City','Manikonda','Begumpet','Secunderabad'];
const categorySeeds = [
  ['Pickles',mangoPickleImg],['Whole Masala',wholeSpicesImg],['Masalas',wholeSpicesImg],['Spice powder',homeSpicesImg],['Dry Fruits',dryFruitsImg],
  ['Chutneys',garlicPickleImg],['Snacks',pickleJarImg],['Sweets',dryFruitsImg],['Millets',homeSpicesImg],['Gift Packs',mangoPickleImg],
];
const productNames = ['Avakaya Pickle','Lemon Pickle','Gongura Pickle','Garlic Pickle','Red Chilli Powder','Turmeric Powder','Garam Masala','Whole Clove','Jumbo Cashews','California Almonds','Tomato Pickle','Ginger Pickle','Coriander Powder','Cumin Seeds','Black Pepper','Prawn Pickle','Chicken Pickle','Mango Chutney','Millet Mixture','Festival Gift Box'];

const seedDemoWorkspace = () => {
  if (!localStorage.getItem('demo-seed-v2')) {
    const stores = locations.map((area,index) => ({ id:`store-${index+1}`,name:`${area} Store`,location:area,address:`${index+10}, Main Road, ${area}, Hyderabad`,phone:`90000000${String(index+10).slice(-2)}`,email:`${area.toLowerCase().replaceAll(' ','')}@thejo.demo`,delivery:'Yes',pickup:'Yes',status:'Active' }));
    const categories = categorySeeds.map(([name,image],index) => ({ id:`cat-${index+1}`,name,image,description:`Authentic ${name.toLowerCase()} collection`,sortOrder:index+1,status:'Active' }));
    const products = Array.from({ length:100 }, (_,index) => {
      const base=productNames[index%productNames.length]; const category=categorySeeds[index%categorySeeds.length][0]; const store=stores[index%stores.length];
      return product(`${base} ${index+1}`,category,79+(index%18)*15,categorySeeds[index%categorySeeds.length][1],index%3===0?'250g':'500g',{ id:`product-${index+1}`,sku:`THEJO-${String(index+1).padStart(4,'0')}`,store:store.name,location:store.location,stock:15+(index%45),offerPrice:75+(index%18)*14,status:'Active' });
    });
    const partners = Array.from({ length:8 }, (_,index) => ({ id:`partner-${index+1}`,name:['Ravi Kumar','Suresh Reddy','Arjun Rao','Kiran Yadav','Mohammed Ali','Naveen Goud','Vijay Kumar','Ramesh Naik'][index],phone:`98765000${String(index+11).slice(-2)}`,email:`rider${index+1}@thejo.demo`,vehicleNumber:`TS09AB${String(1201+index)}`,vehicleType:index%2?'Scooter':'Bike',address:`${20+index}, ${locations[index]} Main Road, Hyderabad`,location:locations[index],emergencyContact:`91234000${String(index+31).slice(-2)}`,licenseNumber:`DL-TS-${2026001+index}`,password:'Rider@123',mustChangePassword:true,status:'Active',createdAt:new Date(Date.now()-index*86400000).toISOString() }));
    const customers = Array.from({ length:75 }, (_,index) => ({ id:`customer-${index+1}`,name:`Sample Customer ${index+1}`,phone:`910000${String(1000+index)}`,email:`customer${index+1}@example.com`,location:locations[index%locations.length],address:`Flat ${index+1}, ${locations[index%locations.length]}, Hyderabad`,spending:500+(index%20)*175,status:index%17===0?'Blocked':'Active',createdAt:new Date(Date.now()-index*3600000).toISOString() }));
    const statuses=['Pending','Confirmed','Preparing','Ready for Pickup','Out for Delivery','Delivered','Cancelled'];
    const orders=Array.from({ length:75 }, (_,index) => { const customer=customers[index%customers.length]; const status=statuses[index%statuses.length]; const partner=partners[index%partners.length]; const assigned=!['Pending','Cancelled'].includes(status); const item=products[index%products.length]; return { id:`ORD-DEMO-${String(index+1).padStart(4,'0')}`,items:[{ id:item.id,title:item.name,price:item.offerPrice,quantity:1+(index%3),weight:item.weight }],customer:{ id:customer.id,name:customer.name,phone:customer.phone,email:customer.email },checkout:{ method:'standard',deliveryAddress:customer.address,subtotal:item.offerPrice*(1+(index%3)),deliveryFee:29,handlingFee:5,total:item.offerPrice*(1+(index%3))+34 },total:item.offerPrice*(1+(index%3))+34,paymentMethod:index%2?'cod':'razorpay-demo',paymentStatus:index%2?'Pending':'PAID',status,deliveryOtp:String(230000+index),deliveryOtpVerified:status==='Delivered',...(assigned?{deliveryPartner:{ id:partner.id,name:partner.name,phone:partner.phone,vehicleNumber:partner.vehicleNumber,assignedAt:new Date(Date.now()-index*3500000).toISOString() },deliveryPartnerId:partner.id}:{}),createdAt:new Date(Date.now()-index*3600000).toISOString(),...(status==='Delivered'?{deliveredAt:new Date(Date.now()-index*3500000).toISOString()}: {}) }; });
    const coupons=Array.from({ length:20 }, (_,index) => ({ id:`coupon-${index+1}`,name:`SAVE${10+index}`,couponName:`Sample offer ${index+1}`,description:`Save on selected ${categorySeeds[index%categorySeeds.length][0]}`,discountType:index%2?'Percentage':'Fixed',discount:index%2?10+(index%15):50+(index%5)*25,minimumOrder:299,maximumDiscount:300,startDate:'2026-01-01',expiry:'2027-12-31',usageLimit:500,perUserLimit:2,location:locations[index%locations.length],store:stores[index%stores.length].name,product:products[index%products.length].name,category:categorySeeds[index%categorySeeds.length][0],eligibility:index%3===0?'New customers':index%3===1?'All customers':'Returning customers',status:'Active' }));
    collectionStore.replace('stores',stores); collectionStore.replace('categories',categories); collectionStore.replace('products',products); collectionStore.replace('delivery',partners); collectionStore.replace('customers',customers); collectionStore.replace('coupons',coupons); collectionStore.replace('inventory',products.map((item)=>({ id:item.id,name:item.name,productId:item.id,sku:item.sku,stock:item.stock,lowStockAt:5,availability:'Available',status:'Active' })));
    localStorage.setItem('orders',JSON.stringify(orders));
    localStorage.setItem('demo-seed-v2','complete');
  }
  if (!localStorage.getItem('demo-seed-v3-home-sections')) {
    collectionStore.replace('products', collectionStore.list('products').map((item,index) => ({
      ...item,
      bestSeller: item.bestSeller === 'Yes' || index % 5 === 0 ? 'Yes' : item.bestSeller || 'No',
      featured: item.featured === 'Yes' || index % 4 === 0 ? 'Yes' : item.featured || 'No',
      special: item.special === 'Yes' || index % 6 === 0 ? 'Yes' : item.special || 'No',
      newArrival: item.newArrival === 'Yes' || index < 12 ? 'Yes' : item.newArrival || 'No',
      createdAt: item.createdAt || new Date(Date.now() - index * 3600000).toISOString(),
    })));
    collectionStore.replace('stores', collectionStore.list('stores').map((store) => ({ ...store,availability:'Available',delivery:store.delivery || 'Yes',status:store.status || 'Active' })));
    localStorage.setItem('demo-seed-v3-home-sections','complete');
  }
  if (!localStorage.getItem('demo-seed-v4-order-assignments')) {
    const partners = collectionStore.list('delivery').filter((partner) => partner.status !== 'Inactive');
    const demoOrders = JSON.parse(localStorage.getItem('orders') || '[]').map((order,index) => {
      if (!String(order.id).startsWith('ORD-DEMO-')) return order;
      const shouldAssign = index % 2 === 0 && !['Cancelled','Returned'].includes(order.status);
      if (!shouldAssign || partners.length === 0) {
        const unassignedOrder = { ...order };
        delete unassignedOrder.deliveryPartner;
        delete unassignedOrder.deliveryPartnerId;
        delete unassignedOrder.assignedAt;
        return unassignedOrder;
      }
      const partner = partners[index % partners.length];
      const assignedAt = order.assignedAt || new Date(Date.now() - index * 3000000).toISOString();
      return { ...order,deliveryPartnerId:partner.id,assignedAt,deliveryPartner:{ id:partner.id,name:partner.name,phone:partner.phone,vehicleNumber:partner.vehicleNumber || partner.vehicle,assignedAt } };
    });
    localStorage.setItem('orders', JSON.stringify(demoOrders));
    localStorage.setItem('demo-seed-v4-order-assignments','complete');
  }
  if (!localStorage.getItem('sample-data-v5-large')) {
    const now = Date.now();
    const locationRecords = locations.map((name,index)=>({id:`location-${index+1}`,name,code:`HYD-${String(index+1).padStart(2,'0')}`,city:'Hyderabad',state:'Telangana',country:'India',pincode:String(500001+index),status:'Active'}));
    const stores = locations.flatMap((area,locationIndex)=>Array.from({length:5},(_,storeIndex)=>({id:`sample-store-${locationIndex+1}-${storeIndex+1}`,name:`${area} Store ${storeIndex+1}`,location:area,address:`${10+storeIndex}, ${area} Main Road, Hyderabad`,phone:`900${String(locationIndex).padStart(2,'0')}${String(storeIndex).padStart(5,'0')}`,email:`${area.toLowerCase().replaceAll(' ','')}.store${storeIndex+1}@thejo.app`,delivery:'Yes',pickup:'Yes',status:'Active',createdAt:new Date(now-(locationIndex*5+storeIndex)*86400000).toISOString()})));
    // Keep the seeded manager's store name stable while still providing five stores per location.
    stores[0].name='Gachibowli Store';
    const products = Array.from({length:300},(_,index)=>{const store=stores[index%stores.length];const base=productNames[index%productNames.length];const category=categorySeeds[index%categorySeeds.length];return product(`${base} ${index+1}`,category[0],89+(index%22)*14,category[1],index%3===0?'250g':'500g',{id:`sample-product-${index+1}`,sku:`THEJO-${String(index+1).padStart(5,'0')}`,store:store.name,location:store.location,stock:10+(index%90),lowStockAt:12,offerPrice:79+(index%22)*13,status:'Active',createdAt:new Date(now-index*3600000).toISOString()});});
    const partners=Array.from({length:100},(_,index)=>{const store=stores[index%stores.length];return {id:`sample-partner-${index+1}`,name:`Delivery Partner ${index+1}`,phone:`98${String(70000000+index)}`,email:`partner${index+1}@thejo.app`,vehicleNumber:`TS09DP${String(1000+index)}`,vehicleType:index%3===0?'Electric Bike':index%2?'Scooter':'Bike',address:`${40+index}, ${store.location}, Hyderabad`,location:store.location,store:store.name,emergencyContact:`91${String(60000000+index)}`,licenseNumber:`DL-TS-${String(2026000+index)}`,password:'Rider@123',mustChangePassword:true,status:index%9===0?'On Delivery':'Active',createdAt:new Date(now-index*7200000).toISOString()};});
    const customers=Array.from({length:1500},(_,index)=>{const store=stores[index%stores.length];return {id:`sample-customer-${index+1}`,name:`Customer ${String(index+1).padStart(4,'0')}`,phone:`91${String(10000000+index)}`,email:`customer${index+1}@example.com`,location:store.location,store:store.name,address:`Flat ${index+1}, ${store.location}, Hyderabad`,spending:300+(index%50)*125,status:index%37===0?'Blocked':'Active',createdAt:new Date(now-index*1800000).toISOString()};});
    const orderStatuses=['Pending','Confirmed','Preparing','Ready for Pickup','Out for Delivery','Delivered','Cancelled'];
    const orders=Array.from({length:1500},(_,index)=>{const customer=customers[index];const store=stores[index%stores.length];const storeProducts=products.filter((item)=>item.store===store.name);const item=storeProducts[index%storeProducts.length];const status=orderStatuses[index%orderStatuses.length];const eligiblePartners=partners.filter((partner)=>partner.store===store.name);const partner=eligiblePartners[index%eligiblePartners.length];const quantity=1+(index%3);const subtotal=item.offerPrice*quantity;const assigned=!['Pending','Cancelled'].includes(status);return {id:`ORD-SAMPLE-${String(index+1).padStart(6,'0')}`,store:store.name,location:store.location,items:[{id:item.id,title:item.name,price:item.offerPrice,quantity,weight:item.weight}],customer:{id:customer.id,name:customer.name,phone:customer.phone,email:customer.email},checkout:{method:index%3===0?'express':'standard',deliveryAddress:customer.address,subtotal,deliveryFee:29,handlingFee:5,total:subtotal+34},total:subtotal+34,paymentMethod:index%2?'cod':'razorpay',paymentStatus:index%2?'Pending':'PAID',status,deliveryOtp:String(300000+(index%699999)),deliveryOtpVerified:status==='Delivered',...(assigned&&partner?{deliveryPartner:{id:partner.id,name:partner.name,phone:partner.phone,vehicleNumber:partner.vehicleNumber,assignedAt:new Date(now-index*1700000).toISOString()},deliveryPartnerId:partner.id}:{}),createdAt:new Date(now-index*1800000).toISOString(),...(status==='Delivered'?{deliveredAt:new Date(now-index*1700000).toISOString()}: {})};});
    const inventory=products.map((item)=>({id:item.id,name:item.name,productId:item.id,sku:item.sku,store:item.store,location:item.location,stock:item.stock,reserved:item.stock%7,lowStockAt:item.lowStockAt,availability:item.stock>0?'Available':'Unavailable',status:'Active'}));
    const payments=orders.map((order,index)=>({id:`sample-payment-${index+1}`,name:order.id,orderId:order.id,store:order.store,location:order.location,amount:order.total,method:order.paymentMethod,status:order.paymentStatus,createdAt:order.createdAt}));
    const reviews=Array.from({length:1200},(_,index)=>{const customer=customers[index];const item=products[index%products.length];return {id:`sample-review-${index+1}`,name:customer.name,customerId:customer.id,product:item.name,productId:item.id,store:item.store,location:item.location,text:`Verified sample review for ${item.name}.`,rating:1+(index%5),status:index%8===0?'Pending':'Approved',createdAt:new Date(now-index*2400000).toISOString()};});
    const coupons=Array.from({length:100},(_,index)=>{const store=stores[index%stores.length];return {id:`sample-coupon-${index+1}`,name:`LOCAL${String(index+1).padStart(3,'0')}`,couponName:`${store.location} offer ${index+1}`,description:`Location promotion for ${store.name}`,discountType:index%2?'Percentage':'Fixed',discount:index%2?10+(index%15):50+(index%5)*25,minimumOrder:299,maximumDiscount:300,startDate:'2026-01-01',expiry:'2027-12-31',usageLimit:500,perUserLimit:2,location:store.location,store:store.name,eligibility:'All customers',status:'Active'};});
    const banners=Array.from({length:50},(_,index)=>{const store=stores[index];return {id:`sample-banner-${index+1}`,name:`${store.location} seasonal campaign`,description:`Featured products at ${store.name}`,location:store.location,store:store.name,sortOrder:index+1,status:'Active'};});
    const mergeSamples=(name,generated,sampleIdPattern)=>[...collectionStore.list(name).filter((item)=>!sampleIdPattern.test(String(item.id))),...generated];
    collectionStore.replace('locations',mergeSamples('locations',locationRecords,/^(location-|sample-)/));collectionStore.replace('stores',mergeSamples('stores',stores,/^(store-|sample-)/));collectionStore.replace('products',mergeSamples('products',products,/^(product-|seed-|sample-)/));collectionStore.replace('delivery',mergeSamples('delivery',partners,/^(partner-|sample-)/));collectionStore.replace('customers',mergeSamples('customers',customers,/^(customer-|sample-)/));collectionStore.replace('inventory',mergeSamples('inventory',inventory,/^(product-|seed-|sample-)/));collectionStore.replace('payments',mergeSamples('payments',payments,/^sample-/));collectionStore.replace('reviews',mergeSamples('reviews',reviews,/^sample-/));collectionStore.replace('coupons',mergeSamples('coupons',coupons,/^(coupon-|sample-)/));collectionStore.replace('banners',mergeSamples('banners',banners,/^sample-/));
    const existingOrders=JSON.parse(localStorage.getItem('orders')||'[]').filter((order)=>!/^ORD-(DEMO|SAMPLE)-/.test(String(order.id)));
    localStorage.setItem('orders',JSON.stringify([...existingOrders,...orders]));
    localStorage.setItem('sample-data-v5-large','complete');
  }
  if (!localStorage.getItem('sample-data-v6-india-fulfilment')) {
    // Remove superseded demo payloads before building the India dataset. This keeps
    // the synchronous local development adapter below the browser storage quota.
    const preservedOrders=JSON.parse(localStorage.getItem('orders')||'[]').filter((order)=>!/^ORD-(DEMO|SAMPLE|INDIA)-/.test(String(order.id)));
    localStorage.setItem('orders',JSON.stringify(preservedOrders));
    ['reviews','coupons','banners'].forEach((name)=>collectionStore.replace(name,collectionStore.list(name).filter((item)=>!String(item.id).startsWith('sample-'))));
    const geographies=[
      {city:'Hyderabad',state:'Telangana',areas:['Gachibowli','Ameerpet','SR Nagar','Kokapet','Madhapur']},
      {city:'Chennai',state:'Tamil Nadu',areas:['T Nagar','Adyar','Velachery','Anna Nagar','Porur']},
      {city:'Bengaluru',state:'Karnataka',areas:['Indiranagar','Whitefield','Koramangala','Jayanagar','Hebbal']},
      {city:'Mumbai',state:'Maharashtra',areas:['Andheri','Bandra','Powai','Dadar','Borivali']},
      {city:'Delhi',state:'Delhi',areas:['Rohini','Dwarka','Saket','Karol Bagh','Lajpat Nagar']},
      {city:'Kochi',state:'Kerala',areas:['Kakkanad','Edappally','Vyttila','Fort Kochi','Kaloor']},
      {city:'Pune',state:'Maharashtra',areas:['Hinjewadi','Kothrud','Baner','Hadapsar','Viman Nagar']},
      {city:'Kolkata',state:'West Bengal',areas:['Salt Lake','Howrah','New Town','Park Street','Ballygunge']},
      {city:'Ahmedabad',state:'Gujarat',areas:['Navrangpura','Bopal','Satellite','Maninagar','Thaltej']},
      {city:'Visakhapatnam',state:'Andhra Pradesh',areas:['MVP Colony','Gajuwaka','Madhurawada','Dwaraka Nagar','Seethammadhara']},
    ];
    const generatedAt=Date.now();
    const cityRecords=geographies.map((geo,index)=>({id:`india-location-${index+1}`,name:geo.city,city:geo.city,state:geo.state,country:'India',code:`IND-${String(index+1).padStart(2,'0')}`,status:'Active'}));
    const indiaStores=geographies.flatMap((geo,cityIndex)=>geo.areas.map((area,areaIndex)=>({id:`india-store-${cityIndex+1}-${areaIndex+1}`,name:`${area} Store`,area,location:geo.city,city:geo.city,state:geo.state,country:'India',address:`${20+areaIndex}, Main Road, ${area}, ${geo.city}, ${geo.state}`,phone:`900${String(cityIndex).padStart(2,'0')}${String(areaIndex).padStart(5,'0')}`,email:`${area.toLowerCase().replaceAll(' ','')}@thejo.app`,delivery:'Yes',pickup:'Yes',status:'Active'})));
    const indiaProducts=Array.from({length:500},(_,index)=>{const source=indiaStores[index%indiaStores.length];const base=productNames[index%productNames.length];const category=categorySeeds[index%categorySeeds.length];return product(`${base} ${index+1}`,category[0],99+(index%25)*12,category[1],index%3?'500g':'250g',{id:`india-product-${index+1}`,sku:`IND-${String(index+1).padStart(5,'0')}`,store:source.name,storeId:source.id,area:source.area,location:source.city,state:source.state,stock:15+(index%110),lowStockAt:15,offerPrice:89+(index%25)*11,status:'Active',createdAt:new Date(generatedAt-index*3600000).toISOString()});});
    const indiaPartners=Array.from({length:150},(_,index)=>{const source=indiaStores[index%indiaStores.length];return {id:`india-partner-${index+1}`,name:`India Delivery Partner ${index+1}`,phone:`98${String(50000000+index)}`,email:`india.partner${index+1}@thejo.app`,vehicleNumber:`DP${String(100000+index)}`,vehicleType:index%2?'Scooter':'Bike',store:source.name,storeId:source.id,area:source.area,location:source.city,state:source.state,address:source.address,password:'Rider@123',mustChangePassword:true,status:index%11===0?'On Delivery':'Active',createdAt:new Date(generatedAt-index*7200000).toISOString()};});
    const indiaCustomers=Array.from({length:2000},(_,index)=>{const destination=geographies[index%geographies.length];const area=destination.areas[index%destination.areas.length];return {id:`india-customer-${index+1}`,name:`India Customer ${String(index+1).padStart(4,'0')}`,phone:`91${String(20000000+index)}`,email:`india.customer${index+1}@example.com`,location:destination.city,city:destination.city,state:destination.state,address:`Flat ${index+1}, ${area}, ${destination.city}, ${destination.state}`,spending:500+(index%80)*100,status:index%53===0?'Blocked':'Active',createdAt:new Date(generatedAt-index*1800000).toISOString()};});
    const statuses=['Pending','Confirmed','Preparing','Ready for Pickup','Out for Delivery','Delivered','Cancelled'];
    indiaCustomers.splice(1200);
    const indiaOrders=Array.from({length:2500},(_,index)=>{const customer=indiaCustomers[index%indiaCustomers.length];const makeGlobal=index%3===0;const destinationGeo=geographies.find((geo)=>geo.city===customer.city);const sourceCityIndex=makeGlobal?(geographies.findIndex((geo)=>geo.city===customer.city)+1+index%8)%geographies.length:geographies.findIndex((geo)=>geo.city===customer.city);const possibleStores=indiaStores.filter((store)=>store.city===geographies[sourceCityIndex].city);const source=possibleStores[index%possibleStores.length];const possibleProducts=indiaProducts.filter((item)=>item.store===source.name);const item=possibleProducts[index%possibleProducts.length];const possiblePartners=indiaPartners.filter((partner)=>partner.store===source.name);const partner=possiblePartners[index%possiblePartners.length];const status=statuses[index%statuses.length];const approved=!makeGlobal||index%4!==0;const effectiveStatus=makeGlobal&&!approved?'Pending':status;const quantity=1+(index%3);const subtotal=item.offerPrice*quantity;return {id:`ORD-INDIA-${String(index+1).padStart(7,'0')}`,fulfillmentType:makeGlobal?'global':'nearby',channel:makeGlobal?'India-wide Global Store':'Nearby Store',globalApproval:makeGlobal?(approved?'Approved':'Pending'):'Not Required',transferredToStore:approved,sourceStore:source.name,sourceStoreId:source.id,sourceLocation:source.city,sourceState:source.state,store:source.name,location:source.city,destinationLocation:customer.city,destinationState:destinationGeo.state,items:[{id:item.id,title:item.name,price:item.offerPrice,quantity,weight:item.weight,sourceStore:source.name,sourceLocation:source.city,sourceState:source.state}],customer:{id:customer.id,name:customer.name,phone:customer.phone,email:customer.email},checkout:{method:makeGlobal?'standard-parcel':index%2?'standard':'instant',deliveryAddress:customer.address,customerLocation:`${customer.city}, ${customer.state}`,subtotal,deliveryFee:makeGlobal?79:29,handlingFee:5,total:subtotal+(makeGlobal?84:34)},total:subtotal+(makeGlobal?84:34),paymentMethod:index%2?'cod':'razorpay',paymentStatus:index%2?'Pending':'PAID',status:effectiveStatus,deliveryOtp:String(300000+(index%699999)),deliveryOtpVerified:effectiveStatus==='Delivered',...((approved&&partner&&!['Pending','Cancelled'].includes(effectiveStatus))?{deliveryPartner:{id:partner.id,name:partner.name,phone:partner.phone,vehicleNumber:partner.vehicleNumber,assignedAt:new Date(generatedAt-index*1700000).toISOString()},deliveryPartnerId:partner.id}:{}),createdAt:new Date(generatedAt-index*1800000).toISOString(),...(effectiveStatus==='Delivered'?{deliveredAt:new Date(generatedAt-index*1700000).toISOString()}: {})};});
    indiaOrders.splice(1200);
    const indiaInventory=indiaProducts.map((item)=>({id:item.id,name:item.name,productId:item.id,sku:item.sku,store:item.store,storeId:item.storeId,area:item.area,location:item.location,state:item.state,stock:item.stock,reserved:item.stock%8,lowStockAt:item.lowStockAt,availability:'Available',status:'Active'}));
    collectionStore.replace('locations',cityRecords);collectionStore.replace('stores',indiaStores);collectionStore.replace('products',indiaProducts);collectionStore.replace('delivery',indiaPartners);collectionStore.replace('customers',indiaCustomers);collectionStore.replace('inventory',indiaInventory);
    collectionStore.replace('payments',indiaOrders.map((order,index)=>({id:`india-payment-${index+1}`,name:order.id,orderId:order.id,fulfillmentType:order.fulfillmentType,store:order.sourceStore,location:order.sourceLocation,amount:order.total,method:order.paymentMethod,status:order.paymentStatus,createdAt:order.createdAt})));
    const nonSampleOrders=JSON.parse(localStorage.getItem('orders')||'[]').filter((order)=>!/^ORD-(DEMO|SAMPLE|INDIA)-/.test(String(order.id)));localStorage.setItem('orders',JSON.stringify([...nonSampleOrders,...indiaOrders]));
    collectionStore.replace('users',collectionStore.list('users').map((account)=>account.id==='staff-location'?{...account,name:'Hyderabad Admin',location:'Hyderabad'}:account.id==='staff-store'?{...account,location:'Hyderabad',store:'Gachibowli Store'}:account));
    localStorage.setItem('sample-data-v6-india-fulfilment','complete');
  }
  if(!localStorage.getItem('sample-data-v7-parcels')){
    const carriers=['India Post','DTDC','Delhivery','Blue Dart','APSRTC Parcel','VRL Logistics'];
    const parcelStatuses=['Ready for Dispatch','In Transit','Delivered','Delivery Exception'];
    const orders=JSON.parse(localStorage.getItem('orders')||'[]').map((order,index)=>order.fulfillmentType==='global'&&order.globalApproval==='Approved'?{...order,parcel:{carrier:carriers[index%carriers.length],trackingNumber:`PCL${String(10000000+index)}`,status:parcelStatuses[index%parcelStatuses.length],dispatchedAt:order.createdAt,updatedAt:order.deliveredAt||order.createdAt},...(parcelStatuses[index%parcelStatuses.length]==='Delivered'?{status:'Delivered'}:{})}:order);
    localStorage.setItem('orders',JSON.stringify(orders));localStorage.setItem('sample-data-v7-parcels','complete');
  }
  if(!localStorage.getItem('sample-data-v8-partner-names')){
    const names=['Ravi Kumar','Suresh Reddy','Arjun Rao','Kiran Yadav','Mohammed Ali','Naveen Goud','Vijay Kumar','Ramesh Naik','Sai Teja','Anil Kumar','Rahul Singh','Manoj Das'];
    collectionStore.replace('delivery',collectionStore.list('delivery').map((partner,index)=>String(partner.id).startsWith('india-partner-')?{...partner,name:`${names[index%names.length]}${index>=names.length?` ${Math.floor(index/names.length)+1}`:''}`}:partner));
    localStorage.setItem('sample-data-v8-partner-names','complete');
  }
  if(!localStorage.getItem('sample-data-v9-realistic-catalog')){
    const firstNames=['Aarav','Aditi','Arjun','Ananya','Vikram','Kavya','Rahul','Sneha','Karthik','Priya','Rohan','Meera','Sanjay','Divya','Nikhil','Lakshmi'];const lastNames=['Sharma','Reddy','Rao','Kumar','Patel','Nair','Iyer','Singh','Das','Naidu','Mehta','Menon'];
    const products=collectionStore.list('products').map((item,index)=>{const clean=String(item.name).replace(/\s+\d+$/,'');const offer=index%11===0?{offerType:'Buy X Get Y',buyQuantity:index%22===0?2:1,freeQuantity:1,offerStart:'2026-01-01',offerEnd:'2027-12-31'}:{offerType:'None'};return {...item,name:clean,title:clean,...offer};});
    const productMap=new Map(products.map((item)=>[item.id,item]));collectionStore.replace('products',products);collectionStore.replace('inventory',collectionStore.list('inventory').map((item)=>({...item,name:productMap.get(item.productId)?.name||item.name})));
    collectionStore.replace('customers',collectionStore.list('customers').map((item,index)=>String(item.id).startsWith('india-customer-')?{...item,name:`${firstNames[index%firstNames.length]} ${lastNames[Math.floor(index/firstNames.length)%lastNames.length]}`} : item));
    collectionStore.replace('delivery',collectionStore.list('delivery').map((item,index)=>String(item.id).startsWith('india-partner-')?{...item,vehicleNumber:`${['TS','TN','KA','MH','DL','KL','AP'][index%7]}${String(10+index%80).padStart(2,'0')} ${String.fromCharCode(65+index%26)}${String.fromCharCode(65+(index+7)%26)} ${String(1000+index)}`}:item));
    const customers=collectionStore.list('customers');const stores=collectionStore.list('stores');
    collectionStore.replace('reviews',Array.from({length:300},(_,index)=>({id:`review-${crypto.randomUUID()}`,name:customers[index%customers.length]?.name||'Verified customer',customerId:customers[index%customers.length]?.id,product:products[index%products.length].name,productId:products[index%products.length].id,store:products[index%products.length].store,location:products[index%products.length].location,text:['Fresh, authentic flavour and secure packaging.','Good quality and delivered in excellent condition.','The spice aroma and freshness were excellent.','Well packed and exactly as described.'][index%4],rating:4+(index%2),status:'Approved',createdAt:new Date(Date.now()-index*86400000).toISOString()})));
    collectionStore.replace('coupons',stores.slice(0,60).map((store,index)=>({id:`offer-${crypto.randomUUID()}`,name:`${store.area.replace(/[^A-Z]/gi,'').toUpperCase().slice(0,6)}${10+index%20}`,couponName:`${store.area} seasonal savings`,scope:index%3===0?'Location':'Store',discountType:index%2?'Percentage':'Fixed',discount:index%2?10:75,minimumOrder:399,maximumDiscount:250,startDate:'2026-01-01',expiry:'2027-12-31',usageLimit:500,perUserLimit:2,location:store.location,store:index%3===0?'':store.name,eligibility:'All customers',status:'Active'})));
    collectionStore.replace('banners',stores.slice(0,30).map((store,index)=>({id:`campaign-${crypto.randomUUID()}`,name:`Flavours of ${store.area}`,description:`Authentic favourites available from ${store.area}.`,image:[mangoPickleImg,homeSpicesImg,dryFruitsImg][index%3],mobileImage:[mangoPickleImg,homeSpicesImg,dryFruitsImg][index%3],scope:index%4===0?'Location':'Store',location:store.location,store:index%4===0?'':store.name,startDate:'2026-01-01',endDate:'2027-12-31',status:'Active'})));
    const orders=JSON.parse(localStorage.getItem('orders')||'[]').map((order)=>({...order,items:(order.items||[]).map((item)=>({...item,title:productMap.get(item.id)?.name||String(item.title).replace(/\s+\d+$/,'')})),customer:{...order.customer,name:collectionStore.list('customers').find((customer)=>customer.id===order.customer?.id)?.name||order.customer?.name}}));localStorage.setItem('orders',JSON.stringify(orders));localStorage.setItem('sample-data-v9-realistic-catalog','complete');
  }
  if(!localStorage.getItem('sample-data-v10-global-banners')){
    const bannerImages=[mangoPickleImg,homeSpicesImg,dryFruitsImg,wholeSpicesImg,garlicPickleImg,redChilliImg,lemonPickleImg,pickleJarImg,mangoPickleImg,homeSpicesImg];
    const campaigns=['Traditional Pickle Festival','Freshly Ground Spice Week','Premium Dry Fruit Collection','Whole Spices, Fuller Aroma','Garlic Pickle Special','Kitchen Essentials Sale','Citrus Pickle Favourites','Authentic Andhra Flavours','Family Value Packs','Everyday Spice Essentials'];
    const existing=collectionStore.list('banners').filter((item)=>!String(item.id).startsWith('global-banner-'));
    const globalBanners=campaigns.map((name,index)=>({id:`global-banner-${index+1}`,name,description:['Prepared with traditional recipes and premium ingredients.','Shop customer favourites with delivery across India.','Discover authentic flavours for every meal.'][index%3],image:bannerImages[index],mobileImage:bannerImages[index],scope:'Global',status:'Active',active:true,sortOrder:index+1,startDate:'2026-01-01',endDate:'2027-12-31',createdAt:new Date(Date.now()-index*3600000).toISOString()}));
    collectionStore.replace('banners',[...globalBanners,...existing]);localStorage.setItem('sample-data-v10-global-banners','complete');
  }
};

export const customerProduct = (item, inventory = []) => {
  const stockRecord = inventory.find((entry) => entry.productId === item.id || entry.sku === item.sku || entry.name === item.name);
  const stock = Number(stockRecord?.stock ?? item.stock ?? 0);
  const today=new Date().toISOString().slice(0,10);const offerActive=item.offerType==='Buy X Get Y'&&(!item.offerStart||today>=item.offerStart)&&(!item.offerEnd||today<=item.offerEnd);
  return {...item,...(!offerActive?{offerType:'None'}:{}),title:item.name || item.title,price:item.offerPrice || item.price,weight:item.weight || '500g',stock,outOfStock:stock <= 0};
};
