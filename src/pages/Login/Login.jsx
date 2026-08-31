import { useContext, useState } from "react";
import { Box, Button, Typography, TextField, MenuItem, Select, FormControl, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import logo from "../../assets/images/logo.png";
import "./Login.css";
import TermsAndConditons from "../../components/TermsAndConditions/TermsAndConditons";
import SmsDisclaimer from "../../components/SmsDisclaimer/SmsDisclaimer";
import { authStore } from '../../services/localDataService';
import { AppContext } from '../../context/AppContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);
  
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMode, setLoginMode] = useState('mobile');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Keep only digits
    if (value.length <= 10) {
      setMobileNumber(value);
      if (error) {
        setError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobileNumber) {
      setError("Mobile number is required");
      return;
    }
    const fullPhone = `${countryCode} ${mobileNumber}`;
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await authStore.requestOtp(fullPhone);
      navigate("/register-otp", { state: { phoneNumber: fullPhone, isLogin: true } });
    } catch (requestError) {
      setSubmitError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = mobileNumber.trim() !== "";

  const handleEmailLogin = async () => {
    setSubmitError(''); setIsSubmitting(true);
    try { const result=await authStore.emailLogin(email,password); login(result.user,result.token); navigate(result.isNewUser ? '/language' : '/home', result.isNewUser ? { state: { onboarding: true } } : undefined); }
    catch (requestError) { setSubmitError(requestError.message); }
    finally { setIsSubmitting(false); }
  };

  const handleSocialLogin = async (provider) => {
    setSubmitError(''); setIsSubmitting(true);
    try { const result=await authStore.socialLogin(provider); login(result.user,result.token); navigate(result.isNewUser ? '/language' : '/home', result.isNewUser ? { state: { onboarding: true } } : undefined); }
    catch (requestError) { setSubmitError(requestError.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Box className="login-wrapper">
      <Box className="login-header">
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
      <Box className="login-container">
        <Box className="login-box">
          <img src={logo} alt="Pickles & Spices" className="login-logo" />

          <Typography className="login-title" variant="h4">
            {loginMode === 'mobile' ? 'Login with your mobile Number' : 'Login with Email'}
          </Typography>
          
          <form onSubmit={handleSubmit} className="login-form">
            
            {loginMode === 'mobile' ? <>{/* Mobile Number Input with Prefix Selector */}
            <Box className="input-group phone-row-container" sx={{ display: 'flex', gap: 2, mb: 2, mt: 3 }}>
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
                helperText={error}
                error={!!error}
                variant="outlined"
                slotProps={{
                  input: {
                    className: "custom-input"
                  }
                }}
              />
            </Box>

            <SmsDisclaimer />

            <Button
              type="submit"
              variant="contained"
              className="submit-btn"
              fullWidth
              disabled={!isFormValid || isSubmitting}
              sx={{ mt: 2, mb: 2 }}
            >
              {isSubmitting ? 'Sending OTP...' : 'Get OTP'}
            </Button>
            </> : <Box sx={{ display:'grid',gap:2,my:3 }}><TextField label="Email Address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /><TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /><Button variant="contained" disabled={isSubmitting} onClick={handleEmailLogin}>{isSubmitting ? 'Signing in...' : 'Login with Email'}</Button></Box>}
            {submitError && <Typography role="alert" sx={{ color: '#b91c1c', mb: 1 }}>{submitError}</Typography>}
            <Button type="button" onClick={() => { setLoginMode(loginMode === 'mobile' ? 'email' : 'mobile'); setSubmitError(''); }} fullWidth>{loginMode === 'mobile' ? 'Use Email Login' : 'Use Mobile Login'}</Button>
            <Typography sx={{ textAlign:'center',my:1 }}>Or continue with</Typography>
            <Box className="social-login-row"><IconButton className="social-login-button" aria-label="Continue with Google" title="Continue with Google" onClick={() => handleSocialLogin('google')}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.7 4.7 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9.1L6.5 14Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.9 1.5l2.9-2.8A9.7 9.7 0 0 0 3.1 7.5l3.4 2.7A5.9 5.9 0 0 1 12 6Z"/></svg></IconButton><IconButton className="social-login-button" aria-label="Continue with Apple" title="Continue with Apple" onClick={() => handleSocialLogin('apple')}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#111" d="M17.1 12.5c0-2.8 2.3-4.1 2.4-4.2a5.1 5.1 0 0 0-4-2.1c-1.7-.2-3.3 1-4.1 1s-2.1-1-3.5-1c-1.8 0-3.5 1.1-4.5 2.7-1.9 3.3-.5 8.2 1.4 10.9.9 1.3 2 2.8 3.5 2.7 1.4-.1 1.9-.9 3.6-.9s2.2.9 3.7.9 2.5-1.3 3.4-2.7a12 12 0 0 0 1.6-3.3 4.6 4.6 0 0 1-3.5-4Zm-2.7-8.1A4.7 4.7 0 0 0 15.5 1a4.8 4.8 0 0 0-3.2 1.6 4.4 4.4 0 0 0-1.1 3.3 4 4 0 0 0 3.2-1.5Z"/></svg></IconButton><IconButton className="social-login-button" aria-label="Continue with Facebook" title="Continue with Facebook" onClick={() => handleSocialLogin('facebook')}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"/><path fill="#fff" d="m16.8 15.5.5-3.5h-3.4V9.8c0-1 .5-1.9 2-1.9h1.5v-3s-1.4-.2-2.7-.2c-2.8 0-4.6 1.7-4.6 4.7V12h-3v3.5h3v8.4a12.2 12.2 0 0 0 3.8 0v-8.4h2.9Z"/></svg></IconButton></Box>
            <TermsAndConditons />
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
