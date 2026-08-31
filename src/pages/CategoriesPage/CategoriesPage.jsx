import { useState, useContext } from 'react';
import { Box, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import BottomNav from '../../components/BottomNav/BottomNav';
import { AppContext } from '../../context/AppContext';
import './CategoriesPage.css';

import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';
import mangoPickleImg from '../../assets/images/mango_pickle_jar.png';
import lemonPickleImg from '../../assets/images/lemon_pickle_jar.png';
import garlicPickleImg from '../../assets/images/garlic_pickle_jar.png';
import redChilliImg from '../../assets/images/red_chilli_powder.png';
import homeSpicesBanner from '../../assets/images/home_spices.png';
import wholeSpicesImg from '../../assets/images/whole_spices.png';
import dryFruitsImg from '../../assets/images/dry_fruits.png';
import traditionalPicklesBanner from '../../assets/images/traditional_pickles.png';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { setSelectedCategory } = useContext(AppContext);

  const [expandedCategory, setExpandedCategory] = useState('Pickles');

  const categoryList = [
    {
      id: 'pickles',
      title: 'Pickles',
      subtitle: 'Authentic homemade traditional pickles',
      mainImage: mangoPickleImg,
      subcategories: [
        { name: 'Mango Pickles', image: mangoPickleImg, categoryKey: 'Pickles' },
        { name: 'Lemon Pickles', image: lemonPickleImg, categoryKey: 'Pickles' },
        { name: 'Garlic Pickles', image: garlicPickleImg, categoryKey: 'Pickles' },
        { name: 'gongura Pickle', image: pickleJarImg, categoryKey: 'Pickles' },
        { name: 'Chillies Pickle', image: redChilliImg, categoryKey: 'Pickles' },
        { name: 'tomato Pickles', image: traditionalPicklesBanner, categoryKey: 'Pickles' },
      ],
    },
    {
      id: 'spice-powders',
      title: 'Spice Powders',
      subtitle: 'Freshly ground aromatic spice powders',
      mainImage: homeSpicesBanner,
      subcategories: [
        { name: 'Turmeric Powder', image: homeSpicesBanner, categoryKey: 'Spice powder' },
        { name: 'Red Chilli Powder', image: redChilliImg, categoryKey: 'Spice powder' },
        { name: 'Coriander Powder', image: homeSpicesBanner, categoryKey: 'Spice powder' },
        { name: 'Garam Masala', image: wholeSpicesImg, categoryKey: 'Spice powder' },
        { name: 'Sambar Powder', image: homeSpicesBanner, categoryKey: 'Spice powder' },
        { name: 'Biryani Masala', image: wholeSpicesImg, categoryKey: 'Spice powder' },
      ],
    },
    {
      id: 'masalas',
      title: 'Masalas',
      subtitle: 'Traditional blends for every recipe',
      mainImage: wholeSpicesImg,
      subcategories: [
        { name: 'Garam Masala Powder', image: wholeSpicesImg, categoryKey: 'Masalas' },
        { name: 'Sambar Masala', image: homeSpicesBanner, categoryKey: 'Masalas' },
        { name: 'Biryani Masala', image: wholeSpicesImg, categoryKey: 'Masalas' },
        { name: 'Rasam Powder', image: homeSpicesBanner, categoryKey: 'Masalas' },
        { name: 'Meat Masala', image: wholeSpicesImg, categoryKey: 'Masalas' },
      ],
    },
    {
      id: 'whole-spices',
      title: 'Whole Spices',
      subtitle: 'Handpicked premium quality spices',
      mainImage: wholeSpicesImg,
      subcategories: [
        { name: 'Whole Clove', image: wholeSpicesImg, categoryKey: 'Whole Masala' },
        { name: 'Cardamom', image: wholeSpicesImg, categoryKey: 'Whole Masala' },
        { name: 'Cinnamon', image: wholeSpicesImg, categoryKey: 'Whole Masala' },
        { name: 'Star Anise', image: wholeSpicesImg, categoryKey: 'Whole Masala' },
        { name: 'Black Pepper', image: wholeSpicesImg, categoryKey: 'Whole Masala' },
      ],
    },
    {
      id: 'dry-fruits',
      title: 'Dry Fruits & Nuts',
      subtitle: 'Premium quality dry fruits and nuts',
      mainImage: dryFruitsImg,
      subcategories: [
        { name: 'Jumbo Cashews', image: dryFruitsImg, categoryKey: 'Dry Fruits' },
        { name: 'California Almonds', image: dryFruitsImg, categoryKey: 'Dry Fruits' },
        { name: 'Afghani Raisins', image: dryFruitsImg, categoryKey: 'Dry Fruits' },
        { name: 'Walnut Kernels', image: dryFruitsImg, categoryKey: 'Dry Fruits' },
        { name: 'Pistachios', image: dryFruitsImg, categoryKey: 'Dry Fruits' },
      ],
    },
  ];

  const handleToggle = (title) => {
    setExpandedCategory((prev) => (prev === title ? null : title));
  };

  const handleSubcategoryClick = (catKey) => {
    setSelectedCategory(catKey);
    navigate('/home');
  };

  return (
    <Box className="categories-page-container">
      <Header />
      <Box className="categories-content-scroll">
        <Typography className="all-categories-title">All categories</Typography>

        <Box className="categories-list">
          {categoryList.map((cat) => {
            const isExpanded = expandedCategory === cat.title;

            return (
              <Box key={cat.id} className="category-accordion-item">
                <Box
                  className="category-header-row"
                  onClick={() => handleToggle(cat.title)}
                >
                  <img
                    src={cat.mainImage}
                    alt={cat.title}
                    className="category-main-thumb"
                  />
                  <Box className="category-text-wrap">
                    <Typography className="category-item-title">
                      {cat.title}
                    </Typography>
                    <Typography className="category-item-subtitle">
                      {cat.subtitle}
                    </Typography>
                  </Box>
                  <Box className="category-chevron">
                    {isExpanded ? (
                      <KeyboardArrowUpIcon style={{ color: '#64748b' }} />
                    ) : (
                      <KeyboardArrowDownIcon style={{ color: '#64748b' }} />
                    )}
                  </Box>
                </Box>

                {isExpanded && (
                  <Box className="subcategory-grid">
                    {cat.subcategories.map((sub, idx) => (
                      <Box
                        key={idx}
                        className="subcategory-item"
                        onClick={() => handleSubcategoryClick(sub.categoryKey)}
                      >
                        <Box className="subcategory-circle-box">
                          <img
                            src={sub.image}
                            alt={sub.name}
                            className="subcategory-circle-img"
                          />
                        </Box>
                        <Typography className="subcategory-name-text">
                          {sub.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
      <BottomNav />
    </Box>
  );
};

export default CategoriesPage;
