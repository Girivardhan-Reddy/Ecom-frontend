import { Box, Typography } from '@mui/material';
import './CategoryCircle.css';

import pickleJarImg from '../../assets/images/pickel-removebg-preview.png';

const CategoryCircle = ({ title, image, onClick }) => {
  const circleImg = image || pickleJarImg;
  return (
    <Box className="category-circle-container" onClick={onClick} style={{ cursor: 'pointer' }}>
      <Box className="category-circle">
        <img src={circleImg} alt={title} className="category-circle-img" />
      </Box>
      <Typography className="category-circle-title">{title}</Typography>
    </Box>
  );
};

export default CategoryCircle;
