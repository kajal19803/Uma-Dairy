import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const Login = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState ({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [fpStep, setFpStep] = useState(1);
  const [fpData, setFpData] = useState({ email: '', otp: '', newPassword: '' });

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFpChange = ({ target: { name, value } }) => {
    setFpData(prev => ({ ...prev, [name]: value }));
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setOtp('');
    setOtpSent(false);
    setIsOtpVerified(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = {};

    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email';

    if (!formData.password) errs.password = 'Password is required';

    if (!isLogin) {
      if (!formData.name.trim()) errs.name = 'Name is required';
      if (formData.password.length < 6) errs.password = 'Password must be 6+ chars';
      if (formData.confirmPassword !== formData.password) errs.confirmPassword = 'Passwords do not match';
      if (!isOtpVerified) {
         if (!otpSent) {
            errs.otp = 'Please send and verify OTP first';
         } else if (!otp || otp.length !== 6) {
            errs.otp = 'Please enter a valid 6-digit OTP';
         }
      }
      if (!formData.termsAccepted) {
         setErrors({ ...errs, termsAccepted: 'You must accept the terms' });
      return;
    }}

    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      if (!isLogin) {
        const chk = await axios.post(`${API_URL}/api/auth/check-user`, { email: formData.email });
        if (chk.data.exists) {
          toast.error('User already exists, please login.');
          setLoading(false);
          return;
        }
      }

      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const res = await axios.post(`${API_URL}/api/auth${endpoint}`, payload);

      if (res.data.token) {
        const user = res.data.user || {};
        localStorage.setItem ('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(user));

        toast.success(isLogin ? 'Login successful!' : 'Registration successful!');

        const isAdmin = user.email === ADMIN_EMAIL;
        localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
        window.dispatchEvent(new Event("userUpdated"));

        navigate(isAdmin ? '/admindashboard' : '/dashboard', { replace: true });
      } else {
        toast.error(res.data.message || 'Authentication failed!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
    setErrors(prev => ({ ...prev, email: 'Enter a valid email before sending OTP' }));
    return;
  }

  try {
    await axios.post(`${API_URL}/api/auth/send-otp`, { email: formData.email });
    toast.success('OTP sent successfully!');
    setOtpSent(true);
  } catch (error) {
    toast.error('Failed to send OTP');
  }
};


  const verifyOtp = async () => {
    try {
      await axios.post(`${API_URL}/api/email-otp/verify`, { email: formData.email, otp });
      toast.success('OTP verified!');
      setIsOtpVerified(true);
    } catch {
      toast.error('OTP verification failed');
    }
  };

  const handleFp = async () => {
    try {
      if (fpStep === 1) {
        if (!fpData.email) {
          toast.error('Please enter your email');
          return;
        }
        await axios.post(`${API_URL}/api/email-otp/send`, { email: fpData.email });
        toast.success('OTP sent to your email');
        setFpStep(2);
      } else if (fpStep === 2) {
        if (!fpData.otp) {
          toast.error('Please enter OTP');
          return;
        }
        await axios.post(`${API_URL}/api/email-otp/verify`, { email: fpData.email, otp: fpData.otp });
        toast.success('OTP verified');
        setFpStep(3);
      } else if (fpStep === 3) {
        if (!fpData.newPassword || fpData.newPassword.length < 6) {
          toast.error('New password must be at least 6 characters');
          return;
        }
        await axios.post(`${API_URL}/api/auth/reset-password`, { email: fpData.email, newPassword: fpData.newPassword });
        toast.success('Password reset successful!');
        setShowForgot(false);
        setFpStep(1);
        setFpData({ email: '', otp: '', newPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error in password reset flow');
    }
  };

  const handleGoogleLoginSuccess = response => {
    axios
      .post(`${API_URL}/api/auth/google`, { token: response.credential })
      .then(res => {
        if (res.data.token) {
          const user = res.data.user;
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(user));

          const isAdmin = user.email === ADMIN_EMAIL;
          localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
          window.dispatchEvent(new Event("userUpdated"));
          toast.success('Google login successful!');
          navigate(isAdmin ? '/admindashboard' : '/dashboard', { replace: true });
        } else {
          toast.error(res.data.message || 'Google login failed!');
        }
      })
      .catch(() => toast.error('Google login error!'));
  };

  const handleGoogleLoginError = () => {
    toast.error('Google login failed!');
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-100 via-green-100 to-teal-200 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-700 text-center mb-6">
          {isLogin ? 'Login to Uma Dairy' : 'Register for Uma Dairy'}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border bg-white border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border bg-white border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

            {!isLogin && (
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpSent}
                className="text-green-600 hover:underline text-sm focus:outline-none bg-transparent p-0 border-0 mt-1"
              >
                {otpSent ? 'OTP Sent' : 'Send OTP'}
              </button>
            )}
          </div>

          {otpSent && !isOtpVerified && !isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full p-2 border bg-white border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Enter the OTP"
              />
              <button
                type="button"
                onClick={verifyOtp}
                className="text-green-600 hover:underline text-sm focus:outline-none bg-transparent p-0 border-0 mt-1"
              >
                Verify OTP
              </button>
              {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
            </div>
          )}

          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type={showPass ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border bg-white border-gray-300 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPass(prev => !prev)}
              className="absolute right-2 bg-transparent border-none outline-none top-[65%] transform -translate-y-1/2 text-gray-600 focus:outline-none focus:ring-0"
              tabIndex={-1}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {!isLogin && (
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                name="confirmPassword"
                type={showConfirmPass ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border bg-white border-gray-300 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(prev => !prev)}
                className="absolute right-2 top-[65%] bg-transparent border-none outline-none transform -translate-y-1/2 text-gray-600 focus:outline-none focus:ring-0"
                tabIndex={-1}
                aria-label={showConfirmPass ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPass ? <EyeSlashIcon className="h-4 bg-white w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          )}
          {!isLogin && (
  <div className="mb-4">
    <label className="flex items-start gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={formData.termsAccepted}
        onChange={(e) =>
          setFormData({ ...formData, termsAccepted: e.target.checked })
        }
        className="mt-1"
      />
      <span>
        I agree to the{' '}
        <Link to="/policy" className="text-green-600 underline hover:text-green-800">
          Terms & Conditions
        </Link>
        .
      </span>
    </label>
    {errors.termsAccepted && (
      <p className="text-red-500 text-sm mt-1">{errors.termsAccepted}</p>
    )}
  </div>
)}


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        {isLogin && (
          <div className="flex justify-end mt-2">
             <button
             onClick={() => setShowForgot(true)}
             className="text-green-600 bg-transparent border-none outline-none hover:underline focus:outline-none focus:ring-0"
             >
             Forgot Password?
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-gray-600 text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={toggleForm} className="text-green-600 focus:outline-none focus:ring-0 hover:underline bg-transparent border-none outline-none text-sm">
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>

        <div className="flex justify-center mt-6">
          <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} />
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded w-96 shadow-lg">
            <h3 className="text-lg font-semibold text-green-700 mb-4">Reset Password</h3>
            {fpStep === 1 && (
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={fpData.email}
                onChange={handleFpChange}
                className="w-full p-2 border bg-white border-gray-300 rounded mb-4"
              />
            )}
            {fpStep === 2 && (
              <input
                name="otp"
                placeholder="Enter OTP"
                value={fpData.otp}
                onChange={handleFpChange}
                className="w-full p-2 border bg-white border-gray-300 rounded mb-4"
              />
            )}
            {fpStep === 3 && (
              <input
                name="newPassword"
                type="password"
                placeholder="New Password"
                value={fpData.newPassword}
                onChange={handleFpChange}
                className="w-full p-2 border bg-white border-gray-300 rounded mb-4"
              />
            )}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowForgot(false);
                  setFpStep(1);
                  setFpData({ email: '', otp: '', newPassword: '' });
                }}
                className="text-green-600 bg-transparent border-none outline-none hover:underline text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleFp}
                className="text-green-600 bg-transparent border-none outline-none hover:underline text-sm"
              >
                {fpStep === 1 ? 'Send OTP' : fpStep === 2 ? 'Verify OTP' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default Login;
