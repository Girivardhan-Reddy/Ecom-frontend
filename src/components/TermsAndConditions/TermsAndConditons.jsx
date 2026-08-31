import { Typography, Link, Box } from "@mui/material";
import "./TermsAndConditons.css";

const TermsAndConditons = () => {
  return (
    <Box className="footer-wrapper">
      <Typography className="footer-agreement-text">
        By creating an account, you agree to our{" "}
        <Link
          href="#"
          className="policy-link"
          underline="none"
        >
          Terms & Conditions
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="policy-link"
          underline="none"
        >
          Privacy Policy
        </Link>
      </Typography>
    </Box>
  );
};

export default TermsAndConditons;