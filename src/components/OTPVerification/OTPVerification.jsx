import { useState, useEffect, useRef, useContext } from "react";
import { Box, Button, Typography, Link } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import logo from "../../assets/images/logo.png";
import "./OTPVerification.css";
import TermsAndConditons from "../TermsAndConditions/TermsAndConditons";
import { authStore, DEMO_OTP } from '../../services/localDataService';
import { orgAccessService } from '../../services/orgAccessService';
import { customerProfileService } from '../../services/customerProfileService';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve phone number and isLogin flag from router state, fallback if missing
  const phoneNumber = location.state?.phoneNumber || "+91 9876543210";
  const isLogin = location.state?.isLogin || false;

  // OTP State (6 digits)
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  // Timer State (starts at 59 seconds)
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          const next = prev - 1;
          if (next === 0) setCanResend(true);
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    const numValue = value.replace(/\D/g, "");
    if (!numValue) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const lastChar = numValue[numValue.length - 1];
    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);

    // Auto-focus next box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length >= 6) {
      const digits = pastedData.slice(0, 6).split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    if (canResend) {
      try {
        await authStore.requestOtp(phoneNumber);
        setOtp(Array(6).fill(""));
        setTimer(59);
        setCanResend(false);
        setSubmitError('');
        inputRefs.current[0]?.focus();
      } catch (requestError) {
        setSubmitError(requestError.message);
      }
    }
  };

  const { login, setShowLocationModal } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return setSubmitError('Please enter a valid 6-digit OTP code.');
    setSubmitError('');
    setIsSubmitting(true);
    try {
      let result = await authStore.verifyOtp(phoneNumber, otpCode, location.state?.registration);
      if (!isLogin) {
        const registration = location.state?.registration;
        if (!registration?.username || !registration?.email || !registration?.password) {
          throw new Error('Registration details are missing. Please return to the registration form.');
        }
        const account = await orgAccessService.registerCustomer({
          username: registration.username,
          email: registration.email,
          password: registration.password,
          name: registration.fullName,
          phone: phoneNumber,
        });
        const authenticated = await orgAccessService.login(account.username, registration.password);
        localStorage.setItem('authToken', authenticated.token);
        const profile = await customerProfileService.save({
          name: registration.fullName,
          phone: phoneNumber,
          email: registration.email,
          gender: '',
          dateOfBirth: '',
          photo: null,
        });
        result = { user: { ...authenticated.user, ...profile }, token: authenticated.token, isNewUser: true };
      }
      login(result.user, result.token);
      setShowLocationModal(false);
      navigate(result.isNewUser ? '/language' : '/home', result.isNewUser ? { state: { onboarding: true, returnTo: location.state?.from || '/home' } } : { replace: true });
    } catch (requestError) {
      setSubmitError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <Box className="otp-wrapper">
      {/* Header Bar */}
      <Box className="otp-header">
        <Button
          startIcon={<ArrowBackIcon />}
          className="header-btn back-btn"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button
          className="header-btn skip-btn"
          onClick={() => navigate("/home")}
        >
          Skip
        </Button>
      </Box>

      {/* Centered Verification Content */}
      <Box className="otp-container">
        <Box className="otp-box">
          <img src={logo} alt="Pickles & Spices" className="otp-logo" />

          <Typography className="otp-title" variant="h4">
            Verify with OTP sent to
          </Typography>
          
          <Typography className="otp-phone">
            {phoneNumber}
          </Typography>
          <Typography sx={{ color: '#075F40', fontWeight: 600, mb: 1 }}>Frontend demo OTP: {DEMO_OTP}</Typography>

          <form onSubmit={handleSubmit} className="otp-form">
            <Box className="otp-inputs-row">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className={`otp-digit-input ${digit ? "filled" : ""}`}
                  autoFocus={index === 0}
                />
              ))}
            </Box>

            <Box className="otp-timer-row">
              <Typography className="timer-label">
                Didn't receive the OTP?
              </Typography>
              {canResend ? (
                <Link onClick={handleResend} className="resend-link">
                  Resend OTP
                </Link>
              ) : (
                <Typography className="timer-value">
                  Resend in : <span className="timer-seconds">{timer}</span>
                </Typography>
              )}
            </Box>

            <Button
              type="submit"
              variant="contained"
              className="create-btn"
              fullWidth
              disabled={!isOtpComplete || isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : (isLogin ? "Login" : "Create Account")}
            </Button>
            {submitError && <Typography role="alert" sx={{ color: '#b91c1c', mt: 1 }}>{submitError}</Typography>}
            <TermsAndConditons />
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default OTPVerification;
