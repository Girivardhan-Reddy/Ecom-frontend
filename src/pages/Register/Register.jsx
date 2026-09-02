import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import logo from "../../assets/images/logo.png";
import pickel from "../../assets/images/pickel-removebg-preview.png";
import "./Register.css";
import TermsAndConditons from "../../components/TermsAndConditions/TermsAndConditons";
import SmsDisclaimer from "../../components/SmsDisclaimer/SmsDisclaimer";
import { authStore } from '../../services/localDataService';

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    username: "",
    mobileNumber: "",
    email: "",
    password: ""
  });

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Keep only digits
    if (value.length <= 10) {
      setMobileNumber(value);
      if (errors.mobileNumber) {
        setErrors((prev) => ({ ...prev, mobileNumber: "" }));
      }
    }
  };

  const handleNameChange = (e) => {
    setFullName(e.target.value);
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: "" }));
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value.replace(/\s/g, ""));
    if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { fullName: "", username: "", mobileNumber: "", email: "", password: "" };

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }
    }

    if (password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const fullPhone = `${countryCode} ${mobileNumber}`;
      setSubmitError('');
      setIsSubmitting(true);
      try {
        await authStore.requestOtp(fullPhone);
        navigate("/register-otp", { state: { phoneNumber: fullPhone, registration: { fullName, username, email, password } } });
      } catch (requestError) {
        setSubmitError(requestError.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isFormValid = fullName.trim() !== "" && username.trim() !== "" && mobileNumber.trim() !== "" && email.trim() !== "" && password.length >= 8;

  return (
    <Box className="register-wrapper">
      <Box className="register-header">
        <Button
          startIcon={<ArrowBackIcon />}
          className="header-btn back-btn"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button
          className="header-btn skip-btn"
          onClick={() => navigate("/")}
        >
          Skip
        </Button>
      </Box>

      {/* Main Split Layout */}
      <Box className="register-container">

        {/* Left Side: Logo, Banner, Pickle illustration */}
        <Box className="register-left">
          <img src={logo} alt="Pickles & Spices" className="register-logo" />
          <Typography className="banner-title" variant="h4">
            Create Your Account
          </Typography>
          <Typography className="banner-subtitle">
            Join Pickles and Spices to explore our wide range of traditional and authentic products.
          </Typography>
          <img src={pickel} alt="Pickles Plate" className="pickle-image" />
        </Box>

        {/* Right Side: Form inputs */}
        <Box className="register-right">
          <Box className="form-container">
            <Typography className="form-subtitle">
              Please enter your details to get started
            </Typography>

            <form onSubmit={handleSubmit} className="register-form">
              {/* Full Name Input */}
              <Box className="input-group">
                <TextField
                  fullWidth
                  placeholder="Enter Full Name"
                  value={fullName}
                  onChange={handleNameChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  variant="outlined"
                  slotProps={{
                    input: {
                      className: "custom-input"
                    }
                  }}
                />
              </Box>

              <Box className="input-group">
                <TextField
                  fullWidth
                  placeholder="Choose Username"
                  value={username}
                  onChange={handleUsernameChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  variant="outlined"
                />
              </Box>

              {/* Mobile Number Input with Prefix Selector */}
              <Box className="input-group phone-row-container">
                <FormControl className="country-code-control">
                  <Select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    variant="outlined"
                    className="country-select custom-select-input"
                    slotProps={{
                      select: {
                        MenuProps: {
                          PaperProps: {
                            style: {
                              maxHeight: 200,
                            },
                          },
                        },
                      }
                    }}
                  >
                    <MenuItem value="+91">+91</MenuItem>
                    <MenuItem value="+1">+1</MenuItem>
                    <MenuItem value="+44">+44</MenuItem>
                    <MenuItem value="+971">+971</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  placeholder="Enter Mobile Number"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  helperText={errors.mobileNumber}
                  error={!!errors.mobileNumber}
                  variant="outlined"
                  slotProps={{
                    input: {
                      className: "custom-input"
                    }
                  }}
                />
              </Box>

              {/* Email ID Input */}
              <Box className="input-group">
                <TextField
                  fullWidth
                  placeholder="Enter Email ID"
                  value={email}
                  onChange={handleEmailChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  variant="outlined"
                  slotProps={{
                    input: {
                      className: "custom-input"
                    }
                  }}
                />
              </Box>

              <Box className="input-group">
                <TextField
                  fullWidth
                  type="password"
                  placeholder="Create Password (minimum 8 characters)"
                  value={password}
                  onChange={handlePasswordChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  variant="outlined"
                />
              </Box>

              <SmsDisclaimer />

              {/* Get OTP Button */}
              <Button
                type="submit"
                variant="contained"
                className="submit-btn"
                fullWidth
                disabled={!isFormValid || !agreed || isSubmitting}
              >
                {isSubmitting ? 'Sending OTP...' : 'Get OTP'}
              </Button>
              {submitError && <Typography role="alert" sx={{ color: '#b91c1c', mt: 1 }}>{submitError}</Typography>}
              <TermsAndConditons />
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
