import { createContext, useState, useEffect } from 'react';
import { reverseGeocodeOpenStreetMap } from '../services/openStreetMapService';
import { customerProfileService } from '../services/customerProfileService';
import { collectionStore } from '../services/localDataService';
import { getProducts, getCategories, getCategoryProducts } from '../services/catalogApi';
import { adaptProductList, adaptCategoryList } from '../services/catalogAdapter';
import { dummyCatalogEnabled, dummyCategories, filterDummyProducts } from '../services/dummyCatalog';
import { addCartItem, calculateCartTotal, clearCartItems, createCart, getActiveCart, removeCartItem, updateCartItem } from '../services/cartApi';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('isLoggedIn');
    return saved === 'true';
  });

  const [cartItems, setCartItems] = useState([]);
  const [activeCart, setActiveCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const [cartUnavailable, setCartUnavailable] = useState(false);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('wishlistItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem('addresses');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedForLater, setSavedForLater] = useState(() => {
    const saved = localStorage.getItem('savedForLater');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userCity, setUserCity] = useState('Hyderabad, Telangana');
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Home, Dno: 401, indira nagar, colony, Gachibowli , Hy..'
  );
  const [showLocationModal, setShowLocationModal] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const cartTotal = Number(activeCart?.totalAmount ?? 0);

  const resolveProductIdentity = (product) => {
    const variant = product?.variant || product?.selectedVariant || product?.variants?.[0] || {};
    return {
      productId: product?.productId || product?.id || variant?.productId || null,
      variantId: product?.variantId ?? variant?.variantId ?? variant?.id ?? null,
    };
  };

  const sameCatalogItem = (left, right) =>
    Boolean(left?.productId && right?.productId && left.productId === right.productId && (left.variantId ?? null) === (right.variantId ?? null));

  const catalogItemKey = (item) => `${item?.productId || ''}:${item?.variantId ?? 'product'}`;

  const adaptCartItem = (item) => ({
    ...item,
    id: item?.id || null,
    productId: item?.productId || null,
    variantId: item?.variantId ?? null,
    productName: item?.productName || 'Product',
    quantity: Number(item?.quantity || 0),
    unitPrice: Number(item?.unitPrice || 0),
    totalPrice: Number(item?.totalPrice ?? Number(item?.unitPrice || 0) * Number(item?.quantity || 0)),
    title: item?.productName || 'Product',
    price: Number(item?.unitPrice || 0),
    weight: item?.variantId == null ? 'Product-level item' : String(item.variantId),
  });

  const cartItemsFromResponse = (cart) => {
    const items = Array.isArray(cart?.items) ? cart.items : Array.isArray(cart?.cartItems) ? cart.cartItems : [];
    return items.map(adaptCartItem);
  };

  const applyCartResponse = (cart) => {
    setActiveCart(cart || null);
    setCartItems(cartItemsFromResponse(cart));
    setCartUnavailable(false);
    setCartError('');
    return cart;
  };

  const isCartServiceUnavailable = (error) => error?.name === 'TypeError' || Number(error?.status) >= 500;

  const buildCartItem = (product) => {
    if (!product) return null;
    const identity = resolveProductIdentity(product);
    if (!identity.productId) return null;
    const variant = product.variant || product.selectedVariant || product.variants?.find((item) => (item.variantId || item.id) === identity.variantId) || product.variants?.[0] || {};
    return {
      ...product,
      id: identity.productId,
      productId: identity.productId,
      variantId: identity.variantId,
      productName: product.productName || product.title || product.name || 'Product',
      title: product.title || product.name || 'Product',
      weight: product.weight || variant.label || variant.weight || variant.name || '',
      unitPrice: Number(variant.price ?? product.unitPrice ?? product.price ?? 0),
      price: Number(variant.price ?? product.unitPrice ?? product.price ?? 0),
      image: product.image || variant.image || '',
    };
  };

  const resolveCartStoreId = (product) => {
    if (product?.storeId) return product.storeId;
    const selectedStore = localStorage.getItem('selectedStore');
    const stores = collectionStore.list('stores');
    const match = stores.find((store) => store.id === selectedStore || store.name === selectedStore);
    return match?.id || stores.find((store) => store.status !== 'Inactive' && store.active !== false)?.id || null;
  };

  const cartScopeFor = (product) => ({
    customerId: user?.id || null,
    storeId: resolveCartStoreId(product),
  });

  const loadCatalog = async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProducts({ status: 'ACTIVE' }),
        getCategories(),
      ]);
      setCatalogProducts(adaptProductList(productsResponse || []));
      setCatalogCategories(adaptCategoryList(categoriesResponse || []));
    } catch (error) {
      const useDummyCatalog = dummyCatalogEnabled();
      console.warn('Catalog API unavailable.', error);
      setCatalogProducts(useDummyCatalog ? adaptProductList(filterDummyProducts()) : []);
      setCatalogCategories(useDummyCatalog ? adaptCategoryList(dummyCategories) : []);
      setCatalogError(useDummyCatalog ? null : error.message || 'The catalog service is unavailable.');
    } finally {
      setCatalogLoading(false);
    }
  };

  const loadCatalogProducts = async (params = {}) => {
    let response;
    try {
      response = await getProducts(params);
    } catch (error) {
      if (!dummyCatalogEnabled()) throw error;
      response = filterDummyProducts(params);
    }
    const products = adaptProductList(response || []);
    setCatalogProducts(products);
    return products;
  };

  const loadCategoryProducts = async (categoryId, params = {}) => {
    let response;
    try {
      response = await getCategoryProducts(categoryId, params);
    } catch (error) {
      if (!dummyCatalogEnabled()) throw error;
      response = filterDummyProducts({ ...params, categoryId });
    }
    return adaptProductList(response || []);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCatalog();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => localStorage.setItem('user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems)), [wishlistItems]);
  useEffect(() => localStorage.setItem('addresses', JSON.stringify(addresses)), [addresses]);
  useEffect(() => {
    if (!isLoggedIn || !localStorage.getItem('authToken')) return;
    customerProfileService.addresses().then((items) => {
      const mapped = items.map((item) => ({ ...item, isDefault: item.defaultAddress, coordinates: item.latitude != null && item.longitude != null ? { lat:item.latitude, lng:item.longitude } : null, manualLocation: item.street ? { street:item.street, city:item.city || '', state:item.state || '', pincode:item.pincode || '' } : null }));
      setAddresses(mapped);
      const selected = mapped.find((item) => item.isDefault) || mapped[0];
      if (selected) setDeliveryAddress(selected.address);
    }).catch((error) => console.warn('Could not load addresses:', error.message));
  }, [isLoggedIn]);
  useEffect(() => localStorage.setItem('savedForLater', JSON.stringify(savedForLater)), [savedForLater]);

  const login = (authenticatedUser, token) => {
    setUser(authenticatedUser || null);
    if (authenticatedUser?.locale) updateLocale(authenticatedUser.locale);
    if (token) localStorage.setItem('authToken', token);
    setIsLoggedIn(true);
  };
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('authToken');
    setCartItems([]);
  };

  const [addedToCartPopup, setAddedToCartPopup] = useState(null);

  const triggerAddedPopup = (item) => {
    setAddedToCartPopup({
      show: true,
      product: item,
      timestamp: Date.now(),
    });
  };

  const closeAddedPopup = () => {
    setAddedToCartPopup(null);
  };

  const loadCart = async (scopeProduct) => {
    const scope = cartScopeFor(scopeProduct);
    if (!scope.customerId || !scope.storeId) {
      setActiveCart(null);
      setCartItems([]);
      setCartUnavailable(false);
      setCartError(scope.customerId ? 'Select a store before using the cart.' : 'Log in to use your cart.');
      return null;
    }
    setCartLoading(true);
    try {
      const cart = await getActiveCart(scope);
      return applyCartResponse(cart);
    } catch (error) {
      setActiveCart(null);
      setCartItems([]);
      if (error.status === 404) {
        setCartUnavailable(false);
        setCartError('');
        return null;
      }
      setCartUnavailable(isCartServiceUnavailable(error));
      setCartError(error.message || 'Cart Service is unavailable.');
      return null;
    } finally {
      setCartLoading(false);
    }
  };

  const ensureCart = async (scopeProduct) => {
    const scope = cartScopeFor(scopeProduct);
    if (!scope.customerId) throw new Error('Log in to use your cart.');
    if (!scope.storeId) throw new Error('Select a store before using the cart.');
    if (activeCart?.id && activeCart.customerId === scope.customerId && activeCart.storeId === scope.storeId && activeCart.status === 'ACTIVE') return activeCart;
    try {
      const cart = await getActiveCart(scope);
      return applyCartResponse(cart);
    } catch (error) {
      if (error.status !== 404) throw error;
      const cart = await createCart({ customerId: scope.customerId, storeId: scope.storeId });
      return applyCartResponse(cart);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !user?.id) {
      return undefined;
    }
    let ignore = false;
    const timer = window.setTimeout(() => {
      if (ignore) return;
      setCartLoading(true);
      loadCart().finally(() => {
        if (!ignore) setCartLoading(false);
      });
    }, 0);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [isLoggedIn, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshCartTotal = async (cartId) => {
    const cart = await calculateCartTotal(cartId);
    return applyCartResponse(cart);
  };

  const addToCart = async (product) => {
    const itemPayload = buildCartItem(product);
    if (!itemPayload) return;
    setCartLoading(true);
    try {
      const cart = await ensureCart(product);
      await addCartItem(cart.id, {
        productId: itemPayload.productId,
        variantId: itemPayload.variantId,
        productName: itemPayload.productName,
        quantity: 1,
        unitPrice: itemPayload.unitPrice,
      });
      await refreshCartTotal(cart.id);
      triggerAddedPopup(itemPayload);
    } catch (error) {
      setCartUnavailable(isCartServiceUnavailable(error));
      setCartError(error.message || 'Cart Service is unavailable.');
    } finally {
      setCartLoading(false);
    }
  };

  const updateQuantity = async (productId, variantId, delta) => {
    const current = cartItems.find((item) => sameCatalogItem(item, { productId, variantId }));
    if (!activeCart?.id || !current?.id) return;
    const nextQuantity = Number(current.quantity || 0) + Number(delta || 0);
    setCartLoading(true);
    try {
      if (nextQuantity <= 0) {
        await removeCartItem(activeCart.id, current.id);
      } else {
        await updateCartItem(activeCart.id, current.id, { quantity: nextQuantity });
      }
      await refreshCartTotal(activeCart.id);
    } catch (error) {
      setCartUnavailable(isCartServiceUnavailable(error));
      setCartError(error.message || 'Cart Service is unavailable.');
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (productId, variantId) => {
    const current = cartItems.find((item) => sameCatalogItem(item, { productId, variantId }));
    if (!activeCart?.id || !current?.id) return;
    setCartLoading(true);
    try {
      await removeCartItem(activeCart.id, current.id);
      await refreshCartTotal(activeCart.id);
    } catch (error) {
      setCartUnavailable(isCartServiceUnavailable(error));
      setCartError(error.message || 'Cart Service is unavailable.');
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = async () => {
    if (!activeCart?.id) return;
    setCartLoading(true);
    try {
      await clearCartItems(activeCart.id);
      await refreshCartTotal(activeCart.id);
    } catch (error) {
      setCartUnavailable(isCartServiceUnavailable(error));
      setCartError(error.message || 'Cart Service is unavailable.');
    } finally {
      setCartLoading(false);
    }
  };
  const toggleWishlist = (product) => setWishlistItems((items) => {
    const itemPayload = buildCartItem(product);
    if (!itemPayload) return items;
    const exists = items.some((item) => sameCatalogItem(item, itemPayload));
    return exists ? items.filter((item) => !sameCatalogItem(item, itemPayload)) : [...items, itemPayload];
  });
  const moveWishlistToCart = (product) => {
    addToCart(product);
    const itemPayload = buildCartItem(product);
    setWishlistItems((items) => items.filter((item) => !sameCatalogItem(item, itemPayload)));
  };
  const saveItemForLater = (product) => {
    setSavedForLater((items) => items.some((item) => sameCatalogItem(item, product)) ? items : [...items, product]);
    removeFromCart(product.productId, product.variantId);
  };
  const restoreSavedItem = (product) => {
    addToCart(product);
    setSavedForLater((items) => items.filter((item) => !sameCatalogItem(item, product)));
  };
  const addAddress = async (address) => {
    const saved = await customerProfileService.createAddress({ ...address, isDefault: addresses.length === 0 || address.isDefault });
    const next = { ...saved, isDefault:saved.defaultAddress, coordinates:saved.latitude != null ? {lat:saved.latitude,lng:saved.longitude}:null, manualLocation:saved.street?{street:saved.street,city:saved.city||'',state:saved.state||'',pincode:saved.pincode||''}:null };
    setAddresses((items) => next.isDefault ? [...items.map((item)=>({...item,isDefault:false})),next] : [...items,next]);
    if(next.isDefault) setDeliveryAddress(next.address); return next;
  };
  const deleteAddress = async (id) => { await customerProfileService.deleteAddress(id); const remaining=addresses.filter((item)=>item.id!==id); if(remaining.length&&!remaining.some((item)=>item.isDefault))remaining[0]={...remaining[0],isDefault:true}; setAddresses(remaining); setDeliveryAddress((remaining.find((item)=>item.isDefault)||remaining[0])?.address||''); };
  const setDefaultAddress = async (id) => { const saved=await customerProfileService.setDefaultAddress(id); setAddresses((items)=>items.map((item)=>({...item,isDefault:item.id===id}))); setDeliveryAddress(saved.address); };
  const updateAddress = async (id,address) => { const saved=await customerProfileService.updateAddress(id,{...address,isDefault:addresses.find((item)=>item.id===id)?.isDefault}); const next={...saved,isDefault:saved.defaultAddress,coordinates:saved.latitude!=null?{lat:saved.latitude,lng:saved.longitude}:null,manualLocation:saved.street?{street:saved.street,city:saved.city||'',state:saved.state||'',pincode:saved.pincode||''}:null}; setAddresses((items)=>items.map((item)=>item.id===id?next:item)); if(next.isDefault)setDeliveryAddress(next.address); return next; };

  const [locale, setLocale] = useState(() => ({ language:localStorage.getItem('language') || 'English', currency:localStorage.getItem('currency') || 'INR', timeZone:localStorage.getItem('timeZone') || Intl.DateTimeFormat().resolvedOptions().timeZone }));
  const translations = {
    English: { home:'Home',categories:'Categories',profile:'Profile',wishlist:'Wishlist',cart:'Cart',notifications:'Notifications',search:'Search products' },
    Hindi: { home:'होम',categories:'श्रेणियाँ',profile:'प्रोफ़ाइल',wishlist:'पसंदीदा',cart:'कार्ट',notifications:'सूचनाएँ',search:'उत्पाद खोजें' },
    Telugu: { home:'హోమ్',categories:'వర్గాలు',profile:'ప్రొఫైల్',wishlist:'కోరికల జాబితా',cart:'కార్ట్',notifications:'నోటిఫికేషన్లు',search:'ఉత్పత్తులను వెతకండి' },
  };
  Object.assign(translations, {
    English: { home:'Home',categories:'Categories',profile:'Profile',wishlist:'Wishlist',cart:'Cart',notifications:'Notifications',search:'Search products',language:'Language',deliverTo:'Deliver to',login:'Login',heroTitle:'Authentic Pickles, Premium Spices & Traditional Flavours',heroSubtitle:'Handcrafted with traditional recipes and the finest ingredients.',bestSellers:'Our Best Sellers',featured:'Featured Products',special:'Special Products',newArrivals:'New Arrivals',recommended:'Recommended for You',shopCategories:'Shop By Categories',traditionalPickles:'Traditional Pickles',homeSpices:'Home spices',whyUs:'Why Us',viewAll:'View All',noProducts:'No products found' },
    Hindi: { home:'होम',categories:'श्रेणियां',profile:'प्रोफ़ाइल',wishlist:'पसंदीदा',cart:'कार्ट',notifications:'सूचनाएं',search:'उत्पाद खोजें',language:'भाषा',deliverTo:'डिलीवरी स्थान',login:'लॉग इन',heroTitle:'पारंपरिक अचार, प्रीमियम मसाले और असली स्वाद',heroSubtitle:'पारंपरिक व्यंजनों और बेहतरीन सामग्री से हस्तनिर्मित।',bestSellers:'हमारे सबसे लोकप्रिय उत्पाद',featured:'विशेष उत्पाद',special:'खास उत्पाद',newArrivals:'नए उत्पाद',recommended:'आपके लिए सुझाव',shopCategories:'श्रेणी के अनुसार खरीदें',traditionalPickles:'पारंपरिक अचार',homeSpices:'घरेलू मसाले',whyUs:'हमें क्यों चुनें',viewAll:'सभी देखें',noProducts:'कोई उत्पाद नहीं मिला' },
    Telugu: { home:'హోమ్',categories:'వర్గాలు',profile:'ప్రొఫైల్',wishlist:'కోరికల జాబితా',cart:'కార్ట్',notifications:'నోటిఫికేషన్లు',search:'ఉత్పత్తులను వెతకండి',language:'భాష',deliverTo:'డెలివరీ చిరునామా',login:'లాగిన్',heroTitle:'సాంప్రదాయ పచ్చళ్ళు, ప్రీమియం మసాలాలు మరియు అసలైన రుచులు',heroSubtitle:'సాంప్రదాయ వంటకాలతో, ఉత్తమ పదార్థాలతో చేతితో తయారు చేసినవి.',bestSellers:'మా అత్యధికంగా అమ్ముడైనవి',featured:'ప్రత్యేక ఉత్పత్తులు',special:'విశిష్ట ఉత్పత్తులు',newArrivals:'కొత్త ఉత్పత్తులు',recommended:'మీ కోసం సిఫార్సులు',shopCategories:'వర్గాల వారీగా కొనండి',traditionalPickles:'సాంప్రదాయ పచ్చళ్ళు',homeSpices:'ఇంటి మసాలాలు',whyUs:'మమ్మల్ని ఎందుకు ఎంచుకోవాలి',viewAll:'అన్నీ చూడండి',noProducts:'ఉత్పత్తులు కనబడలేదు' },
  });
  const updateLocale = (next) => {
    const value = { ...locale, ...next };
    setLocale(value);
    localStorage.setItem('language',value.language); localStorage.setItem('currency',value.currency); localStorage.setItem('timeZone',value.timeZone);
    document.documentElement.lang = value.language === 'Hindi' ? 'hi' : value.language === 'Telugu' ? 'te' : 'en';
  };
  const t = (key) => translations[locale.language]?.[key] || translations.English[key] || key;
  const formatCurrency = (amount) => new Intl.NumberFormat(locale.language === 'Hindi' ? 'hi-IN' : locale.language === 'Telugu' ? 'te-IN' : 'en-IN', { style:'currency',currency:locale.currency }).format(Number(amount));
  const formatDateTime = (value, options = {}) => new Intl.DateTimeFormat(locale.language === 'Hindi' ? 'hi-IN' : locale.language === 'Telugu' ? 'te-IN' : 'en-IN', { timeZone:locale.timeZone, ...options }).format(new Date(value));

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const detectUserLocation = (onSuccess) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const data = await reverseGeocodeOpenStreetMap(latitude, longitude);
            if (data) {
              setUserCity([data.title, data.city].filter(Boolean).join(', '));
              setDeliveryAddress(`Home, ${data.address}`);
            } else {
              setUserCity(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
              setDeliveryAddress(`Current location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
          } catch (err) {
            console.warn('Reverse geocoding failed:', err);
            setUserCity(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            setDeliveryAddress(`Current location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
          if (onSuccess) onSuccess();
        },
        (error) => {
          console.warn('Geolocation permission/error:', error.message);
          setUserCity('Jubliee Hills, Hyderabad');
          setDeliveryAddress('Home, Dno: 401, Jubliee Hills, Hyderabad, Telangana 500033');
          if (onSuccess) onSuccess();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserCity('Jubliee Hills, Hyderabad');
      if (onSuccess) onSuccess();
    }
  };

  useEffect(()=>{
    if(sessionStorage.getItem('customer-location-detected')) return;
    sessionStorage.setItem('customer-location-detected','requested');
    const timer=setTimeout(()=>detectUserLocation(()=>sessionStorage.setItem('customer-location-detected','complete')),0);
    return()=>clearTimeout(timer);
  },[]);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        user,
        setUser,
        login,
        logout,
        cartCount,
        cartItems,
        activeCart,
        cartTotal,
        cartLoading,
        cartError,
        cartUnavailable,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        catalogProducts,
        catalogCategories,
        catalogLoading,
        catalogError,
        loadCatalog,
        loadCatalogProducts,
        loadCategoryProducts,
        resolveProductIdentity,
        sameCatalogItem,
        catalogItemKey,
        wishlistItems,
        toggleWishlist,
        moveWishlistToCart,
        savedForLater,
        saveItemForLater,
        restoreSavedItem,
        addresses,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        updateAddress,
        addedToCartPopup,
        triggerAddedPopup,
        closeAddedPopup,
        isCartOpen,
        openCart,
        closeCart,
        selectedCategory,
        setSelectedCategory,
        selectedProduct,
        setSelectedProduct,
        userCity,
        setUserCity,
        homeSearchQuery,
        setHomeSearchQuery,
        deliveryAddress,
        setDeliveryAddress,
        showLocationModal,
        setShowLocationModal,
        detectUserLocation,
        locale,
        updateLocale,
        t,
        formatCurrency,
        formatDateTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
