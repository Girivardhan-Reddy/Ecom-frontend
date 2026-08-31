export const STAFF_ROLES = ['super-admin', 'global-admin', 'location-admin', 'store-manager', 'delivery-partner'];

export const ROLE_LABELS = {
  customer: 'Customer',
  'super-admin': 'Super Admin',
  'global-admin': 'Global Admin',
  'location-admin': 'Location Admin',
  'store-manager': 'Store Manager',
  'delivery-partner': 'Delivery Partner',
};

export const ROLE_HIERARCHY = {
  'super-admin': ['global-admin', 'location-admin'],
  'location-admin': ['store-manager', 'delivery-partner'],
};

export const ROLE_MODULES = {
  'super-admin': ['dashboard','locations','users','stores','categories','products','banners','inventory','orders','payments','delivery','notifications','customers','reviews','coupons','reports','security','audit-logs'],
  'global-admin': ['dashboard','orders','payments','customers','reviews','coupons','notifications','banners','reports','audit-logs'],
  'location-admin': ['dashboard','stores','products','banners','inventory','orders','payments','delivery','coupons','reports'],
  'store-manager': ['dashboard','products','banners','inventory','orders','delivery','coupons','reports'],
};

export const canAccessModule = (role, module) => Boolean(ROLE_MODULES[role]?.includes(module));

export const MANAGEABLE_ROLES = {
  'super-admin': ['global-admin','location-admin'],
  'location-admin': ['store-manager','delivery-partner'],
};

export const scopeRecords = (records, user, stores = [], products = []) => {
  if (!Array.isArray(records) || !user || user.role==='super-admin') return records || [];
  if (user.role==='global-admin') return records.some((record)=>(record.items||[]).length) ? records.filter((record)=>record.fulfillmentType==='global') : records;
  const permittedStores = user.store ? [user.store] : stores.filter((store) => store.location === user.location).map((store) => store.name);
  const permittedProducts = products.filter((product) => permittedStores.includes(product.store)).map((product) => product.id);
  return records.filter((record) => {
    const itemIds = (record.items || []).map((item) => item.id);
    if (itemIds.length && record.fulfillmentType==='global' && record.globalApproval!=='Approved') return false;
    if (itemIds.length && user.role==='location-admin') return record.sourceLocation===user.location || record.location===user.location || record.fulfilmentAssignments?.some((assignment)=>assignment.location===user.location) || record.items.some((item)=>item.sourceLocation===user.location);
    if (itemIds.length && user.role==='store-manager') return record.sourceStore===user.store || record.store===user.store || record.fulfilmentAssignments?.some((assignment)=>assignment.store===user.store) || record.items.some((item)=>item.sourceStore===user.store);
    if (user.store && record.name === user.store) return true;
    if (record.role && record.location) return record.location === user.location && (!user.store || record.store === user.store);
    if (record.store) return permittedStores.includes(record.store);
    if (record.location) return record.location === user.location;
    if (record.productId) return permittedProducts.includes(record.productId);
    if (itemIds.length) return itemIds.some((id) => permittedProducts.includes(id));
    return user.role === 'location-admin';
  });
};
