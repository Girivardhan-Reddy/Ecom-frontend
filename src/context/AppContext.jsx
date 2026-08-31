import { createContext, useState, useEffect } from 'react';
import { reverseGeocodeOpenStreetMap } from '../services/openStreetMapService';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('isLoggedIn');
    return saved === 'true';
  });

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });

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

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => localStorage.setItem('user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems)), [wishlistItems]);
  useEffect(() => localStorage.setItem('addresses', JSON.stringify(addresses)), [addresses]);
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

  const addToCart = (product) => {
    const itemToAdd = (product && product.title) ? product : {
      id: 'default-1',
      title: "Avakaya Pickle",
      weight: '500g',
      price: '199',
      image: ''
    };

    triggerAddedPopup(itemToAdd);

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.title === itemToAdd.title && item.weight === itemToAdd.weight);
      if (existing) {
        return prevItems.map((item) =>
          item.title === itemToAdd.title && item.weight === itemToAdd.weight ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
  };

  const updateQuantity = (title, delta, weight) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.title === title && (!weight || item.weight === weight)) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (title, weight) => setCartItems((items) => items.filter((item) => item.title !== title || (weight && item.weight !== weight)));
  const toggleWishlist = (product) => setWishlistItems((items) => {
    const exists = items.some((item) => item.title === product.title);
    return exists ? items.filter((item) => item.title !== product.title) : [...items, product];
  });
  const moveWishlistToCart = (product) => {
    addToCart(product);
    setWishlistItems((items) => items.filter((item) => item.title !== product.title));
  };
  const saveItemForLater = (product) => {
    setSavedForLater((items) => items.some((item) => item.title === product.title) ? items : [...items, product]);
    removeFromCart(product.title, product.weight);
  };
  const restoreSavedItem = (product) => {
    addToCart(product);
    setSavedForLater((items) => items.filter((item) => item.title !== product.title));
  };
  const addAddress = (address) => setAddresses((items) => {
    const next = { ...address, id: address.id || crypto.randomUUID(), isDefault: items.length === 0 || address.isDefault };
    return next.isDefault ? [...items.map((item) => ({ ...item, isDefault: false })), next] : [...items, next];
  });
  const deleteAddress = (id) => setAddresses((items) => {
    const removed = items.find((item) => item.id === id);
    const remaining = items.filter((item) => item.id !== id);
    if (removed?.isDefault && remaining.length) {
      remaining[0] = { ...remaining[0], isDefault: true };
      setDeliveryAddress(remaining[0].address);
    }
    if (!remaining.length) setDeliveryAddress('');
    return remaining;
  });
  const setDefaultAddress = (id) => setAddresses((items) => {
    const selected = items.find((item) => item.id === id);
    if (selected) setDeliveryAddress(selected.address);
    return items.map((item) => ({ ...item, isDefault: item.id === id }));
  });
  const updateAddress = (id, address) => setAddresses((items) => items.map((item) => item.id === id ? { ...item, ...address, id } : item));

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userCity, setUserCity] = useState('Hyderabad, Telangana');
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Home, Dno: 401, indira nagar, colony, Gachibowli , Hy..'
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
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
        addToCart,
        updateQuantity,
        removeFromCart,
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
